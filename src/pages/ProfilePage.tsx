import { motion } from "framer-motion";
import { User, Shield, BarChart3, Globe, LogOut, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const stats = [
    { label: "Sessions jouées", value: profile?.total_sessions ?? 0 },
    { label: "Gains totaux", value: `${(profile?.total_winnings ?? 0).toLocaleString()} Ar` },
    { label: "Rang moyen", value: profile?.avg_rank ? `#${profile.avg_rank}` : "—" },
    { label: "Taux de victoire", value: `${profile?.win_rate ?? 0}%` },
  ];

  return (
    <div className="min-h-screen bg-gradient-gaming pb-24">
      <header className="px-4 pt-4 pb-2">
        <h1 className="font-display text-lg font-bold">Profil & Paramètres</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 space-y-6">
        {/* Player info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-6 text-center"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-purple flex items-center justify-center mb-3 shadow-purple">
            <User size={28} className="text-primary-foreground" />
          </div>
          <p className="font-display text-lg font-bold">{profile?.username ?? "Joueur"}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <span className="inline-block mt-2 rounded-full bg-neon/15 px-3 py-0.5 text-xs font-bold text-neon">
            ✓ +18 vérifié
          </span>
        </motion.div>

        {/* Stats */}
        <div>
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <BarChart3 size={14} className="text-primary" />
            Statistiques
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-3 text-center"
              >
                <p className="font-display text-lg font-bold text-secondary">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Responsible gaming */}
        <div>
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Shield size={14} className="text-neon" />
            Jeu Responsable
          </h2>
          <div className="space-y-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium mb-1">Alerte dépenses</p>
              <p className="text-xs text-muted-foreground">Seuil : 10 000 Ar / semaine</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-muted">
                  <div className="h-full w-3/5 rounded-full bg-gradient-gold" />
                </div>
                <span className="text-xs text-secondary font-bold">{(profile?.weekly_spending ?? 0).toLocaleString()} Ar</span>
              </div>
            </div>

            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-destructive" />
                <p className="text-sm font-medium text-destructive">Auto-exclusion</p>
              </div>
              <div className="flex gap-2">
                {["7 jours", "30 jours", "Permanent"].map((period) => (
                  <Button key={period} size="sm" variant="outline" className="text-xs flex-1 h-8 border-destructive/30 text-destructive hover:bg-destructive/10">
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={14} className="text-muted-foreground" />
            <p className="text-sm font-medium">Langue</p>
          </div>
          <div className="flex gap-2">
            {[
              { label: "Français", active: true },
              { label: "Malagasy", active: false },
            ].map((lang) => (
              <Button
                key={lang.label}
                size="sm"
                variant={lang.active ? "default" : "outline"}
                className={cn("flex-1 text-xs h-8", lang.active && "bg-gradient-purple")}
              >
                {lang.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Se déconnecter
        </Button>
      </main>
    </div>
  );
};

export default ProfilePage;
