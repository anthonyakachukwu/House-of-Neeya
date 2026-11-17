export type OrderStatus = "unfulfilled" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid";

export type OrderRow = {
  id: string;
  userId: string | null;
  addressId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentReference: string | null;
  reference: string | null;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
};

export type AddressRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
};

export type OrderItemRow = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  color: string | null;
  size: string | null;
};

export type ProductNameRow = { id: string; name: string };

export type AdminOrder = {
  id: string;
  reference: string;
  isGuest: boolean;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  shippingFee: number;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    variant: string;
  }[];
};

export function mapOrdersFromDatabase(
  orders: OrderRow[],
  addresses: AddressRow[],
  items: OrderItemRow[],
  products: ProductNameRow[],
): AdminOrder[] {
  const addressById = new Map(addresses.map((a) => [a.id, a]));
  const nameById = new Map(products.map((p) => [p.id, p.name]));

  return orders.map((order) => {
    const a = addressById.get(order.addressId);
    return {
      id: order.id,
      reference: order.reference ?? order.id.slice(0, 8),
      isGuest: order.userId === null,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: Number(order.total),
      shippingFee: Number(order.shippingFee),
      createdAt: order.createdAt,
      customer: {
        name: a ? `${a.firstName} ${a.lastName}` : "Unknown",
        email: a?.email ?? "",
        phone: a?.phone ?? "",
        address: a ? `${a.street}, ${a.city}, ${a.state}` : "",
      },
      items: items
        .filter((i) => i.orderId === order.id)
        .map((i) => ({
          id: i.id,
          name: nameById.get(i.productId) ?? "Deleted product",
          quantity: Number(i.quantity),
          unitPrice: Number(i.priceAtPurchase),
          variant: [i.color, i.size && `Size ${i.size}`]
            .filter(Boolean)
            .join(" • "),
        })),
    };
  });
}
