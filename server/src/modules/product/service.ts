import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { ProductCreateInput, ProductUpdateInput } from "./types";
import { getActiveDiscounts, attachPricing } from "../../lib/pricing";

/**
 * Service handling business logic for Products.
 */
export const ProductService = {
  /**
   * Retrieves all products with their category, images and live discounted price.
   */
  async getAll() {
    const [products, discounts] = await Promise.all([
      prisma.product.findMany({
        include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
        orderBy: { name: "asc" },
      }),
      getActiveDiscounts(),
    ]);
    return products.map((p) => attachPricing(p, discounts));
  },

  /**
   * Retrieves a single product by ID with its live discounted price.
   */
  async getById(id: string) {
    const [product, discounts] = await Promise.all([
      prisma.product.findUnique({
        where: { id },
        include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
      }),
      getActiveDiscounts(),
    ]);
    return product ? attachPricing(product, discounts) : null;
  },

  /**
   * Creates a new product with optional gallery images.
   */
  async create(data: ProductCreateInput, imageUrls: string[] = []) {
    if (!data || !data.name) {
      throw new AppError(
        `ProductService.create received invalid data: ${JSON.stringify(data)}`,
        500,
      );
    }
    return prisma.product.create({
      data: {
        ...data,
        images: {
          create: imageUrls.map((url, i) => ({ url, sortOrder: i })),
        },
      },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
  },

  /**
   * Updates a product, replacing gallery images and recording price changes.
   */
  async update(
    id: string,
    data: ProductUpdateInput,
    newImageUrls: string[] = [],
    _userId?: string,
  ) {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        // Replace product images when new ones are uploaded.
        ...(newImageUrls.length > 0
          ? {
              images: {
                deleteMany: {},
                create: newImageUrls.map((url, i) => ({ url, sortOrder: i })),
              },
            }
          : {}),
      },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });

    return updated;
  },

  /**
   * Deletes a product, removing related inventory and discount records first.
   * Throws if the product has existing order items (historical orders). Images
   * are cascade-deleted by the database.
   */
  async delete(id: string) {
    const orderItems = await prisma.orderItem.count({
      where: { productId: id },
    });
    if (orderItems > 0) {
      throw new AppError(
        "Cannot delete a product that is linked to existing orders. Archive it instead.",
        400,
      );
    }

    await prisma.$transaction([
      prisma.inventory.deleteMany({ where: { productId: id } }),
      prisma.discount.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);
  },
};
