import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Trash2,
  Pencil,
  Users as UsersIcon,
  Search,
  UserPlus,
  Crown,
  Briefcase,
  Wrench,
  User,
  ChevronLeft,
  ChevronRight,
  Mail,
  Lock,
  Phone,
} from "lucide-react";
import { userApi } from "../../services/api";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { PageLoader } from "../../components/ui/Spinner";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../lib/cn";
import { formatDate, initials } from "../../utils/format";
import type { Role, User as UserType } from "../../types";

const allRoles: Role[] = ["ADMIN", "MANAGER", "WORKER", "CLIENT"];
const PAGE_SIZE = 8;

// Visual identity for each role (icon + colour tone).
const roleConfig: Record<
  Role,
  { icon: typeof Crown; tone: "primary" | "sky" | "amber" | "neutral" }
> = {
  ADMIN: { icon: Crown, tone: "primary" },
  MANAGER: { icon: Briefcase, tone: "sky" },
  WORKER: { icon: Wrench, tone: "amber" },
  CLIENT: { icon: User, tone: "neutral" },
};

interface FormState {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  password: string;
}
const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "CLIENT",
  password: "",
};

export default function UserManagement() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const toast = useToast();
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => userApi.list("CLIENT"),
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [formError, setFormError] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["users"] });

  // Inline quick edits (role select, status toggle).
  const quickUpdate = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserType> }) =>
      userApi.update(id, data),
    onSuccess: () => {
      invalidate();
      toast.success("User updated");
    },
    onError: () => toast.error("Could not update the user"),
  });

  // Create or edit a user from the modal.
  const saveUser = useMutation({
    mutationFn: (f: FormState) =>
      f.id
        ? userApi.update(f.id, {
            firstName: f.firstName,
            lastName: f.lastName,
            phone: f.phone,
            role: f.role,
          })
        : userApi.create({
            email: f.email,
            password: f.password,
            firstName: f.firstName,
            lastName: f.lastName,
            role: f.role,
            phone: f.phone || undefined,
          }),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
      toast.success(form.id ? "User updated" : "User created");
    },
    onError: (e: any) =>
      setFormError(e?.response?.data?.message || "Could not save the user."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => userApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("User deleted");
    },
    onError: () => toast.error("Could not delete the user"),
  });

  const askDelete = async (u: UserType) => {
    if (
      await confirm({
        title: "Delete user",
        message: `Delete ${u.firstName} ${u.lastName}? This cannot be undone.`,
        danger: true,
        confirmLabel: "Delete",
      })
    ) {
      remove.mutate(u.id);
    }
  };

  const openCreate = () => {
    setForm(EMPTY);
    setFormError("");
    setModalOpen(true);
  };
  const openEdit = (u: UserType) => {
    setForm({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone ?? "",
      role: u.role,
      password: "",
    });
    setFormError("");
    setModalOpen(true);
  };

  // Headline counts.
  const stats = useMemo(() => {
    const list = users ?? [];
    return {
      total: list.length,
      active: list.filter((u) => u.status === "ACTIVE").length,
      disabled: list.filter((u) => u.status !== "ACTIVE").length,
    };
  }, [users]);

  // Apply free-text search.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (users ?? []).filter(
      (u) =>
        !q ||
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q),
    );
  }, [users, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <PageLoader label="Loading users" />;

  return (
    <div>
      <PageHeader
        title="User Directory"
        subtitle="Create, manage and audit every account on the platform."
        action={
          <Button onClick={openCreate}>
            <UserPlus size={16} /> Add user
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total clients"
          value={stats.total}
          icon={<UsersIcon size={20} />}
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={<User size={20} />}
          tone="success"
        />
        <StatCard
          label="Disabled"
          value={stats.disabled}
          icon={<User size={20} />}
          tone="red"
        />
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative w-full lg:w-72">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="input-base pl-11"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left font-mono text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((u) => {
                const RoleIcon = roleConfig[u.role].icon;
                return (
                  <tr
                    key={u.id}
                    className="border-b border-line/60 last:border-0 hover:bg-surface-2/50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                          {initials(u.firstName, u.lastName)}
                        </span>
                        <div>
                          <p className="font-medium text-content">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-xs text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={roleConfig[u.role].tone}>
                        <RoleIcon size={12} /> {u.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() =>
                          quickUpdate.mutate({
                            id: u.id,
                            data: {
                              status:
                                u.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
                            },
                          })
                        }
                        title="Toggle status"
                      >
                        <Badge tone={u.status === "ACTIVE" ? "success" : "red"}>
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              u.status === "ACTIVE"
                                ? "bg-primary"
                                : "bg-red-500",
                            )}
                          />{" "}
                          {u.status}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {u.createdAt ? formatDate(u.createdAt) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted hover:text-primary"
                          aria-label="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => askDelete(u)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted hover:text-red-500"
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-muted">
                    <UsersIcon size={32} className="mx-auto mb-2 opacity-50" />
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm">
            <p className="text-muted">
              Showing{" "}
              <span className="text-content">
                {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:text-content disabled:opacity-40"
                aria-label="Previous"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-mono text-xs text-muted">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:text-content disabled:opacity-40"
                aria-label="Next"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? "Edit user" : "Add a new user"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setFormError("");
            saveUser.mutate(form);
          }}
          className="space-y-4"
        >
          {formError && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {formError}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <Input
              label="Last name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            icon={<Mail size={17} />}
            required
            disabled={!!form.id}
          />
          <Input
            label="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            icon={<Phone size={17} />}
          />
          <div
            className={cn(
              "grid gap-3",
              form.id ? "grid-cols-1" : "grid-cols-2",
            )}
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-content">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as Role })
                }
                className="input-base"
              >
                {allRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            {!form.id && (
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                icon={<Lock size={17} />}
                required
                minLength={8}
                placeholder="≥ 8 chars, 1 letter + 1 number"
              />
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saveUser.isPending}>
              {saveUser.isPending
                ? "Saving…"
                : form.id
                  ? "Save changes"
                  : "Create user"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
