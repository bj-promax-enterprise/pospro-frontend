export type Role = "ADMIN" | "MANAGER" | "CASHIER";

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: Role;
  storeId: string | null;
  storeName: string | null;
}

export interface Store {
  id: string;
  name: string;
  address: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export type PromotionDiscountType = "PERCENT" | "FIXED";

export interface Promotion {
  id: string;
  productId: string;
  discountType: PromotionDiscountType;
  value: number;
  active: boolean;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
}

export interface ActivePromotion {
  id: string;
  discountType: PromotionDiscountType;
  value: number;
  discountedPriceCents: number;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  unit: string;
  priceCents: number;
  costCents: number;
  categoryId: string | null;
  imageUrl: string | null;
  category?: Category | null;
  active: boolean;
  activePromotion?: ActivePromotion | null;
}

export type InventoryLogType = "STOCK_IN" | "SALE" | "REFUND" | "ADJUSTMENT";

export interface InventoryItem {
  id: string;
  productId: string;
  storeId: string;
  quantity: number;
  lowStockThreshold: number;
  product: Product;
  isLowStock: boolean;
}

export interface InventoryLog {
  id: string;
  productId: string;
  storeId: string;
  type: InventoryLogType;
  quantityChange: number;
  note: string | null;
  userId: string | null;
  orderId: string | null;
  createdAt: string;
  product: Pick<Product, "id" | "name" | "sku">;
}

export type PaymentMethod = "CASH" | "CARD" | "QR";
export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED"
  | "VOID";

export interface OrderItem {
  id: string;
  productId: string;
  productNameSnapshot: string;
  unitPriceCents: number;
  quantity: number;
  discountCents: number;
  subtotalCents: number;
  refundedQuantity: number;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  amountCents: number;
}

export interface RefundItem {
  id: string;
  orderItemId: string;
  quantity: number;
  amountCents: number;
}

export interface Refund {
  id: string;
  orderId: string;
  userId: string;
  reason: string | null;
  totalRefundedCents: number;
  createdAt: string;
  items: RefundItem[];
}

export type OrderSourceType = "POS" | "SELF_ORDER" | "DELIVERY";
export type DeliveryPlatform = "GRAB" | "SHOPEE_FOOD" | "FOODPANDA" | "OTHER";

export interface Order {
  id: string;
  orderNo: string;
  storeId: string;
  userId: string | null;
  source: OrderSourceType;
  status: OrderStatus;
  pickupNo: string | null;
  tableLabel: string | null;
  deliveryAddress: string | null;
  deliveryPhone: string | null;
  deliveryPlatform: DeliveryPlatform | null;
  memberId: string | null;
  pointsEarned: number;
  pointsRedeemed: number;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  createdAt: string;
  items: OrderItem[];
  payments: Payment[];
  refunds: Refund[];
  user?: { id: string; name: string } | null;
  member?: { id: string; name: string; phone: string; pointsBalance: number } | null;
}

export interface Member {
  id: string;
  phone: string;
  name: string;
  pointsBalance: number;
  active: boolean;
  createdAt: string;
}

export type CouponDiscountType = "PERCENT" | "FIXED";

export interface Coupon {
  id: string;
  code: string;
  memberId: string;
  discountType: CouponDiscountType;
  value: number;
  redeemed: boolean;
  redeemedAt: string | null;
  orderId: string | null;
  createdAt: string;
}

export interface MemberDetail extends Member {
  coupons: Coupon[];
}

export interface AppUser {
  id: string;
  username: string;
  name: string;
  role: Role;
  storeId: string | null;
  active: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

export type PurchaseOrderStatus = "PENDING" | "RECEIVED" | "CANCELLED";

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  unitCostCents: number;
  product: Pick<Product, "id" | "name" | "sku" | "unit">;
}

export interface Table {
  id: string;
  storeId: string;
  label: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  storeId: string;
  status: PurchaseOrderStatus;
  note: string | null;
  createdAt: string;
  receivedAt: string | null;
  supplier: Supplier;
  store: Store;
  items: PurchaseOrderItem[];
}
