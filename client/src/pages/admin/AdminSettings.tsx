import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Layers, Store, Server } from "lucide-react";
import { categoryApi, spotApi } from "../../services/api";
import { PageHeader } from "../../components/ui/PageHeader";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";

export default function AdminSettings() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const toast = useToast();
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.list,
  });
  const { data: spots } = useQuery({
    queryKey: ["spots"],
    queryFn: spotApi.list,
  });

  const [catName, setCatName] = useState("");
  const [spot, setSpot] = useState({
    name: "",
    location: "",
    address: "",
    phone: "",
  });

  const addCat = useMutation({
    mutationFn: () => categoryApi.create({ name: catName }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setCatName("");
      toast.success("Category added");
    },
    onError: () => toast.error("Could not add category"),
  });
  const delCat = useMutation({
    mutationFn: (id: string) => categoryApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
    onError: () => toast.error("Could not delete — products may still use it"),
  });
  const addSpot = useMutation({
    mutationFn: () => spotApi.create(spot),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["spots"] });
      setSpot({ name: "", location: "", address: "", phone: "" });
      toast.success("Vending spot added");
    },
    onError: () => toast.error("Could not add spot"),
  });
  const delSpot = useMutation({
    mutationFn: (id: string) => spotApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["spots"] });
      toast.success("Vending spot deleted");
    },
    onError: () =>
      toast.error("Could not delete — spot may have stock or orders"),
  });

  // Confirmation helpers for destructive settings actions.
  const askDelCat = async (id: string, name: string) => {
    if (
      await confirm({
        title: "Delete category",
        message: `Delete "${name}"?`,
        danger: true,
        confirmLabel: "Delete",
      })
    )
      delCat.mutate(id);
  };
  const askDelSpot = async (id: string, name: string) => {
    if (
      await confirm({
        title: "Delete vending spot",
        message: `Delete "${name}"?`,
        danger: true,
        confirmLabel: "Delete",
      })
    )
      delSpot.mutate(id);
  };

  return (
    <div>
      <PageHeader
        title="System Settings"
        subtitle="Manage categories, vending spots and review configuration."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Categories */}
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Layers size={18} className="text-primary" /> Categories
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (catName.trim()) addCat.mutate();
            }}
            className="mt-4 flex gap-2"
          >
            <input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="New category name"
              className="input-base"
            />
            <Button type="submit" disabled={addCat.isPending}>
              <Plus size={16} />
            </Button>
          </form>
          <div className="mt-4 space-y-2">
            {categories?.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-line px-4 py-2.5"
              >
                <span className="text-sm font-medium">{c.name}</span>
                <button
                  onClick={() => askDelCat(c.id, c.name)}
                  className="text-muted hover:text-red-500"
                  aria-label="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Vending spots */}
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Store size={18} className="text-primary" /> Vending Spots
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (spot.name && spot.location && spot.address) addSpot.mutate();
            }}
            className="mt-4 grid grid-cols-2 gap-2"
          >
            <Input
              placeholder="Name"
              value={spot.name}
              onChange={(e) => setSpot({ ...spot, name: e.target.value })}
            />
            <Input
              placeholder="Location"
              value={spot.location}
              onChange={(e) => setSpot({ ...spot, location: e.target.value })}
            />
            <Input
              placeholder="Address"
              value={spot.address}
              onChange={(e) => setSpot({ ...spot, address: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={spot.phone}
              onChange={(e) => setSpot({ ...spot, phone: e.target.value })}
            />
            <div className="col-span-2">
              <Button
                type="submit"
                className="w-full"
                disabled={addSpot.isPending}
              >
                <Plus size={16} /> Add spot
              </Button>
            </div>
          </form>
          <div className="mt-4 space-y-2">
            {spots?.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-line px-4 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted">
                    {s.location} · {s._count?.inventory ?? 0} items
                  </p>
                </div>
                <button
                  onClick={() => askDelSpot(s.id, s.name)}
                  className="text-muted hover:text-red-500"
                  aria-label="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System info */}
      <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Server size={18} className="text-primary" /> System
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 text-sm">
          {[
            { k: "Frontend", v: "React 19 · Tailwind" },
            { k: "Backend", v: "Node · Express · Prisma" },
            { k: "Database", v: "PostgreSQL 16" },
            { k: "Auth", v: "JWT + bcrypt + RBAC" },
            { k: "Design", v: "Cyber Serif · Magenta Accent" },
            { k: "Version", v: "Sprint 2 · 2.0" },
          ].map((row) => (
            <div
              key={row.k}
              className="rounded-xl border border-line px-4 py-3"
            >
              <p className="font-mono text-xs uppercase tracking-wider text-muted">
                {row.k}
              </p>
              <p className="mt-1 font-medium text-content">{row.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
