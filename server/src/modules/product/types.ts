import { Product } from '@prisma/client';

export interface ProductCreateInput {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
}

export interface ProductUpdateInput {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  imageUrl?: string;
}
