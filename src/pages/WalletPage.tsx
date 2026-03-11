import { motion } from "framer-motion";
import { Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, Plus, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useTransactions } from "@/hooks/useTransactions";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const WalletPage = () => {
  const { data: profile } = useProfile();
  const { data: transactions } = useTransactions();
  const balance = profile?.balance ?? 0;
  const formatted = new Intl.NumberFormat("fr-FR").format(balance);

  return (
    <div className="min-h-screen bg-gradient-gaming pb-24">
      <header className="px-4 pt-4 pb-2">
        <h1 className="font-display text-lg font-bold">Mon Portefeuille</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 space-y-6">
        {/* Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-secondary/20 bg-card p-6 text-center shadow-gold"
        >
          <WalletIcon size={28} className="mx-auto text-secondary mb-2" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Solde disponible</p>
          <p className="font-display text-3xl font-black text-secondary text-glow-gold">
            {formatted} Ar
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Seuil de retrait : ≥ 10 000 Ar
          </p>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button className="flex-1 bg-gradient-neon text-accent-foreground font-bold" size="lg">
            <Plus size={18} />
            Recharger
          </Button>
          <Button className="flex-1 bg-gradient-gold text-secondary-foreground font-bold" size="lg" disabled={balance < 10000}>
            <ArrowDown size={18} />
            Retirer
          </Button>
        </div>

        {/* History */}
        <div>
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Historique
          </h2>
          <div className="space-y-2">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-3">
                    {tx.amount > 0 ? (
                      <ArrowUpCircle size={18} className="text-neon" />
                    ) : (
                      <ArrowDownCircle size={18} className="text-destructive" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{tx.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm font-bold",
                    tx.amount > 0 ? "text-neon" : "text-destructive"
                  )}>
                    {tx.amount > 0 ? "+" : ""}{new Intl.NumberFormat("fr-FR").format(tx.amount)} Ar
                  </span>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune transaction pour le moment.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WalletPage;
