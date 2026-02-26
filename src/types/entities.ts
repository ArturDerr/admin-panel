export type MenuKey =
  | "products"
  | "users"
  | "orders"
  | "coupons"
  | "chats"
  | "reviews"
  | "complaints"
  | "bans"
  | "product_moderation";

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  userPhone: string;
}

export interface ProductAddon {
  addonCategory: string;
  addonTitle: string;
  addonPrice: number;
}

export type ProductAddonsByCategory = Record<string, ProductAddon[]>;

export interface Product {
  id: string;
  ownerPhone: string;
  title: string;
  category: string;
}

export interface ProductDetails extends Product {
  ownerAddress: string;
  productImages: string[];
  extensionAvailable: boolean;
  insuranceIncluded: boolean;
  freeCancellation: boolean;
  description: string;
  brand: string;
  condition: string;
  minRentalPeriod: string;
  maxRentalPeriod: string;
  pricePerHour: number;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  deposit: number;
  productCost: number;
  addons: ProductAddon[];
}

export interface User {
  phone: string;
  fullname: string;
}

export interface UserDetails extends User {
  createdAt: string;
  isOnline: boolean;
  address: string;
  addressCoordinates?: string;
  avatarUrl: string;
  rating: number;
  rentalSpentTotal: number;
  rentalIncomeTotal: number;
  isBanned: boolean;
}

export type OrderStatus = "pending" | "active" | "completed" | "cancelled";

export interface Order {
  id: string;
  ownerPhone: string;
  renterPhone: string;
  status: OrderStatus;
}

export interface OrderDetails extends Order {
  ownerNumber: string;
  rentalPhone: string;
  startDate: string;
  endDate: string;
  cost: number;
  tariff: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
}

export interface Chat {
  id: string;
  participantPhones: string[];
  lastMessage: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  authorPhone: string;
  targetPhone: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  fromPhone: string;
  againstPhone: string;
  reason: string;
  status: "new" | "in_progress" | "resolved" | "rejected";
  createdAt: string;
}

export interface Ban {
  id: string;
  phone: string;
  reason: string;
  startDate: string;
  endDate?: string;
  active: boolean;
}

export interface ProductModerationItem {
  id: string;
  productId: string;
  ownerPhone: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export type AnyListItem =
  | Product
  | User
  | Order
  | Coupon
  | Chat
  | Review
  | Complaint
  | Ban
  | ProductModerationItem;
