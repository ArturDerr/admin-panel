### POST /auth/login
**Request:**
```typescript
{
  phone: string;
  password: string;
}
```

**Response:**
```typescript
{
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  userPhone: string;
}
```

### POST /auth/refresh
**Response:**
```typescript
{
  accessToken: string;
}
```

## Products

### GET /admin/products
**Request:**
```typescript
{
  page?: number;
  perPage?: number;
  search?: string;
}
```

**Response:**
```typescript
{
  items: Product[];
  total: number;
}
```

### GET /admin/products/{id}
**Response:**
```typescript
ProductDetails
```

### POST /admin/products
**Request:**
```
FormData {
  productData: string; 
  image1?: File;
  image2?: File;
  image3?: File;
  image4?: File;
}
```

**Response:**
```typescript
ProductDetails
```

### DELETE /admin/products/{id}

## Users

### GET /admin/users
**Request:**
```typescript
{
  page?: number;
  perPage?: number;
  search?: string;
}
```

**Response:**
```typescript
{
  items: User[];
  total: number;
}
```

### GET /admin/users/{phone}
**Response:**
```typescript
UserDetails
```

### POST /admin/users
**Request:**
```typescript
Omit<UserDetails, "phone"> & { phone: string }
```

**Response:**
```typescript
UserDetails
```

### DELETE /admin/users/{phone}

### PATCH /admin/users/{phone}/ban
**Response:**
```typescript
UserDetails
```

## Orders

### GET /admin/orders
**Request:**
```typescript
{
  page?: number;
  perPage?: number;
  search?: string;
}
```

**Response:**
```typescript
{
  items: Order[];
  total: number;
}
```

### GET /admin/orders/{id}
**Response:**
```typescript
OrderDetails
```

### PATCH /admin/orders/{id}/cancel
**Response:**
```typescript
OrderDetails
```

## Coupons

### GET /admin/coupons
**Request:**
```typescript
{
  page?: number;
  perPage?: number;
  search?: string;
}
```

**Response:**
```typescript
{
  items: Coupon[];
  total: number;
}
```

### GET /admin/coupons/{id}
**Response:**
```typescript
Coupon
```

### POST /admin/coupons
**Request:**
```typescript
Omit<Coupon, "id"> & { id?: string }
```

**Response:**
```typescript
Coupon
```

## Chats

### GET /admin/chats
**Request:**
```typescript
{
  page?: number;
  perPage?: number;
  search?: string;
}
```

**Response:**
```typescript
{
  items: Chat[];
  total: number;
}
```

### GET /admin/chats/{id}
**Response:**
```typescript
Chat
```

## Reviews

### GET /admin/reviews
**Request:**
```typescript
{
  page?: number;
  perPage?: number;
  search?: string;
}
```

**Response:**
```typescript
{
  items: Review[];
  total: number;
}
```

### GET /admin/reviews/{id}
**Response:**
```typescript
Review
```

## Complaints

### GET /admin/complaints
**Request:**
```typescript
{
  page?: number;
  perPage?: number;
  search?: string;
}
```

**Response:**
```typescript
{
  items: Complaint[];
  total: number;
}
```

### GET /admin/complaints/{id}
**Response:**
```typescript
Complaint
```

## Bans

### GET /admin/bans
**Request:**
```typescript
{
  page?: number;
  perPage?: number;
  search?: string;
}
```

**Response:**
```typescript
{
  items: Ban[];
  total: number;
}
```

### GET /admin/bans/{id}
**Response:**
```typescript
Ban
```

## Product Moderation

### GET /admin/product-moderation
**Request:**
```typescript
{
  page?: number;
  perPage?: number;
  search?: string;
}
```

**Response:**
```typescript
{
  items: ProductModerationItem[];
  total: number;
}
```

### GET /admin/product-moderation/{id}
**Response:**
```typescript
ProductModerationItem
```

## Типы 

```typescript

interface Product {
  id: string;
  ownerPhone: string;
  title: string;
  category: string;
}

interface ProductDetails extends Product {
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

interface ProductAddon {
  addonCategory: string;
  addonTitle: string;
  addonPrice: number;
}

interface User {
  phone: string;
  fullname: string;
}

interface UserDetails extends User {
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

interface Order {
  id: string;
  ownerPhone: string;
  renterPhone: string;
  status: "pending" | "active" | "completed" | "cancelled";
}

interface OrderDetails extends Order {
  ownerNumber: string;
  rentalPhone: string;
  startDate: string;
  endDate: string;
  cost: number;
  tariff: string;
}

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
}

interface Chat {
  id: string;
  participantPhones: string[];
  lastMessage: string;
  updatedAt: string;
}

interface Review {
  id: string;
  authorPhone: string;
  targetPhone: string;
  rating: number;
  text: string;
  createdAt: string;
}

interface Complaint {
  id: string;
  fromPhone: string;
  againstPhone: string;
  reason: string;
  status: "new" | "in_progress" | "resolved" | "rejected";
  createdAt: string;
}

interface Ban {
  id: string;
  phone: string;
  reason: string;
  startDate: string;
  endDate?: string;
  active: boolean;
}

interface ProductModerationItem {
  id: string;
  productId: string;
  ownerPhone: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}
```