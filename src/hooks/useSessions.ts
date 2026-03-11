import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const useSessions = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .in("status", ["waiting", "active", "drawing", "completed"])
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("sessions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["sessions"] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
};

export const useJoinSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.rpc("join_session", {
        p_session_id: sessionId,
      });
      if (error) throw error;
      const result = data as any;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .insert({ status: "waiting" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
};

export const useExecuteDraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.rpc("execute_draw", {
        p_session_id: sessionId,
      });
      if (error) throw error;
      const result = data as any;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};
