import { useQuery } from "@tanstack/react-query";
import { ScrollText, Download } from "lucide-react";
import { auditApi } from "../../services/api";
import { PageHeader } from "../../components/ui/PageHeader";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { formatDateTime } from "../../utils/format";
import type { AuditEntry } from "../../types";

// Colour-code the most common audit actions.
const tone = (
  action: string,
): "success" | "amber" | "red" | "sky" | "neutral" => {
  if (action === "CREATE") return "success";
  if (action === "DELETE") return "red";
  if (action === "UPDATE") return "amber";
  if (action.includes("APPLIED") || action.includes("ENABLED"))
    return "success";
  if (action.includes("REMOVED") || action.includes("DISABLED")) return "red";
  if (action.includes("PRICE")) return "amber";
  return "sky";
};

const columns: Column<AuditEntry>[] = [
  {
    key: "action",
    header: "Action",
    sortValue: (e) => e.action,
    render: (e) => (
      <Badge tone={tone(e.action)}>{e.action.replace(/_/g, " ")}</Badge>
    ),
  },
  {
    key: "entity",
    header: "Entity",
    sortValue: (e) => e.entity,
    render: (e) => (
      <span className="text-muted">
        {e.entity}{" "}
        <span className="font-mono text-xs">#{e.entityId.slice(0, 6)}</span>
      </span>
    ),
  },
  {
    key: "change",
    header: "Change",
    render: (e) =>
      e.oldValue && e.newValue ? (
        <span className="font-mono text-xs">
          {e.oldValue} → {e.newValue}
        </span>
      ) : e.newValue ? (
        <span className="font-mono text-xs">{e.newValue}</span>
      ) : (
        "—"
      ),
  },
  {
    key: "by",
    header: "By",
    render: (e) => (e.user ? `${e.user.firstName} ${e.user.lastName}` : "—"),
  },
  {
    key: "when",
    header: "When",
    align: "right",
    sortValue: (e) => e.timestamp,
    render: (e) => (
      <span className="text-muted">{formatDateTime(e.timestamp)}</span>
    ),
  },
];

export default function Audit() {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["audit"],
    queryFn: auditApi.list,
  });

  const exportToCSV = () => {
    if (!entries || entries.length === 0) return;
    const headers = ["Action", "Entity", "Entity ID", "Change", "User", "Timestamp"];
    const rows = entries.map((e) => [
      e.action,
      e.entity,
      e.entityId,
      e.oldValue && e.newValue ? `${e.oldValue} -> ${e.newValue}` : e.newValue || "",
      e.user ? `${e.user.firstName} ${e.user.lastName}` : "System",
      e.timestamp ? new Date(e.timestamp).toISOString() : "",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `audit_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <PageHeader
        title="Audit Trail"
        subtitle="Every database change tracked automatically — products, orders, users, inventory, discounts, and more."
        action={
          <Button variant="ghost" onClick={exportToCSV}>
            <Download size={16} /> Export CSV
          </Button>
        }
      />
      <DataTable
        data={entries ?? []}
        columns={columns}
        rowKey={(e) => e.id}
        loading={isLoading}
        search={(e) =>
          `${e.action} ${e.entity} ${e.user?.firstName ?? ""} ${e.user?.lastName ?? ""}`
        }
        searchPlaceholder="Search actions, entities, users…"
        emptyIcon={<ScrollText size={32} />}
        emptyText="No audit entries yet — apply a discount or change a price to see activity."
      />
    </div>
  );
}
