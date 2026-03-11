import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Clock, Trophy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useExecuteDraw } from "@/hooks/useSessions";
import { toast } from "sonner";

type GamePhase = "waiting" | "drawing" | "results";

interface Result {
  rank: number;
  name: string;
  amount: number;
  isPlayer: boolean;
}

const GameSession = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const { user } = useAuth();
  const executeDraw = useExecuteDraw();

  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [session, setSession] = useState<any>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [playerWinnings, setPlayerWinnings] = useState(0);

  // Fetch session data
  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      const { data } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      if (data) {
        setSession(data);
        if (data.status === "completed") setPhase("results");
        else if (data.status === "drawing" || data.status === "active") setPhase("drawing");
      }
    };

    fetchSession();

    // Realtime
    const channel = supabase
      .channel("game-session-" + sessionId)
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions", filter: `id=eq.${sessionId}` }, (payload) => {
        const updated = payload.new as any;
        setSession(updated);
        if (updated.status === "completed") {
          setPhase("results");
          fetchResults();
        } else if (updated.status === "active" || updated.status === "drawing") {
          setPhase("drawing");
        } else if (updated.status === "cancelled") {
          toast.info("Session annulée – remboursement effectué");
          navigate("/");
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  // Timer
  useEffect(() => {
    if (!session?.expires_at || phase !== "waiting") return;
    const interval = setInterval(() => {
      const diff = new Date(session.expires_at).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("00:00");
        clearInterval(interval);
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.expires_at, phase]);

  // Fetch results
  const fetchResults = async () => {
    if (!sessionId || !user) return;
    const { data } = await supabase
      .from("participations")
      .select("rank, winnings, user_id")
      .eq("session_id", sessionId)
      .order("rank", { ascending: true });

    if (data) {
      // Get usernames
      const userIds = data.map((p) => p.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);

      const nameMap: Record<string, string> = {};
      profiles?.forEach((p) => { nameMap[p.user_id] = p.username; });

      const mapped: Result[] = data.map((p) => ({
        rank: p.rank ?? 0,
        name: p.user_id === user.id ? "Vous" : (nameMap[p.user_id] || "Joueur"),
        amount: p.winnings,
        isPlayer: p.user_id === user.id,
      }));

      setResults(mapped);
      const mine = mapped.find((r) => r.isPlayer);
      if (mine) {
        setPlayerRank(mine.rank);
        setPlayerWinnings(mine.amount);
      }
    }
  };

  useEffect(() => {
    if (phase === "results") fetchResults();
  }, [phase]);

  const handleSimulateDraw = async () => {
    if (!sessionId) return;
    try {
      setPhase("drawing");
      await executeDraw.mutateAsync(sessionId);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du tirage");
      setPhase("waiting");
    }
  };

  const maxPlayers = session?.max_players ?? 20;
  const players = session?.current_players ?? 0;

  return (
    <div className="min-h-screen bg-gradient-gaming pb-24">
      <header className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="font-display text-lg font-bold">
          Session #{session?.session_number ?? "..."}
        </h1>
      </header>

      <main className="mx-auto max-w-lg px-4">
        <AnimatePresence mode="wait">
          {phase === "waiting" && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 pt-8">
              <div className="text-center space-y-4">
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="mx-auto w-32 h-32 rounded-full border-4 border-primary bg-primary/10 flex items-center justify-center shadow-purple">
                  <div>
                    <p className="font-display text-3xl font-black text-primary">{players}</p>
                    <p className="text-xs text-muted-foreground">/ {maxPlayers}</p>
                  </div>
                </motion.div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Users size={16} />
                  <span className="text-sm">En attente de joueurs...</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock size={16} className="text-secondary" />
                  <span className="text-xs font-bold uppercase text-muted-foreground">Temps restant</span>
                </div>
                <p className="font-display text-2xl font-bold text-secondary">{timeLeft || "--:--"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  La session démarre à {maxPlayers} joueurs ou s'annule après 20 min
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div className="h-full bg-gradient-purple rounded-full" initial={{ width: 0 }} animate={{ width: `${(players / maxPlayers) * 100}%` }} transition={{ duration: 1 }} />
              </div>

              <Button className="w-full" variant="outline" onClick={handleSimulateDraw} disabled={executeDraw.isPending}>
                ⚡ Lancer le tirage (démo)
              </Button>
            </motion.div>
          )}

          {phase === "drawing" && (
            <motion.div key="drawing" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="pt-16 text-center space-y-8">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mx-auto w-24 h-24 rounded-full border-4 border-dashed border-secondary flex items-center justify-center">
                <span className="text-4xl">🎰</span>
              </motion.div>
              <div>
                <p className="font-display text-xl font-bold text-glow-gold text-secondary">TIRAGE EN COURS...</p>
                <p className="text-sm text-muted-foreground mt-2">Les gagnants seront révélés dans quelques instants</p>
              </div>
              <motion.div className="flex justify-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} animate={{ y: [0, -10, 0] }} transition={{ duration: 0.5, delay: i * 0.15, repeat: Infinity }} className="w-3 h-3 rounded-full bg-secondary" />
                ))}
              </motion.div>
            </motion.div>
          )}

          {phase === "results" && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 pt-4">
              <div className="rounded-2xl bg-gradient-gold p-5 text-center shadow-gold">
                <p className="text-3xl mb-1">{playerWinnings > 0 ? "🏆" : "😢"}</p>
                <p className="font-display text-lg font-black text-secondary-foreground">
                  {playerWinnings > 0 ? "FÉLICITATIONS !" : "Pas de chance..."}
                </p>
                <p className="font-display text-2xl font-black text-secondary-foreground">
                  {playerWinnings > 0 ? `+${new Intl.NumberFormat("fr-FR").format(playerWinnings)} Ar` : "0 Ar"}
                </p>
                {playerRank && (
                  <p className="text-xs text-secondary-foreground/70 mt-1">
                    🎯 Rang #{playerRank} sur {players} joueurs
                  </p>
                )}
              </div>

              {results.length > 0 && (
                <div>
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Trophy size={14} className="text-secondary" />
                    Classement
                  </h3>
                  <div className="space-y-2">
                    {results.slice(0, 10).map((r, i) => (
                      <motion.div key={r.rank} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={cn("flex items-center justify-between rounded-lg border p-3", r.isPlayer ? "border-secondary/40 bg-secondary/10" : "border-border bg-card")}>
                        <div className="flex items-center gap-3">
                          <span className={cn("font-display text-sm font-bold w-6 text-center", r.rank <= 3 ? "text-secondary" : "text-muted-foreground")}>
                            {r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : `#${r.rank}`}
                          </span>
                          <span className={cn("text-sm font-medium", r.isPlayer && "text-secondary font-bold")}>{r.name}</span>
                        </div>
                        <span className="text-sm font-bold text-neon">
                          {r.amount > 0 ? `+${new Intl.NumberFormat("fr-FR").format(r.amount)} Ar` : "—"}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={() => navigate("/")} className="w-full bg-gradient-purple font-bold">
                🏠 Retour au lobby
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default GameSession;
