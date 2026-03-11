import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Gamepad2, Mail, Lock, User, Calendar } from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connexion réussie !");
      } else {
        // Validate age
        const year = parseInt(birthYear);
        if (!year || currentYear - year < 18) {
          toast.error("Vous devez avoir au moins 18 ans pour vous inscrire.");
          setLoading(false);
          return;
        }
        if (!ageConfirmed) {
          toast.error("Veuillez confirmer que vous avez plus de 18 ans.");
          setLoading(false);
          return;
        }
        if (!username.trim()) {
          toast.error("Veuillez choisir un nom de joueur.");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-gaming flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-purple shadow-purple mb-4">
            <Gamepad2 size={32} className="text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-glow-purple">LotoConnect</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin ? "Bon retour parmi nous !" : "Rejoins la communauté"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs flex items-center gap-2">
                  <User size={12} /> Nom de joueur
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: Champion_42"
                  maxLength={20}
                  required
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthYear" className="text-xs flex items-center gap-2">
                  <Calendar size={12} /> Année de naissance
                </Label>
                <Input
                  id="birthYear"
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="Ex: 2000"
                  min={1920}
                  max={currentYear - 18}
                  required
                  className="bg-input border-border"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs flex items-center gap-2">
              <Mail size={12} /> Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joueur@email.com"
              required
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs flex items-center gap-2">
              <Lock size={12} /> Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
              className="bg-input border-border"
            />
          </div>

          {!isLogin && (
            <div className="flex items-start gap-2">
              <Checkbox
                id="age"
                checked={ageConfirmed}
                onCheckedChange={(c) => setAgeConfirmed(c === true)}
              />
              <Label htmlFor="age" className="text-xs text-muted-foreground leading-snug cursor-pointer">
                Je confirme avoir plus de 18 ans et accepte les conditions d'utilisation.
              </Label>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-purple font-display font-bold shadow-purple"
          >
            {loading ? "Chargement..." : isLogin ? "Se connecter" : "Créer mon compte"}
          </Button>

          {!isLogin && (
            <p className="text-center text-[10px] text-muted-foreground">
              🎁 5 000 Ar de crédit de bienvenue offerts !
            </p>
          )}
        </form>

        {/* Toggle */}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-4 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isLogin ? "Pas encore de compte ? Inscris-toi" : "Déjà un compte ? Connecte-toi"}
        </button>
      </motion.div>
    </div>
  );
};

export default AuthPage;
