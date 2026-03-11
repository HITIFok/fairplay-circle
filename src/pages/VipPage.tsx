import { motion } from "framer-motion";
import { Star, Crown, Ticket, Target, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const vipLevels = [
  { name: "Bronze", icon: "🥉", sessions: 10, referrals: 3, cashback: 3, tickets: 1, price: "2 500 Ar / 15j" },
  { name: "Argent", icon: "🥈", sessions: 30, referrals: 10, cashback: 7, tickets: 2, price: "7 500 Ar / 15j" },
  { name: "Or", icon: "🥇", sessions: 100, referrals: 25, cashback: 15, tickets: 3, price: "20 000 Ar / 15j" },
];

const mockQuests = [
  { title: "Parraine 2 amis", reward: 300, progress: 1, target: 2 },
  { title: "Joue 5 sessions", reward: 500, progress: 3, target: 5 },
  { title: "Gagne 3 fois", reward: 200, progress: 0, target: 3 },
];

const VipPage = () => {
  const currentLevel = 0; // Bronze
  const sessionsPlayed = 7;
  const nextLevelSessions = vipLevels[currentLevel].sessions;

  return (
    <div className="min-h-screen bg-gradient-gaming pb-24">
      <header className="px-4 pt-4 pb-2">
        <h1 className="font-display text-lg font-bold">Progression & VIP</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 space-y-6">
        {/* Current status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-secondary/20 bg-card p-6 text-center"
        >
          <span className="text-4xl">{vipLevels[currentLevel].icon}</span>
          <p className="font-display text-lg font-bold text-secondary mt-2">
            Statut {vipLevels[currentLevel].name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            +{vipLevels[currentLevel].cashback}% cashback • {vipLevels[currentLevel].tickets} ticket(s) tombola/mois
          </p>

          {/* Progress to next */}
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{sessionsPlayed} sessions</span>
              <span>{nextLevelSessions} pour {vipLevels[currentLevel].name}</span>
            </div>
            <Progress value={(sessionsPlayed / nextLevelSessions) * 100} className="h-2" />
          </div>
        </motion.div>

        {/* VIP levels */}
        <div>
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Crown size={14} className="text-secondary" />
            Niveaux VIP
          </h2>
          <div className="space-y-2">
            {vipLevels.map((level, i) => (
              <motion.div
                key={level.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "rounded-xl border p-4",
                  i === currentLevel ? "border-secondary/40 bg-secondary/5" : "border-border bg-card"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{level.icon}</span>
                    <span className="font-display text-sm font-bold">{level.name}</span>
                  </div>
                  {i !== currentLevel && (
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      <ShoppingCart size={12} />
                      {level.price}
                    </Button>
                  )}
                  {i === currentLevel && (
                    <span className="text-xs font-bold text-neon">✓ Actif</span>
                  )}
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{level.sessions} sessions ou {level.referrals} filleuls</span>
                  <span>+{level.cashback}% cashback</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quests */}
        <div>
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Target size={14} className="text-primary" />
            Quêtes hebdomadaires
          </h2>
          <div className="space-y-2">
            {mockQuests.map((q, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{q.title}</span>
                  <span className="text-xs font-bold text-neon">+{q.reward} Ar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(q.progress / q.target) * 100} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">{q.progress}/{q.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tombola tickets */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <Ticket size={20} className="mx-auto text-primary mb-1" />
          <p className="font-display text-sm font-bold">3 Tickets Tombola</p>
          <p className="text-xs text-muted-foreground">1 ticket = 10 sessions • Tirage mensuel</p>
        </div>
      </main>
    </div>
  );
};

export default VipPage;
