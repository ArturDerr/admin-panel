import type {
  AnyListItem,
  Ban,
  Chat,
  Complaint,
  Coupon,
  MenuKey,
  Order,
  OrderDetails,
  Product,
  ProductDetails,
  ProductModerationItem,
  Review,
  User,
  UserDetails,
} from "../types";
import { apiClient } from "./client";

export interface ApiListResponse<T> {
  items: T[];
  total: number;
}

type DashboardListMap = {
  products: Product;
  users: User;
  orders: Order;
  coupons: Coupon;
  chats: Chat;
  reviews: Review;
  complaints: Complaint;
  bans: Ban;
  product_moderation: ProductModerationItem;
};

type DashboardDetailsMap = {
  products: ProductDetails;
  users: UserDetails;
  orders: OrderDetails;
  coupons: Coupon;
  chats: Chat;
  reviews: Review;
  complaints: Complaint;
  bans: Ban;
  product_moderation: ProductModerationItem;
};

type ListQuery = {
  page?: number;
  perPage?: number;
  search?: string;
};

function toQueryString(query?: ListQuery): string {
  if (!query) return "";
  const params = new URLSearchParams();
  if (typeof query.page === "number") params.set("page", String(query.page));
  if (typeof query.perPage === "number") {
    params.set("perPage", String(query.perPage));
  }
  if (query.search) params.set("search", query.search);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function sectionPath(section: MenuKey): string {
  switch (section) {
    case "products":
      return "/admin/products";
    case "users":
      return "/admin/users";
    case "orders":
      return "/admin/orders";
    case "coupons":
      return "/admin/coupons";
    case "chats":
      return "/admin/chats";
    case "reviews":
      return "/admin/reviews";
    case "complaints":
      return "/admin/complaints";
    case "bans":
      return "/admin/bans";
    case "product_moderation":
      return "/admin/product-moderation";
    default:
      return "/admin";
  }
}

export async function fetchList<K extends MenuKey>(
  section: K,
  query?: ListQuery,
): Promise<ApiListResponse<DashboardListMap[K]>> {
  const path = `${sectionPath(section)}${toQueryString(query)}`;
  return apiClient.get<ApiListResponse<DashboardListMap[K]>>(path);
}

export async function fetchDetails<K extends MenuKey>(
  section: K,
  id: string,
): Promise<DashboardDetailsMap[K]> {
  const path = `${sectionPath(section)}/${encodeURIComponent(id)}`;
  return apiClient.get<DashboardDetailsMap[K]>(path);
}

export async function fetchProducts(query?: ListQuery) {
  return fetchList("products", query);
}

export async function fetchUsers(query?: ListQuery) {
  return fetchList("users", query);
}

export async function fetchOrders(query?: ListQuery) {
  return fetchList("orders", query);
}

export async function fetchCoupons(query?: ListQuery) {
  return fetchList("coupons", query);
}

export async function fetchChats(query?: ListQuery) {
  return fetchList("chats", query);
}

export async function fetchReviews(query?: ListQuery) {
  return fetchList("reviews", query);
}

export async function fetchComplaints(query?: ListQuery) {
  return fetchList("complaints", query);
}

export async function fetchBans(query?: ListQuery) {
  return fetchList("bans", query);
}

export async function fetchProductModeration(query?: ListQuery) {
  return fetchList("product_moderation", query);
}

export async function fetchProductDetails(id: string) {
  return fetchDetails("products", id);
}

export async function fetchUserDetails(phone: string) {
  return fetchDetails("users", phone);
}

export async function fetchOrderDetails(id: string) {
  return fetchDetails("orders", id);
}

export async function fetchSectionItems(
  section: MenuKey,
  query?: ListQuery,
): Promise<AnyListItem[]> {
  const result = await fetchList(section, query);
  return result.items as AnyListItem[];
}

export async function cancelOrder(id: string): Promise<OrderDetails> {
  return apiClient.patch<OrderDetails>(
    `/admin/orders/${encodeURIComponent(id)}/cancel`,
  );
}

export async function createProduct(
  payload: Omit<ProductDetails, "id"> & { id?: string },
): Promise<ProductDetails> {
  return apiClient.post<ProductDetails>("/admin/products", payload);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete<void>(`/admin/products/${encodeURIComponent(id)}`);
}

export async function createUser(
  payload: Omit<UserDetails, "phone"> & { phone: string },
): Promise<UserDetails> {
  return apiClient.post<UserDetails>("/admin/users", payload);
}

export async function deleteUser(phone: string): Promise<void> {
  await apiClient.delete<void>(`/admin/users/${encodeURIComponent(phone)}`);
}

export async function toggleUserBan(phone: string): Promise<UserDetails> {
  return apiClient.patch<UserDetails>(
    `/admin/users/${encodeURIComponent(phone)}/ban`,
  );
}
