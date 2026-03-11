import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Gamepad2, Receipt, Settings,
  ArrowLeft, TrendingUp, TrendingDown, Loader2, Shield,
  Trash2, CheckCircle, XCircle, Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import {
  useIsAdmin, useAdminStats, useAdminPlayers, useAdminSessions, useAdminTransactions,
  useGameSettings, useUpdateSetting, useSetVip, useSetPlayerApproval, useDeletePlayer, useSetSessionStatus,
} from "@/hooks/useAdmin";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const statusBadge = (status: string) => {
  const colors: Record<string, string> = {
    waiting: "bg-secondary/15 text-secondary",
    active: "bg-neon/15 text-neon",
    drawing: "bg-primary/15 text-primary",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/15 text-destructive",
    none: "bg-muted text-muted-foreground",
    bronze: "bg-secondary/15 text-secondary",
    argent: "bg-muted-foreground/15 text-muted-foreground",
    or: "bg-secondary/25 text-secondary",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", colors[status] ?? "bg-muted text-muted-foreground")}>
      {status}
    </span>
  );
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: stats } = useAdminStats();
  const { data: players } = useAdminPlayers();
  const { data: sessions } = useAdminSessions();
  const { data: transactions } = useAdminTransactions();
  const { data: settings } = useGameSettings();
  const updateSetting = useUpdateSetting();
  const setVip = useSetVip();
  const setApproval = useSetPlayerApproval();
  const deletePlayer = useDeletePlayer();
  const setSessionStatus = useSetSessionStatus();

  const [editSettings, setEditSettings] = useState<Record<string, string>>({});

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-gaming flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-gaming flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Shield size={48} className="mx-auto text-destructive" />
          <p className="font-display text-lg font-bold text-destructive">Accès refusé</p>
          <p className="text-sm text-muted-foreground">Vous n'avez pas les droits administrateur.</p>
          <Button variant="outline" onClick={() => navigate("/")}>Retour au lobby</Button>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Joueurs", value: stats?.total_players ?? 0, icon: Users, color: "text-primary" },
    { label: "Sessions", value: stats?.total_sessions ?? 0, icon: Gamepad2, color: "text-secondary" },
    { label: "Actives", value: stats?.active_sessions ?? 0, icon: TrendingUp, color: "text-neon" },
    { label: "Revenus", value: `${(stats?.total_revenue ?? 0).toLocaleString()} Ar`, icon: TrendingUp, color: "text-neon" },
    { label: "Gains", value: `${(stats?.total_payouts ?? 0).toLocaleString()} Ar`, icon: TrendingDown, color: "text-secondary" },
  ];

  const settingLabels: Record<string, string> = {
    win_rate: "Taux de gain (%)",
    entry_fee: "Frais d'entrée (Ar)",
    max_players: "Max joueurs/session",
    min_guaranteed_win: "Gain minimum (Ar)",
    jackpot_percent: "Jackpot (%)",
    referral_percent: "Parrainage (%)",
    loyalty_percent: "Fidélité (%)",
  };

  const handleSaveSetting = (key: string) => {
    const val = editSettings[key];
    if (val !== undefined && val !== settings?.[key]) {
      updateSetting.mutate({ key, value: val });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-gaming pb-8">
      <header className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex items-center gap-2">
          <LayoutDashboard size={20} className="text-primary" />
          <h1 className="font-display text-lg font-bold">Administration</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-4 text-center">
              <s.icon size={18} className={cn("mx-auto mb-1", s.color)} />
              <p className="font-display text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="players" className="space-y-4">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="players" className="text-xs"><Users size={14} className="mr-1" /> Joueurs</TabsTrigger>
            <TabsTrigger value="sessions" className="text-xs"><Gamepad2 size={14} className="mr-1" /> Sessions</TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs"><Receipt size={14} className="mr-1" /> Transactions</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs"><Settings size={14} className="mr-1" /> Paramètres</TabsTrigger>
          </TabsList>

          {/* ========== JOUEURS ========== */}
          <TabsContent value="players">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Joueur</TableHead>
                    <TableHead className="text-xs">Solde</TableHead>
                    <TableHead className="text-xs">VIP</TableHead>
                    <TableHead className="text-xs">Accès</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players?.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{p.username}</p>
                          <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: fr })}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{p.balance.toLocaleString()} Ar</TableCell>
                      <TableCell>
                        <Select defaultValue={p.vip_status} onValueChange={(v) => setVip.mutate({ userId: p.user_id, vipStatus: v })}>
                          <SelectTrigger className="h-7 w-24 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucun</SelectItem>
                            <SelectItem value="bronze">🥉 Bronze</SelectItem>
                            <SelectItem value="argent">🥈 Argent</SelectItem>
                            <SelectItem value="or">🥇 Or</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost" size="sm"
                          className={cn("h-7 text-xs gap-1", p.is_approved ? "text-neon" : "text-destructive")}
                          onClick={() => setApproval.mutate({ userId: p.user_id, approved: !p.is_approved })}
                        >
                          {p.is_approved ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {p.is_approved ? "Approuvé" : "Bloqué"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                              <Trash2 size={14} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer {p.username} ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Toutes les données de ce joueur seront supprimées définitivement.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deletePlayer.mutate(p.user_id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ========== SESSIONS ========== */}
          <TabsContent value="sessions">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Statut</TableHead>
                    <TableHead className="text-xs">Joueurs</TableHead>
                    <TableHead className="text-xs">Pot</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions?.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-sm font-bold">#{s.session_number}</TableCell>
                      <TableCell>{statusBadge(s.status)}</TableCell>
                      <TableCell className="text-sm">{s.current_players}/{s.max_players}</TableCell>
                      <TableCell className="text-sm text-secondary">{s.pot.toLocaleString()} Ar</TableCell>
                      <TableCell>
                        {s.status === "waiting" || s.status === "active" ? (
                          <div className="flex gap-1">
                            {s.status === "waiting" && (
                              <Button size="sm" variant="outline" className="h-7 text-xs text-neon border-neon/30"
                                onClick={() => setSessionStatus.mutate({ sessionId: s.id, status: "active" })}>
                                Activer
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/30"
                              onClick={() => setSessionStatus.mutate({ sessionId: s.id, status: "cancelled" })}>
                              Annuler
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ========== TRANSACTIONS ========== */}
          <TabsContent value="transactions">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Montant</TableHead>
                    <TableHead className="text-xs">Label</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{statusBadge(tx.type)}</TableCell>
                      <TableCell className={cn("text-sm font-bold", tx.amount > 0 ? "text-neon" : "text-destructive")}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} Ar
                      </TableCell>
                      <TableCell className="text-sm">{tx.label}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true, locale: fr })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ========== PARAMÈTRES ========== */}
          <TabsContent value="settings">
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-display text-sm font-bold mb-4 flex items-center gap-2">
                  <Settings size={16} className="text-primary" /> Configuration du jeu
                </h3>
                <div className="grid gap-3">
                  {Object.entries(settingLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className="text-sm text-muted-foreground flex-1">{label}</label>
                      <input
                        className="w-28 rounded-lg bg-input border border-border px-3 py-1.5 text-sm text-right"
                        type="number"
                        value={editSettings[key] ?? settings?.[key] ?? ""}
                        onChange={(e) => setEditSettings({ ...editSettings, [key]: e.target.value })}
                      />
                      <Button size="sm" variant="outline" className="h-7 text-xs"
                        disabled={updateSetting.isPending || (editSettings[key] ?? settings?.[key]) === settings?.[key]}
                        onClick={() => handleSaveSetting(key)}>
                        Sauver
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 space-y-2">
                <h3 className="font-display text-sm font-bold flex items-center gap-2">
                  <Crown size={16} className="text-secondary" /> Guide VIP
                </h3>
                <p className="text-xs text-muted-foreground">• Changez le statut VIP directement dans l'onglet Joueurs</p>
                <p className="text-xs text-muted-foreground">• Bronze : +3% cashback, 1 ticket tombola</p>
                <p className="text-xs text-muted-foreground">• Argent : +7% cashback, 2 tickets tombola</p>
                <p className="text-xs text-muted-foreground">• Or : +15% cashback, 3 tickets tombola</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;
