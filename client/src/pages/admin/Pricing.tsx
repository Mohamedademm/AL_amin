import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Power, Tag, Clock, Hash } from "lucide-react";
import { discountApi, categoryApi, productApi } from "../../services/api";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageLoader } from "../../components/ui/Spinner";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../lib/cn";
import { formatDateTime } from "../../utils/format";
import type { Discount, DiscountScope } from "../../types";

const EMPTY = {
  scope: "CATEGORY" as DiscountScope,
  targetId: "",
  percentage: "",
  endsAt: "",
  maxQuantity: "",
};

export default function Pricing() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const toast = useToast();
  const { data: discounts, isLoading } = useQuery({
    queryKey: ["discounts"],
    queryFn: discountApi.list,
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.list,
  });
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.list,
  });

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  // Refresh both the rules list and storefront prices after any change.
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["discounts"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const create = useMutation({
    mutationFn: () =>
      discountApi.create({
        percentage: Number(form.percentage),
        scope: form.scope,
        categoryId: form.scope === "CATEGORY" ? form.targetId : undefined,
        productId: form.scope === "PRODUCT" ? form.targetId : undefined,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        maxQuantity: form.maxQuantity ? Number(form.maxQuantity) : undefined,
      }),
    onSuccess: () => {
      invalidate();
      setForm(EMPTY);
      toast.success("Discount applied");
    },
    onError: (e: any) =>
      setError(e?.response?.data?.message || "Could not create the discount."),
  });
  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      discountApi.setActive(id, active),
    onSuccess: () => {
      invalidate();
      toast.success("Discount updated");
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => discountApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Discount removed");
    },
  });

  // Confirm before removing a pricing rule.
  const askRemove = async (d: Discount) => {
    if (
      await confirm({
        title: "Remove discount",
        message: `Remove the −${d.percentage}% rule on ${d.category?.name || d.product?.name}?`,
        danger: true,
        confirmLabel: "Remove",
      })
    ) {
      remove.mutate(d.id);
    }
  };

  if (isLoading) return <PageLoader label="Loading pricing" />;

  return (
    <div>
      <PageHeader
        title="Dynamic Pricing"
        subtitle="Apply category or product discounts. Expiry & quantity caps stay hidden from clients."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Create form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            if (form.targetId && form.percentage) create.mutate();
          }}
          className="h-fit space-y-4 rounded-2xl border border-line bg-surface p-6 lg:col-span-2"
        >
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Tag size={18} className="text-primary" /> New discount
          </h3>
          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-content">
              Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["CATEGORY", "PRODUCT"] as DiscountScope[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, scope: s, targetId: "" })}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                    form.scope === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-line text-muted hover:text-content",
                  )}
                >
                  {s === "CATEGORY" ? "Category" : "Product"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-content">
              Target
            </label>
            <select
              value={form.targetId}
              onChange={(e) => setForm({ ...form, targetId: e.target.value })}
              className="input-base"
              required
            >
              <option value="" disabled>
                Select {form.scope === "CATEGORY" ? "category" : "product"}…
              </option>
              {form.scope === "CATEGORY"
                ? categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                : products?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
            </select>
          </div>

          <Input
            label="Discount %"
            type="number"
            min="1"
            max="90"
            value={form.percentage}
            onChange={(e) => setForm({ ...form, percentage: e.target.value })}
            required
          />

          <div className="rounded-xl border border-dashed border-line p-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">
              Stealth constraints (hidden from clients)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Ends at"
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              />
              <Input
                label="Max qty"
                type="number"
                min="1"
                value={form.maxQuantity}
                onChange={(e) =>
                  setForm({ ...form, maxQuantity: e.target.value })
                }
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={create.isPending}>
            <Plus size={16} />{" "}
            {create.isPending ? "Creating…" : "Apply discount"}
          </Button>
        </form>

        {/* Active rules */}
        <div className="space-y-3 lg:col-span-3">
          {discounts?.length === 0 && (
            <div className="rounded-2xl border border-line bg-surface p-10 text-center text-muted">
              No discounts yet.
            </div>
          )}
          {discounts?.map((d) => (
            <div
              key={d.id}
              className={cn(
                "rounded-2xl border bg-surface p-5",
                d.active ? "border-primary/30" : "border-line opacity-70",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 font-mono text-sm font-bold text-red-500">
                    −{d.percentage}%
                  </span>
                  <div>
                    <p className="font-medium text-content">
                      {d.category?.name || d.product?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted">
                      {d.categoryId ? "Category" : "Product"} discount
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={d.active ? "success" : "neutral"}>
                    {d.active ? "Active" : "Paused"}
                  </Badge>
                  <button
                    onClick={() =>
                      toggle.mutate({ id: d.id, active: !d.active })
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted hover:text-primary"
                    aria-label="Toggle"
                  >
                    <Power size={15} />
                  </button>
                  <button
                    onClick={() => askRemove(d)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted hover:text-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {(d.endsAt || d.maxQuantity) && (
                <div className="mt-3 flex flex-wrap gap-3 border-t border-line pt-3 text-xs text-muted">
                  {d.endsAt && (
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> ends {formatDateTime(d.endsAt)}
                    </span>
                  )}
                  {d.maxQuantity && (
                    <span className="flex items-center gap-1">
                      <Hash size={13} /> max {d.maxQuantity}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
