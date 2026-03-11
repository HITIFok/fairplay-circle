import { NavLink, useLocation } from "react-router-dom";
import { Home, Gamepad2, Wallet, Users, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Lobby" },
  { to: "/game", icon: Gamepad2, label: "Jouer" },
  { to: "/wallet", icon: Wallet, label: "Solde" },
  { to: "/referral", icon: Users, label: "Amis" },
  { to: "/vip", icon: Star, label: "VIP" },
  { to: "/profile", icon: User, label: "Profil" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around py-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "rounded-lg p-1.5 transition-all",
                isActive && "bg-primary/15 shadow-purple"
              )}>
                <Icon size={20} />
              </div>
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
