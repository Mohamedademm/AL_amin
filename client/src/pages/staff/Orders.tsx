import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, ShieldCheck, PackageOpen, Truck, Download } from "lucide-react";
import { orderApi } from "../../services/api";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../lib/cn";
import { formatDateTime, formatPrice } from "../../utils/format";
import type { Order, OrderStatus } from "../../types";

const filters: (OrderStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "VERIFYING",
  "ACCEPTED",
  "SHIPPING",
  "DELIVERED",
  "REFUSED",
];

export default function StaffOrders() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["all-orders"],
    queryFn: orderApi.list,
  });
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderApi.updateStatus(id, status),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["all-orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(`Order moved to ${vars.status}`);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Could not update the order"),
  });

  const busy = mutation.isPending;
  const act = (id: string, status: OrderStatus) =>
    mutation.mutate({ id, status });

  const [exporting, setExporting] = useState(false);
  // Stream the current order list to a downloadable CSV file.
  const handleExport = async () => {
    setExporting(true);
    try {
      await orderApi.exportCsv();
    } catch {
      toast.error("Could not export orders");
    } finally {
      setExporting(false);
    }
  };

  const columns: Column<Order>[] = [
    {
      key: "order",
      header: "Order",
      sortValue: (o) => o.createdAt,
      render: (o) => (
        <div>
          <p className="font-mono text-sm font-semibold">
            #{o.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-muted">{formatDateTime(o.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "client" as const,
      header: "Client" as const,
      sortValue: (o: Order) => o.client?.lastName ?? "",
      render: (o: Order) =>
        o.client
          ? `${o.client.firstName} ${o.client.lastName}`
          : "Client",
    },
    {
      key: "details",
      header: "Details",
      render: (o) => (
        <span className="text-muted">
          {o.items?.length ?? 0} item(s) · {o.spot?.name ?? "Boutique"}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      align: "right" as const,
      sortValue: (o) => Number(o.totalAmount),
      render: (o) => (
        <span className="font-mono font-semibold">
          {formatPrice(o.totalAmount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (o) => o.status,
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (o) => {
        if (o.status === "PENDING") {
          return (
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                disabled={busy}
                onClick={() => act(o.id, "VERIFYING")}
              >
                <ShieldCheck size={15} /> Verify
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={busy}
                onClick={() => act(o.id, "REFUSED")}
              >
                <X size={15} />
              </Button>
            </div>
          );
        }
        if (o.status === "VERIFYING") {
          return (
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                disabled={busy}
                onClick={() => act(o.id, "ACCEPTED")}
              >
                <Check size={15} /> Accept
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={busy}
                onClick={() => act(o.id, "REFUSED")}
              >
                <X size={15} />
              </Button>
            </div>
          );
        }
        if (o.status === "ACCEPTED") {
          return (
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                disabled={busy}
                onClick={() => act(o.id, "SHIPPING")}
              >
                <Truck size={15} /> Ship
              </Button>
            </div>
          );
        }
        if (o.status === "SHIPPING") {
          return (
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                disabled={busy}
                onClick={() => act(o.id, "DELIVERED")}
              >
                <Check size={15} /> Deliver
              </Button>
            </div>
          );
        }
        return <span className="text-xs text-muted">Finalized</span>;
      },
    },
  ];

  const data = (orders ?? []).filter(
    (o) => filter === "ALL" || o.status === filter,
  );

  return (
    <div>
      <PageHeader
        title="Order Management"
        subtitle="Verify, accept, ship and deliver incoming customer orders."
        action={
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting || (orders?.length ?? 0) === 0}
          >
            <Download size={16} /> {exporting ? "Exporting…" : "Export CSV"}
          </Button>
        }
      />

      <DataTable
        data={data}
        columns={columns}
        rowKey={(o) => o.id}
        loading={isLoading}
        search={(o) =>
          `${o.id} ${o.client?.firstName ?? ""} ${o.client?.lastName ?? ""} ${o.spot?.name ?? ""}`
        }
        searchPlaceholder="Search by order # or client…"
        emptyIcon={<PackageOpen size={32} />}
        emptyText="No orders in this view."
        toolbar={filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
              filter === f
                ? "border-primary bg-primary text-primary-contrast"
                : "border-line text-muted hover:text-content",
            )}
          >
            {f}
          </button>
        ))}
      />
    </div>
  );
}
