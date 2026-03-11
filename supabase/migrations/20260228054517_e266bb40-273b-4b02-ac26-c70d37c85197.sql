
-- Add referral_code and referred_by to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by uuid;

-- Generate referral codes for existing profiles
UPDATE public.profiles SET referral_code = 'LC' || UPPER(LEFT(md5(user_id::text || now()::text), 6)) WHERE referral_code IS NULL;

-- Auto-generate referral_code on new profile
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'LC' || UPPER(LEFT(md5(NEW.user_id::text || now()::text), 6));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- Referrals table
CREATE TABLE public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id uuid NOT NULL,
  referral_id uuid NOT NULL,
  level integer NOT NULL DEFAULT 1,
  bonus_amount integer NOT NULL DEFAULT 200,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(sponsor_id, referral_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referrals" ON public.referrals FOR SELECT USING (auth.uid() = sponsor_id);
CREATE POLICY "System inserts referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals;

-- Process referral function
CREATE OR REPLACE FUNCTION public.process_referral(p_referral_code text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_sponsor_id uuid;
  v_sponsor2_id uuid;
  v_today_count integer;
BEGIN
  -- Find sponsor
  SELECT user_id INTO v_sponsor_id FROM profiles WHERE referral_code = p_referral_code;
  IF v_sponsor_id IS NULL THEN
    RETURN json_build_object('error', 'Code invalide');
  END IF;

  -- No self-referral
  IF v_sponsor_id = v_user_id THEN
    RETURN json_build_object('error', 'Auto-parrainage interdit');
  END IF;

  -- Already referred?
  IF EXISTS (SELECT 1 FROM profiles WHERE user_id = v_user_id AND referred_by IS NOT NULL) THEN
    RETURN json_build_object('error', 'Déjà parrainé');
  END IF;

  -- Daily limit (10/day)
  SELECT COUNT(*) INTO v_today_count FROM referrals WHERE sponsor_id = v_sponsor_id AND created_at::date = CURRENT_DATE;
  IF v_today_count >= 10 THEN
    RETURN json_build_object('error', 'Limite journalière atteinte pour ce parrain');
  END IF;

  -- Mark referred
  UPDATE profiles SET referred_by = v_sponsor_id WHERE user_id = v_user_id;

  -- Level 1 bonus (200 Ar)
  INSERT INTO referrals (sponsor_id, referral_id, level, bonus_amount) VALUES (v_sponsor_id, v_user_id, 1, 200);
  UPDATE profiles SET balance = balance + 200 WHERE user_id = v_sponsor_id;
  INSERT INTO transactions (user_id, type, amount, label) VALUES (v_sponsor_id, 'parrainage', 200, 'Parrainage N1 - ' || (SELECT username FROM profiles WHERE user_id = v_user_id));

  -- Level 2 bonus (50 Ar) if sponsor was also referred
  SELECT referred_by INTO v_sponsor2_id FROM profiles WHERE user_id = v_sponsor_id;
  IF v_sponsor2_id IS NOT NULL THEN
    INSERT INTO referrals (sponsor_id, referral_id, level, bonus_amount) VALUES (v_sponsor2_id, v_user_id, 2, 50);
    UPDATE profiles SET balance = balance + 50 WHERE user_id = v_sponsor2_id;
    INSERT INTO transactions (user_id, type, amount, label) VALUES (v_sponsor2_id, 'parrainage', 50, 'Parrainage N2 - ' || (SELECT username FROM profiles WHERE user_id = v_user_id));
  END IF;

  RETURN json_build_object('success', true);
END;
$$;
