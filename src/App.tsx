import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import Lobby from "@/pages/Lobby";
import GameSession from "@/pages/GameSession";
import WalletPage from "@/pages/WalletPage";
import ReferralPage from "@/pages/ReferralPage";
import VipPage from "@/pages/VipPage";
import ProfilePage from "@/pages/ProfilePage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";
import AdminPage from "@/pages/AdminPage";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-gaming flex items-center justify-center">
        <div className="font-display text-lg text-primary animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/game" element={<GameSession />} />
        <Route path="/game/:sessionId" element={<GameSession />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/referral" element={<ReferralPage />} />
        <Route path="/vip" element={<VipPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-gaming flex items-center justify-center">
        <div className="font-display text-lg text-primary animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
