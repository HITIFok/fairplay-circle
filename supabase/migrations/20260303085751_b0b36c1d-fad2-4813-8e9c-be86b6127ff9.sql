
-- Table de configuration globale du jeu
CREATE TABLE public.game_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read settings"
ON public.game_settings FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage settings"
ON public.game_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Insérer les paramètres par défaut
INSERT INTO public.game_settings (key, value) VALUES
  ('win_rate', '55'),
  ('entry_fee', '1000'),
  ('max_players', '20'),
  ('min_guaranteed_win', '1200'),
  ('jackpot_percent', '10'),
  ('referral_percent', '5'),
  ('loyalty_percent', '3');

-- Colonne pour approuver les joueurs (par défaut approuvé)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT true;

-- Fonction admin : changer statut VIP d'un joueur
CREATE OR REPLACE FUNCTION public.admin_set_vip(p_user_id uuid, p_vip_status text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('error', 'Non autorisé');
  END IF;
  UPDATE profiles SET vip_status = p_vip_status WHERE user_id = p_user_id;
  RETURN json_build_object('success', true);
END;
$$;

-- Fonction admin : approuver/bloquer un joueur
CREATE OR REPLACE FUNCTION public.admin_set_player_approval(p_user_id uuid, p_approved boolean)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('error', 'Non autorisé');
  END IF;
  UPDATE profiles SET is_approved = p_approved WHERE user_id = p_user_id;
  RETURN json_build_object('success', true);
END;
$$;

-- Fonction admin : supprimer un joueur (profil + données)
CREATE OR REPLACE FUNCTION public.admin_delete_player(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('error', 'Non autorisé');
  END IF;
  DELETE FROM participations WHERE user_id = p_user_id;
  DELETE FROM transactions WHERE user_id = p_user_id;
  DELETE FROM referrals WHERE sponsor_id = p_user_id OR referral_id = p_user_id;
  DELETE FROM user_roles WHERE user_id = p_user_id;
  DELETE FROM profiles WHERE user_id = p_user_id;
  RETURN json_build_object('success', true);
END;
$$;

-- Fonction admin : activer/annuler une session
CREATE OR REPLACE FUNCTION public.admin_set_session_status(p_session_id uuid, p_status text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('error', 'Non autorisé');
  END IF;
  IF p_status NOT IN ('waiting', 'active', 'cancelled', 'completed') THEN
    RETURN json_build_object('error', 'Statut invalide');
  END IF;
  UPDATE sessions SET status = p_status, completed_at = CASE WHEN p_status IN ('cancelled','completed') THEN now() ELSE completed_at END WHERE id = p_session_id;
  RETURN json_build_object('success', true);
END;
$$;

-- Fonction admin : mettre à jour un paramètre
CREATE OR REPLACE FUNCTION public.admin_update_setting(p_key text, p_value text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('error', 'Non autorisé');
  END IF;
  UPDATE game_settings SET value = p_value, updated_at = now(), updated_by = auth.uid() WHERE key = p_key;
  RETURN json_build_object('success', true);
END;
$$;
