import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Layers } from "lucide-react";
import { categoryApi, productApi } from "../../services/api";
import { PageHeader } from "../../components/ui/PageHeader";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import type { Category } from "../../types";

export default function CategoryManagement() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const toast = useToast();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.list,
  });
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.list,
  });

  const [newName, setNewName] = useState("");
  const [editTarget, setEditTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editName, setEditName] = useState("");

  const addCat = useMutation({
    mutationFn: () => categoryApi.create({ name: newName }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setNewName("");
      toast.success("Category added");
    },
    onError: () => toast.error("Could not add category"),
  });
  const updateCat = useMutation({
    mutationFn: () => categoryApi.update(editTarget!.id, { name: editName }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setEditTarget(null);
      toast.success("Category updated");
    },
    onError: () => toast.error("Could not update category"),
  });
  const delCat = useMutation({
    mutationFn: (id: string) => categoryApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
    onError: () => toast.error("Cannot delete — products may still use it"),
  });

  const askDelete = async (c: Category) => {
    if (
      await confirm({
        title: "Delete category",
        message: `Delete "${c.name}"? Products in this category will become uncategorized.`,
        danger: true,
        confirmLabel: "Delete",
      })
    ) {
      delCat.mutate(c.id);
    }
  };

  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Category",
      sortValue: (c) => c.name,
      render: (c) => <span className="font-medium text-content">{c.name}</span>,
    },
    {
      key: "products",
      header: "Products",
      align: "right",
      render: (c) => (
        <span className="text-muted">
          {(products ?? []).filter((p) => p.categoryId === c.id).length} items
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (c) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setEditTarget(c);
              setEditName(c.name);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted hover:text-primary"
            aria-label="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => askDelete(c)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted hover:text-red-500"
            aria-label="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Category Management"
        subtitle="Organise your cleaning product categories."
        action={
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newName.trim()) addCat.mutate();
            }}
            className="flex gap-2"
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New category name"
              className="input-base w-52"
            />
            <Button type="submit" disabled={addCat.isPending}>
              <Plus size={16} /> Add
            </Button>
          </form>
        }
      />

      <DataTable
        data={categories ?? []}
        columns={columns}
        rowKey={(c) => c.id}
        loading={isLoading}
        search={(c) => c.name}
        searchPlaceholder="Search categories…"
        emptyIcon={<Layers size={32} />}
        emptyText="No categories yet — add your first one."
      />

      {/* Edit modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit category"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateCat.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Category name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditTarget(null)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateCat.isPending}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
