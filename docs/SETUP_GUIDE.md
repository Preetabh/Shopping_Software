# Flipkart Clone — Local Setup & Deployment Guide

This guide provides step-by-step instructions to run the complete Flipkart-inspired e-commerce platform locally, execute automated tests, and seed demo catalogs and administrative accounts.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (Tested on Node.js v24.21.0)
- **Package Manager**: npm (v9.0.0 or higher)
- **Database**: MongoDB (Local instance or MongoDB Atlas URI)
- **Mobile Development (Optional)**: Expo Go app on iOS or Android, or a web browser for Expo Web.

---

## 2. Directory Structure

```text
Shooping_application/
├── backend/          # Node.js + Express.js + Mongoose REST API (Port 5050)
├── admin/            # React 19 + TypeScript + Vite + Tailwind Admin Panel (Port 5174)
├── mobile/           # React Native + Expo + TypeScript Customer App (Port 8081 / Expo)
└── docs/             # Architecture, REST API docs, and Setup guides
```

---

## 3. Backend Setup & Configuration

### A. Environment Configuration
Navigate to `backend/` and configure `.env`:
```bash
cd backend
```

Ensure `backend/.env` contains:
```env
PORT=5050
NODE_ENV=development
MONGODB_URI=mongodb+srv://admin:admin123@cluster0.mongodb.net/flipkart_store?retryWrites=true&w=majority
JWT_ACCESS_SECRET=flipkart_jwt_access_secret_super_secure_key_2026_x99!
JWT_REFRESH_SECRET=flipkart_jwt_refresh_secret_super_secure_key_2026_z88!
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
RAZORPAY_KEY_ID=rzp_test_flipkart_demo_key
RAZORPAY_KEY_SECRET=rzp_secret_demo_987654321
CLOUDINARY_CLOUD_NAME=demo_cloud
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=demo_secret_abcdef
CORS_ORIGIN=*
```

### B. Seed Database with Demo Catalog & Staff
Populate 6 categories, 10 verified brands, 9 flagship products with variants/specs/reviews, active coupons, hero banners, and 6 role accounts:
```bash
node src/seeds/seedDatabase.js
```

### C. Run Automated Tests
Verify all 20 authentication, permission, order, payment, and inventory tests pass:
```bash
npm test
```
*Expected Result: `Tests passed: 20, failed: 0`.*

### D. Start Backend Server
```bash
node src/server.js
# Or with auto-reload:
npm run dev
```
*Backend API online at: `http://localhost:5050/api/v1`*  
*Healthcheck: `http://localhost:5050/api/v1/health`*

---

## 4. Admin Dashboard Setup (`admin/`)

The admin dashboard provides 16 operations modules including KPI analytics, product inventory, order status transitions, Ekart delivery tracking, and customer support.

### A. Install Dependencies & Build
```bash
cd ../admin
npm install
npm run build
```
*Vite compiles the production bundle in ~1.5s with 0 errors.*

### B. Start Admin Dev Server
```bash
npm run dev -- --port 5174 --host
```
*Access the Admin Panel in your browser at: `http://localhost:5174/`*

---

## 5. Customer Mobile App Setup (`mobile/`)

Built with React Native Expo, Expo Router, and TypeScript. Supports Android, iOS, and Web.

### A. Environment & API URL
Verify `mobile/src/api/client.ts` points to the running backend:
- **Local Web / Simulator**: `http://localhost:5050/api/v1`
- **Physical Device over Wi-Fi**: `http://<YOUR_LOCAL_IP>:5050/api/v1` (e.g. `http://192.168.1.5:5050/api/v1`)

### B. Run TypeScript Verification
```bash
cd ../mobile
npx tsc --noEmit
```
*Expected Result: 0 errors.*

### C. Start Expo Metro Bundler
```bash
npx expo start
```
- Press `w` to open in your web browser.
- Press `a` to run on an attached Android emulator or device.
- Press `i` to run on iOS Simulator (macOS).
- Scan the QR code with the **Expo Go** app on your phone.

---

## 6. Pre-Seeded Test Credentials

All pre-seeded test accounts share the password: **`Password123!`**

| Account Role | Email Address | Access Level & Capabilities |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@flipkart.com` | Full unrestricted system access across all 16 modules. |
| **Admin** | `admin@flipkart.com` | High-level management, analytics, staff, and finance. |
| **Product Manager** | `products@flipkart.com` | Catalog, products, variants, categories, brands, inventory. |
| **Order Manager** | `orders@flipkart.com` | Orders, fulfillment status transitions, and Ekart delivery tracking. |
| **Support Agent** | `support@flipkart.com` | Review moderation and customer support tickets. |
| **Test Customer** | `rahul.sharma@example.com` | Customer shopping, addresses, cart, orders, wishlist. |

*Quick OTP Sign-In for Customer Mobile App:*
- Mobile Number: `9876543210`
- Development Test OTP: `123456`

---

## 7. Active Coupons for Testing

Enter these coupon codes in the Mobile App Cart to test real-time server-side discounts:
- **`FLIPKART10`**: 10% instant discount (Min order: ₹1,000, Max discount: ₹2,000)
- **`WELCOME500`**: Flat ₹500 off on first orders above ₹2,000
- **`BIGBILLION`**: Flat ₹1,000 off on flagship tech orders above ₹10,000
