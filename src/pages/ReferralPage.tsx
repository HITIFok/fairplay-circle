import { motion } from "framer-motion";
import { Users, Copy, Share2, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useReferrals } from "@/hooks/useReferrals";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const ReferralPage = () => {
  const { toast } = useToast();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: referrals, isLoading: referralsLoading } = useReferrals();

  const referralLink = profile?.referral_code
    ? `lotoconnect.mg/r/${profile.referral_code}`
    : "Chargement...";

  const totalEarnings =
    referrals?.reduce((sum, r) => sum + (r.bonus_amount ?? 0), 0) ?? 0;

  const level1Count = referrals?.filter((r) => r.level === 1).length ?? 0;
  const level2Count = referrals?.filter((r) => r.level === 2).length ?? 0;

  const copyLink = () => {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Lien copié ! 🔗", description: "Partagez-le avec vos amis" });
  };

  const isLoading = profileLoading || referralsLoading;

  return (
    <div className="min-h-screen bg-gradient-gaming pb-24">
      <header className="px-4 pt-4 pb-2">
        <h1 className="font-display text-lg font-bold">Parrainage</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 space-y-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-neon/20 bg-card p-6 text-center shadow-neon"
        >
          <Gift size={28} className="mx-auto text-neon mb-2" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Gains de parrainage
          </p>
          {isLoading ? (
            <Loader2 className="mx-auto animate-spin text-neon" />
          ) : (
            <>
              <p className="font-display text-3xl font-black text-neon text-glow-neon">
                {new Intl.NumberFormat("fr-FR").format(totalEarnings)} Ar
              </p>
              <div className="flex justify-center gap-6 mt-4">
                <div className="text-center">
                  <p className="font-display text-lg font-bold text-secondary">
                    {level1Count}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Niveau 1 (200 Ar)
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-display text-lg font-bold text-primary">
                    {level2Count}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Niveau 2 (50 Ar)
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Share link */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Votre lien de parrainage
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm font-mono text-foreground truncate">
              {referralLink}
            </div>
            <Button size="icon" variant="outline" onClick={copyLink}>
              <Copy size={16} />
            </Button>
            <Button size="icon" className="bg-gradient-purple">
              <Share2 size={16} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            ⚠️ Limite : 10 filleuls validés / jour
          </p>
        </div>

        {/* Referral list */}
        <div>
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Users size={14} />
            Mes filleuls
          </h2>
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : referrals && referrals.length > 0 ? (
              referrals.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        r.level === 1
                          ? "bg-secondary/15 text-secondary"
                          : "bg-primary/15 text-primary"
                      }`}
                    >
                      N{r.level}
                    </span>
                    <div>
                      <p className="text-sm font-medium">Filleul</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(r.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-neon">
                    +{r.bonus_amount} Ar
                  </span>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">
                Aucun filleul pour le moment. Partagez votre lien !
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReferralPage;
