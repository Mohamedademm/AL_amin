import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  SprayCan as Spray,
  Upload,
  X,
} from "lucide-react";
import { productApi, categoryApi } from "../../services/api";
import { PageHeader } from "../../components/ui/PageHeader";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { ProductImage } from "../../components/common/ProductImage";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { formatPrice } from "../../utils/format";
import type { Product } from "../../types";

interface FormState {
  id?: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrls: string[]; // existing remote image URLs (from DB)
  imageFiles: File[]; // newly selected local files
}

const EMPTY: FormState = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  imageUrls: [],
  imageFiles: [],
};

export default function ProductManagement() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.list,
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.list,
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["products"] });

  const save = useMutation({
    mutationFn: (f: FormState) => {
      const payload: any = {
        name: f.name,
        description: f.description,
        price: Number(f.price),
        categoryId: f.categoryId,
      };
      if (f.imageFiles.length > 0) {
        payload.imageFiles = f.imageFiles;
      } else if (f.imageUrls.length > 0) {
        payload.imageUrl = f.imageUrls[0];
      }
      return f.id
        ? productApi.update(f.id, payload)
        : productApi.create(payload);
    },
    onSuccess: () => {
      invalidate();
      setOpen(false);
      toast.success("Product saved");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Could not save the product"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => productApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Product deleted");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Could not delete the product"),
  });

  const askDelete = async (p: Product) => {
    if (
      await confirm({
        title: "Delete product",
        message: `Delete "${p.name}"? This cannot be undone.`,
        danger: true,
        confirmLabel: "Delete",
      })
    ) {
      remove.mutate(p.id);
    }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setForm((prev) => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...files],
    }));
    // Reset input so selecting the same file fires onChange again.
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeFile = (i: number) => {
    setForm((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, idx) => idx !== i),
    }));
  };

  const removeRemoteImage = (url: string) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((u) => u !== url),
    }));
  };

  const openCreate = () => {
    setForm({ ...EMPTY, categoryId: categories?.[0]?.id ?? "" });
    setOpen(true);
  };
  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      categoryId: p.categoryId,
      imageUrls:
        p.images?.map((img) => img.url) || (p.imageUrl ? [p.imageUrl] : []),
      imageFiles: [],
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: "Product",
      sortValue: (p) => p.name,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 overflow-hidden rounded-lg bg-surface-2">
            <ProductImage
              src={p.imageUrl}
              alt={p.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium text-content">{p.name}</p>
            {(p.images?.length ?? 0) > 1 && (
              <p className="text-[10px] text-muted">
                {p.images!.length} photos
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortValue: (p) => p.category?.name ?? "",
      render: (p) => <span className="text-muted">{p.category?.name}</span>,
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      sortValue: (p) => Number(p.price),
      render: (p) => <span className="font-mono">{formatPrice(p.price)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (p) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => openEdit(p)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted hover:text-primary"
            aria-label="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => askDelete(p)}
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
        title="Cleaning Products"
        subtitle="Manage your cleaning product inventory — detergents, tools & supplies."
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> Add product
          </Button>
        }
      />

      <DataTable
        data={products ?? []}
        columns={columns}
        rowKey={(p) => p.id}
        loading={isLoading}
        search={(p) => `${p.name} ${p.category?.name ?? ""}`}
        searchPlaceholder="Search products…"
        emptyIcon={<Spray size={32} />}
        emptyText="No cleaning products yet — add your first one."
      />

      <Modal
        open={open}
        onClose={handleClose}
        title={form.id ? "Edit product" : "New cleaning product"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(form);
          }}
          className="space-y-4"
        >
          <Input
            label="Product name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="input-base resize-none"
              placeholder="e.g. Surface type, scent, volume…"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (TND)"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-content">
                Category
              </label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
                className="input-base"
                required
              >
                <option value="" disabled>
                  Select…
                </option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Multi-image upload gallery */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content">
              Product photos (max 5)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {/* Existing remote images */}
              {form.imageUrls.map((url) => (
                <div
                  key={url}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-surface-2"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeRemoteImage(url)}
                    className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white group-hover:flex"
                    aria-label="Remove"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {/* New local files */}
              {form.imageFiles.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-surface-2"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white group-hover:flex"
                    aria-label="Remove"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {/* Add image button */}
              {form.imageUrls.length + form.imageFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-line text-muted transition-colors hover:border-primary hover:text-primary"
                >
                  <Upload size={20} />
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFiles}
            />
            <p className="mt-1.5 text-[10px] text-muted">
              JPEG, PNG, WebP or GIF — max 5MB each, up to 5 photos
            </p>
          </div>

          {save.isError && (
            <p className="text-sm text-red-500">Could not save the product.</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
