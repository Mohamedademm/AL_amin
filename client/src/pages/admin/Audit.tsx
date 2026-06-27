import { useQuery } from "@tanstack/react-query";
import { ScrollText } from "lucide-react";
import { auditApi } from "../../services/api";
import { PageHeader } from "../../components/ui/PageHeader";
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

  return (
    <div>
      <PageHeader
        title="Audit Trail"
        subtitle="Every database change tracked automatically — products, orders, users, inventory, discounts, and more."
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
