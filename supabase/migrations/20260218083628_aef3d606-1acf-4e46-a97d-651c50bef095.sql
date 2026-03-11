
-- Sessions de jeu
CREATE TABLE public.sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_number serial,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'drawing', 'completed', 'cancelled')),
  max_players integer NOT NULL DEFAULT 20,
  current_players integer NOT NULL DEFAULT 0,
  pot integer NOT NULL DEFAULT 0,
  entry_fee integer NOT NULL DEFAULT 1000,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '20 minutes')
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view sessions" ON public.sessions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "System inserts sessions" ON public.sessions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "System updates sessions" ON public.sessions FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Participations
CREATE TABLE public.participations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rank integer,
  winnings integer NOT NULL DEFAULT 0,
  joined_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their participations" ON public.participations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join sessions" ON public.participations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System updates participations" ON public.participations FOR UPDATE USING (auth.uid() = user_id);

-- Unique constraint: one participation per user per session
CREATE UNIQUE INDEX idx_participation_unique ON public.participations(session_id, user_id);

-- Transactions
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('mise', 'gain', 'parrainage', 'cashback', 'bonus', 'remboursement', 'recharge', 'retrait')),
  amount integer NOT NULL,
  label text NOT NULL,
  session_id uuid REFERENCES public.sessions(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime for sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;

-- Function: join a session (debit balance, add participation, update session)
CREATE OR REPLACE FUNCTION public.join_session(p_session_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_balance integer;
  v_fee integer;
  v_current integer;
  v_max integer;
  v_status text;
BEGIN
  -- Check session
  SELECT status, current_players, max_players, entry_fee INTO v_status, v_current, v_max, v_fee
  FROM sessions WHERE id = p_session_id FOR UPDATE;

  IF v_status IS NULL THEN
    RETURN json_build_object('error', 'Session introuvable');
  END IF;
  IF v_status != 'waiting' THEN
    RETURN json_build_object('error', 'Session non disponible');
  END IF;
  IF v_current >= v_max THEN
    RETURN json_build_object('error', 'Session complète');
  END IF;

  -- Check not already joined
  IF EXISTS (SELECT 1 FROM participations WHERE session_id = p_session_id AND user_id = v_user_id) THEN
    RETURN json_build_object('error', 'Déjà inscrit');
  END IF;

  -- Check balance
  SELECT balance INTO v_balance FROM profiles WHERE user_id = v_user_id FOR UPDATE;
  IF v_balance < v_fee THEN
    RETURN json_build_object('error', 'Solde insuffisant');
  END IF;

  -- Debit
  UPDATE profiles SET balance = balance - v_fee, weekly_spending = weekly_spending + v_fee WHERE user_id = v_user_id;

  -- Record transaction
  INSERT INTO transactions (user_id, type, amount, label, session_id) VALUES (v_user_id, 'mise', -v_fee, 'Mise Session #' || (SELECT session_number FROM sessions WHERE id = p_session_id), p_session_id);

  -- Add participation
  INSERT INTO participations (session_id, user_id) VALUES (p_session_id, v_user_id);

  -- Update session
  UPDATE sessions SET current_players = current_players + 1 WHERE id = p_session_id;

  -- Check if session is full -> start draw
  IF v_current + 1 >= v_max THEN
    UPDATE sessions SET status = 'active', started_at = now() WHERE id = p_session_id;
  END IF;

  RETURN json_build_object('success', true, 'new_balance', v_balance - v_fee);
END;
$$;

-- Function: execute draw and distribute winnings
CREATE OR REPLACE FUNCTION public.execute_draw(p_session_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pot integer;
  v_gains integer;
  v_status text;
  v_participant record;
  v_rank integer := 0;
  v_winnings integer;
  v_session_number integer;
BEGIN
  SELECT status, pot, current_players, entry_fee, session_number INTO v_status, v_pot, v_rank, v_winnings, v_session_number
  FROM sessions WHERE id = p_session_id FOR UPDATE;

  -- Recalculate pot
  v_pot := v_rank * v_winnings; -- current_players * entry_fee
  v_gains := (v_pot * 55) / 100; -- 55% for winners

  IF v_status NOT IN ('active', 'waiting') THEN
    RETURN json_build_object('error', 'Session non éligible au tirage');
  END IF;

  UPDATE sessions SET status = 'drawing' WHERE id = p_session_id;

  -- Assign random ranks
  v_rank := 0;
  FOR v_participant IN
    SELECT id, user_id FROM participations WHERE session_id = p_session_id ORDER BY random()
  LOOP
    v_rank := v_rank + 1;

    -- Calculate winnings based on rank (top 50% get gains, minimum 1200 Ar)
    IF v_rank <= GREATEST(1, (SELECT current_players / 2 FROM sessions WHERE id = p_session_id)) THEN
      -- Distribute proportionally: rank 1 gets most
      v_winnings := GREATEST(1200, v_gains / v_rank);
    ELSE
      v_winnings := 0;
    END IF;

    UPDATE participations SET rank = v_rank, winnings = v_winnings WHERE id = v_participant.id;

    IF v_winnings > 0 THEN
      UPDATE profiles SET balance = balance + v_winnings, total_winnings = total_winnings + v_winnings WHERE user_id = v_participant.user_id;
      INSERT INTO transactions (user_id, type, amount, label, session_id) VALUES (v_participant.user_id, 'gain', v_winnings, 'Gain Session #' || v_session_number || ' - Rang #' || v_rank, p_session_id);
    END IF;
  END LOOP;

  -- Update session stats
  UPDATE sessions SET status = 'completed', completed_at = now(), pot = v_pot WHERE id = p_session_id;

  -- Update player stats
  UPDATE profiles SET total_sessions = total_sessions + 1 WHERE user_id IN (SELECT user_id FROM participations WHERE session_id = p_session_id);

  RETURN json_build_object('success', true, 'pot', v_pot, 'winners', v_rank);
END;
$$;

-- Function: cancel expired sessions and refund
CREATE OR REPLACE FUNCTION public.cancel_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_session record;
  v_participant record;
BEGIN
  FOR v_session IN
    SELECT id, entry_fee, session_number FROM sessions WHERE status = 'waiting' AND expires_at < now()
  LOOP
    FOR v_participant IN
      SELECT user_id FROM participations WHERE session_id = v_session.id
    LOOP
      UPDATE profiles SET balance = balance + v_session.entry_fee WHERE user_id = v_participant.user_id;
      INSERT INTO transactions (user_id, type, amount, label, session_id) VALUES (v_participant.user_id, 'remboursement', v_session.entry_fee, 'Remboursement Session #' || v_session.session_number, v_session.id);
    END LOOP;

    UPDATE sessions SET status = 'cancelled', completed_at = now() WHERE id = v_session.id;
  END LOOP;
END;
$$;
