import { motion } from "framer-motion";
import { Trophy, TrendingUp } from "lucide-react";
import JackpotCounter from "@/components/JackpotCounter";
import WalletBadge from "@/components/WalletBadge";
import SessionCard from "@/components/SessionCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useSessions, useJoinSession, useCreateSession } from "@/hooks/useSessions";
import { toast } from "sonner";

const mockWinners = [
  { name: "Rakoto M.", amount: 15000 },
  { name: "Andry T.", amount: 8500 },
  { name: "Soa R.", amount: 5200 },
  { name: "Fidy N.", amount: 3800 },
  { name: "Hery A.", amount: 2400 },
];

const Lobby = () => {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: sessions } = useSessions();
  const joinSession = useJoinSession();
  const createSession = useCreateSession();

  const handlePlay = async () => {
    // Find a waiting session or create one
    const waitingSession = sessions?.find((s) => s.status === "waiting");
    
    if (waitingSession) {
      try {
        await joinSession.mutateAsync(waitingSession.id);
        toast.success("Inscription réussie !");
        navigate("/game?session=" + waitingSession.id);
      } catch (e: any) {
        toast.error(e.message || "Erreur lors de l'inscription");
      }
    } else {
      try {
        const newSession = await createSession.mutateAsync();
        await joinSession.mutateAsync(newSession.id);
        toast.success("Nouvelle session créée !");
        navigate("/game?session=" + newSession.id);
      } catch (e: any) {
        toast.error(e.message || "Erreur lors de la création");
      }
    }
  };

  const mapStatus = (s: string) => {
    if (s === "waiting") return "waiting" as const;
    if (s === "completed" || s === "cancelled") return "finished" as const;
    return "running" as const;
  };

  return (
    <div className="min-h-screen bg-gradient-gaming pb-24">
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-display text-xl font-black text-primary text-glow-purple"
        >
          LOTO<span className="text-secondary">CONNECT</span>
        </motion.h1>
        <WalletBadge balance={profile?.balance ?? 0} />
      </header>

      <main className="mx-auto max-w-lg px-4 space-y-6">
        {/* Jackpot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-secondary/20 bg-card p-6 shadow-gold"
        >
          <JackpotCounter value={2_547_800} />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={handlePlay}
            disabled={joinSession.isPending || createSession.isPending}
            className="w-full h-14 text-lg font-display font-bold bg-gradient-purple shadow-purple hover:brightness-110 transition-all animate-pulse-glow"
            size="lg"
          >
            {joinSession.isPending ? "⏳ Inscription..." : "🎰 JOUER – 1 000 Ar"}
          </Button>
        </motion.div>

        {/* Winners ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden rounded-xl border border-border bg-card p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={14} className="text-secondary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Derniers gagnants
            </span>
          </div>
          <div className="overflow-hidden">
            <div className="flex gap-4 animate-ticker whitespace-nowrap">
              {[...mockWinners, ...mockWinners].map((w, i) => (
                <span key={i} className="flex items-center gap-1 text-sm">
                  <TrendingUp size={12} className="text-neon" />
                  <span className="font-medium">{w.name}</span>
                  <span className="text-secondary font-bold">
                    +{new Intl.NumberFormat("fr-FR").format(w.amount)} Ar
                  </span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sessions */}
        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Sessions en cours
          </h2>
          <div className="space-y-3">
            {sessions && sessions.length > 0 ? (
              sessions.map((s) => (
                <SessionCard
                  key={s.id}
                  id={String(s.session_number)}
                  players={s.current_players}
                  maxPlayers={s.max_players}
                  status={mapStatus(s.status)}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune session en cours. Appuyez sur JOUER pour en créer une !
              </p>
            )}
          </div>
        </div>

        {/* Responsible gaming */}
        <p className="text-center text-[10px] text-muted-foreground pb-4">
          🛡️ Jouez pour le plaisir, pas pour gagner votre vie. +18 ans uniquement.
        </p>
      </main>
    </div>
  );
};

export default Lobby;
