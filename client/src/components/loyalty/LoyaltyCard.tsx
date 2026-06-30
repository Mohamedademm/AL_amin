import { useQuery } from "@tanstack/react-query";
import { Shield, TrendingUp, Wallet } from "lucide-react";
import { loyaltyApi } from "../../services/api";
import { Skeleton } from "../ui/Skeleton";
import { formatPrice } from "../../utils/format";

// Visual accent per tier so the card feels like a status badge.
const TIER_STYLE: Record<string, { ring: string; text: string; bar: string }> = {
  BRONZE: { ring: "border-amber-700/40 bg-amber-700/10", text: "text-amber-600", bar: "bg-amber-600" },
  SILVER: { ring: "border-slate-400/40 bg-slate-400/10", text: "text-slate-400", bar: "bg-slate-400" },
  GOLD: { ring: "border-yellow-500/40 bg-yellow-500/10", text: "text-yellow-500", bar: "bg-yellow-500" },
  PLATINUM: { ring: "border-primary/40 bg-primary/10", text: "text-primary", bar: "bg-primary" },
};

// Client-facing loyalty status: current tier, the perk it unlocks, and a
// progress bar toward the next tier — the gamified hook.
export function LoyaltyCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["loyalty"],
    queryFn: loyaltyApi.status,
  });

  if (isLoading) return <Skeleton className="h-56 w-full rounded-2xl" />;
  if (!data) return null;

  const style = TIER_STYLE[data.tier] ?? TIER_STYLE.BRONZE;

  return (
    <div className={`rounded-2xl border bg-surface p-6 ${style.ring}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Loyalty
          </p>
          <h3 className={`flex items-center gap-2 text-2xl font-bold ${style.text}`}>
            <Shield size={22} /> {data.tier}
          </h3>
        </div>
        {data.discountPercent > 0 && (
          <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${style.ring} ${style.text}`}>
            −{data.discountPercent}% always
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-muted">
        <Wallet size={15} /> Lifetime spend
        <span className="ml-auto font-mono font-semibold text-content">
          {formatPrice(data.lifetimeSpend)}
        </span>
      </div>

      {data.next ? (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1">
              <TrendingUp size={13} /> Next: {data.next.name} (−{data.next.discountPercent}%)
            </span>
            <span className="font-mono">
              {formatPrice(data.remaining)} to go
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full ${style.bar} transition-all duration-700`}
              style={{ width: `${Math.round(data.progress * 100)}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm font-medium text-primary">
          🏆 You've reached the top tier — enjoy the maximum perks!
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-1.5 border-t border-line pt-4">
        {data.tiers.map((t) => {
          const reached = data.lifetimeSpend >= t.minSpend;
          const ts = TIER_STYLE[t.name] ?? TIER_STYLE.BRONZE;
          return (
            <span
              key={t.name}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                t.name === data.tier
                  ? `${ts.ring} ${ts.text}`
                  : reached
                    ? "border-line text-muted"
                    : "border-line/50 text-muted/50"
              }`}
              title={`${t.name}: ${formatPrice(t.minSpend)}+ → −${t.discountPercent}%`}
            >
              {t.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default LoyaltyCard;
