import { motion } from "framer-motion";
import { Users, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionCardProps {
  id: string;
  players: number;
  maxPlayers: number;
  status: "waiting" | "running" | "finished";
  timeLeft?: string;
}

const statusConfig = {
  waiting: { label: "En attente", color: "text-secondary", bg: "bg-secondary/15" },
  running: { label: "En cours", color: "text-neon", bg: "bg-neon/15" },
  finished: { label: "Terminée", color: "text-muted-foreground", bg: "bg-muted/30" },
};

const SessionCard = ({ id, players, maxPlayers, status, timeLeft }: SessionCardProps) => {
  const config = statusConfig[status];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-display text-xs font-bold text-muted-foreground">
          SESSION #{id}
        </span>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", config.bg, config.color)}>
          {config.label}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm">
          <Users size={14} className="text-primary" />
          <span className="font-semibold">{players}</span>
          <span className="text-muted-foreground">/ {maxPlayers}</span>
        </div>
        {timeLeft && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock size={14} />
            <span>{timeLeft}</span>
          </div>
        )}
        {status === "waiting" && players >= maxPlayers && (
          <Zap size={14} className="text-neon animate-pulse" />
        )}
      </div>
      {status === "waiting" && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-purple rounded-full transition-all"
            style={{ width: `${(players / maxPlayers) * 100}%` }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default SessionCard;
