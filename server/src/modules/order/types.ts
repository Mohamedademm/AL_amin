// A single line requested by the client when placing an order.
export interface OrderItemInput {
  productId: string;
  quantity: number;
}

// Payload accepted by POST /api/orders.
export interface OrderCreateInput {
  items: OrderItemInput[];
  address: string;
  phone: string;
  spotId?: string; // optional preferred fulfillment spot
}
