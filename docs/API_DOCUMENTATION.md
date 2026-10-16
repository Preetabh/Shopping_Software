# Flipkart Clone — REST API Specification & Reference Guide

**Base URL**: `http://localhost:5050/api/v1`  
**Authentication**: Bearer Token (`Authorization: Bearer <access_token>`)

---

## 1. Authentication & Identity (`/auth`)

### `POST /auth/register`
Register a new customer account.
- **Request Body**:
```json
{
  "name": "Rahul Sharma",
  "email": "rahul.sharma@example.com",
  "phone": "9876543210",
  "password": "Password123!"
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "67104b2a...",
      "name": "Rahul Sharma",
      "email": "rahul.sharma@example.com",
      "role": "CUSTOMER"
    },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### `POST /auth/login`
Authenticate with email/password (both customers and staff).
- **Request Body**:
```json
{
  "email": "rahul.sharma@example.com",
  "password": "Password123!"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "67104b2a...",
      "name": "Rahul Sharma",
      "email": "rahul.sharma@example.com",
      "role": "CUSTOMER"
    },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### `POST /auth/otp/request`
Request a 6-digit one-time password for passwordless mobile sign-in.
- **Request Body**:
```json
{
  "phone": "9876543210"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "message": "OTP sent to 9876543210",
    "otp": "123456"
  }
}
```

### `POST /auth/otp/verify`
Verify mobile OTP and authenticate.
- **Request Body**:
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

### `GET /auth/me`
Retrieve currently authenticated user profile and permissions.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`): User object with roles and permissions.

---

## 2. Product Catalog (`/products` & `/categories`)

### `GET /products`
Retrieve paginated product catalog with filtering and sorting.
- **Query Parameters**:
  - `page`: default `1`
  - `limit`: default `20`
  - `category`: Category ID or slug
  - `brand`: Brand ID
  - `search`: Keyword string
  - `minPrice`, `maxPrice`: Numeric range
  - `sort`: `price`, `-price`, `-rating.average`, `createdAt`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "_id": "67104b2a...",
      "title": "Apple iPhone 15 Pro (128 GB) - Natural Titanium",
      "slug": "apple-iphone-15-pro-128gb",
      "price": 127999,
      "mrp": 134900,
      "discountPercent": 5,
      "stock": 25,
      "thumbnail": "https://images.unsplash.com/...",
      "rating": { "average": 4.8, "count": 1420 },
      "brand": { "name": "Apple" },
      "category": { "name": "Mobiles" }
    }
  ],
  "pagination": { "page": 1, "totalPages": 1, "totalItems": 9 }
}
```

### `GET /products/home-sections`
Fetch curated homepage sections: Deals of the Day, Trending Tech, and Featured picks.

### `GET /products/:id` or `GET /products/slug/:slug`
Fetch full product details, variants, specifications table, and customer reviews.

### `GET /categories?parent=root`
Retrieve top-level departmental categories with subcategory arrays.

---

## 3. Shopping Cart & Coupons (`/cart`)

### `GET /cart`
Retrieve active customer cart with server-verified prices and applied coupons.
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "item1",
        "product": { "_id": "...", "title": "iPhone 15 Pro", "price": 127999, "mrp": 134900 },
        "quantity": 1,
        "price": 127999,
        "mrp": 134900
      }
    ],
    "pricing": {
      "subtotal": 127999,
      "mrpTotal": 134900,
      "totalDiscount": 6901,
      "couponDiscount": 1000,
      "deliveryCharge": 0,
      "totalAmount": 126999
    },
    "coupon": { "code": "BIGBILLION", "discountAmount": 1000 }
  }
}
```

### `POST /cart/items`
Add item to cart or increment quantity.
- **Request Body**: `{ "productId": "...", "quantity": 1, "variantId": "..." }`

### `PUT /cart/items/:id`
Update line item quantity (`{ "quantity": 2 }`).

### `DELETE /cart/items/:id`
Remove line item from cart.

### `POST /cart/coupon`
Apply coupon code with server-side validation.
- **Request Body**: `{ "code": "FLIPKART10" }`

### `DELETE /cart/coupon`
Remove applied coupon from cart.

---

## 4. Checkout & Orders (`/orders`)

### `POST /orders`
Create a confirmed order with server-side pricing, inventory reservation, and address snapshot.
- **Request Body**:
```json
{
  "shippingAddressId": "67104b2a...",
  "paymentMethod": "ONLINE_RAZORPAY",
  "couponCode": "FLIPKART10"
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "67104b2a...",
    "orderId": "OD1729068000123",
    "totalAmount": 126999,
    "paymentMethod": "ONLINE_RAZORPAY",
    "paymentStatus": "PENDING",
    "orderStatus": "PENDING"
  }
}
```

### `GET /orders/my-orders`
Retrieve customer's order history with tracking timeline and return/cancellation status.

### `POST /orders/:id/cancel`
Cancel an active order prior to shipment.
- **Request Body**: `{ "reason": "Placed by mistake" }`

### `POST /orders/:id/return`
Request return and refund for a delivered item.
- **Request Body**: `{ "reason": "Defective item", "comments": "Screen issue" }`

---

## 5. Payments (`/payments`)

### `POST /payments/razorpay/order`
Initialize Razorpay order entity.
- **Request Body**: `{ "orderId": "..." }`
- **Response** (`200 OK`): `{ "razorpayOrderId": "order_EK... ", "amount": 12699900, "currency": "INR" }`

### `POST /payments/razorpay/verify`
Verify HMAC SHA256 payment signature.
- **Request Body**:
```json
{
  "razorpay_order_id": "order_EK...",
  "razorpay_payment_id": "pay_EK...",
  "razorpay_signature": "9a38f..."
}
```

---

## 6. Administrative Management APIs (`/admin`)

*(Requires roles: `SUPER_ADMIN`, `ADMIN`, `PRODUCT_MANAGER`, or `ORDER_MANAGER`)*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/dashboard/stats` | KPI summary (Revenue, Orders, Low Stock Alerts, Customers) |
| `GET` | `/admin/products` | Admin product table with stock levels & publish toggles |
| `POST` | `/admin/products` | Create product with variants, specs & images |
| `PUT` | `/admin/products/:id` | Update product catalog details |
| `DELETE` | `/admin/products/:id` | Soft delete / archive product |
| `GET` | `/admin/inventory` | Inventory movement ledger & low stock warnings |
| `POST` | `/admin/inventory/adjust` | Adjust stock with reason (`RESTOCK`, `DAMAGE`) |
| `GET` | `/admin/orders` | Admin orders list with status filters |
| `PUT` | `/admin/orders/:id/status` | Advance fulfillment status (`CONFIRMED` ➔ `DELIVERED`) |
| `GET` | `/admin/customers` | Customer CRM profiles & order statistics |
| `GET` | `/admin/coupons` | List all promotional coupon discount rules |
| `POST` | `/admin/coupons` | Create coupon rule with limits & expiry |
| `GET` | `/admin/audit-logs` | Immutable security activity logs |
| `GET` | `/admin/reports` | Sales trends, top-selling SKUs & CSV export |
