import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useIsAdmin = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_stats");
      if (error) throw error;
      return data as {
        total_players: number;
        total_sessions: number;
        active_sessions: number;
        total_revenue: number;
        total_payouts: number;
      };
    },
  });
};

export const useAdminPlayers = () => {
  return useQuery({
    queryKey: ["admin-players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
};

export const useAdminSessions = () => {
  return useQuery({
    queryKey: ["admin-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
};

export const useAdminTransactions = () => {
  return useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
};

export const useGameSettings = () => {
  return useQuery({
    queryKey: ["game-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("game_settings")
        .select("*");
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach((s: any) => { map[s.key] = s.value; });
      return map;
    },
  });
};

export const useUpdateSetting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data, error } = await supabase.rpc("admin_update_setting", { p_key: key, p_value: value });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["game-settings"] }); toast.success("Paramètre mis à jour"); },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useSetVip = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, vipStatus }: { userId: string; vipStatus: string }) => {
      const { data, error } = await supabase.rpc("admin_set_vip", { p_user_id: userId, p_vip_status: vipStatus });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-players"] }); toast.success("Statut VIP mis à jour"); },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useSetPlayerApproval = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, approved }: { userId: string; approved: boolean }) => {
      const { data, error } = await supabase.rpc("admin_set_player_approval", { p_user_id: userId, p_approved: approved });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-players"] }); toast.success("Accès joueur mis à jour"); },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useDeletePlayer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc("admin_delete_player", { p_user_id: userId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-players"] }); toast.success("Joueur supprimé"); },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useSetSessionStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, status }: { sessionId: string; status: string }) => {
      const { data, error } = await supabase.rpc("admin_set_session_status", { p_session_id: sessionId, p_status: status });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-sessions"] }); toast.success("Session mise à jour"); },
    onError: (e: any) => toast.error(e.message),
  });
};
