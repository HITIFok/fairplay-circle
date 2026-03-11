import { Wallet } from "lucide-react";

interface WalletBadgeProps {
  balance: number;
}

const WalletBadge = ({ balance }: WalletBadgeProps) => {
  const formatted = new Intl.NumberFormat("fr-FR").format(balance);

  return (
    <div className="flex items-center gap-2 rounded-full bg-card border border-border px-3 py-1.5">
      <Wallet size={16} className="text-secondary" />
      <span className="text-sm font-semibold text-secondary">
        {formatted} Ar
      </span>
    </div>
  );
};

export default WalletBadge;
