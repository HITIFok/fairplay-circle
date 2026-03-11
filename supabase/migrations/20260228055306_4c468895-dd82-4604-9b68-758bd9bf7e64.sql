
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS: users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- RLS: only admins can manage roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all transactions
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all participations
CREATE POLICY "Admins can view all participations"
ON public.participations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all referrals
CREATE POLICY "Admins can view all referrals"
ON public.referrals
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin function: get dashboard stats
CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_players integer;
  v_total_sessions integer;
  v_active_sessions integer;
  v_total_revenue integer;
  v_total_payouts integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('error', 'Non autorisé');
  END IF;

  SELECT COUNT(*) INTO v_total_players FROM profiles;
  SELECT COUNT(*) INTO v_total_sessions FROM sessions;
  SELECT COUNT(*) INTO v_active_sessions FROM sessions WHERE status IN ('waiting', 'active', 'drawing');
  SELECT COALESCE(SUM(ABS(amount)), 0) INTO v_total_revenue FROM transactions WHERE type = 'mise';
  SELECT COALESCE(SUM(amount), 0) INTO v_total_payouts FROM transactions WHERE type = 'gain';

  RETURN json_build_object(
    'total_players', v_total_players,
    'total_sessions', v_total_sessions,
    'active_sessions', v_active_sessions,
    'total_revenue', v_total_revenue,
    'total_payouts', v_total_payouts
  );
END;
$$;

-- Enable realtime for user_roles
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
