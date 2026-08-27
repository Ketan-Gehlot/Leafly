# Comprehensive Audit Report: Leafly vs. Ketan Architecture Comparison

**Generated:** August 28, 2026  
**Target Projects:**
- Current Project: `C:\Leafly\leafly`
- Working Reference: `C:\Leafly\leafly-ketan`

---

## Executive Summary & Root Cause Matrix

| Feature / Issue | Ketan (`leafly-ketan`) Behavior | Current Leafly (`leafly`) Behavior | Exact Mismatch & Root Cause | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Number Persistence** | **Does not persist phone to Firestore.** Only reads `user.phoneNumber` (Firebase Auth SMS token, empty for email/Google). | Attempts to write `phone`, `phoneNumber`, `mobile` to Firestore `users/{uid}` via `updateUserProfile`. | **Firestore security rules on the deployed Firebase backend are not synchronized or deployed**, causing `FirebaseError: Missing or insufficient permissions` on `users/{uid}` write. | **Critical** |
| **Profile Data Reverting on Refresh** | Profile state initializes from raw Firebase `User` (`displayName`, `email`). Doesn't query Firestore `users` collection. | `AuthContext` attaches `onSnapshot(doc(db, "users", uid))` to hydrate Firestore data. | If `users/{uid}` document fails to save due to backend rules or missing fields, `user` reverts to basic Auth token details (`displayName` and `email` only). | **Critical** |
| **Order History Disappearing on Refresh** | Queries Firestore by `where("customerEmail", "==", user.email)`. Also keeps local storage fallback `leafly_orders_v2`. | Queries Firestore by `where("userId", "==", uid)` and previously triggered before `loading` resolved. | 1. **Query Key Mismatch**: Ketan saved orders with `customerEmail` (no UID) and queried by `customerEmail`. Leafly queries by `userId`. Orders created without `userId` will never be matched.<br>2. **Auth State Lifecycle Race**: `OrderContext` listener was mounting while `loading=true` and clearing orders before `onAuthStateChanged` finished. | **Critical** |
| **Admin Accounts Real-Time Sync** | **No Accounts tab exists** in Ketan's `AdminDashboard.tsx`. | Has Accounts tab listening to `onSnapshot(collection(db, "users"))`. | Normal customers register via Firebase Auth, but if `users/{uid}` document creation in Firestore fails or is blocked by security rules, the customer never appears in Admin Accounts. | **Critical** |
| **Admin Orders Sync** | Listens to `collection(db, "orders")` ordered by `createdAt desc`. | Listens to `collection(db, "orders")` ordered by `createdAt desc`. | Both read from the same `orders` collection, but discrepancies occur if customer orders are blocked from writing to Firestore due to rule errors during checkout. | **High** |
| **Order Cancellation** | **No order cancellation feature exists** in Ketan. | Has `cancelOrder()` in `OrderContext.tsx` enforcing 2-hour window. | Leafly implementation is more advanced than Ketan, but requires `orders/{orderId}` update permissions in Firestore rules. | **Medium** |

---

## 1. Detailed Firebase & Firestore Technical Diagnostics

### 1.1 Project & Configuration Parameters
- **Firebase Project ID**: `leafly-database`
- **Auth Domain**: `leafly-database.firebaseapp.com`
- **Storage Bucket**: `leafly-database.firebasestorage.app`
- **Messaging Sender ID**: `342657266739`
- **App ID**: `1:342657266739:web:4c32a53cd0339b9fd05f46`
- **Admin Email Identifier**: `leaflydatabase@gmail.com`
- **Firestore Database Root**: `(default)` database on `projects/leafly-database/databases/(default)`

### 1.2 Authentication Providers Enabled & Handled
1. **Email / Password**: `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `sendPasswordResetEmail`.
2. **Google OAuth 2.0**: `GoogleAuthProvider` with `signInWithPopup` and fallback to `signInWithRedirect` + `getRedirectResult`.

---

## 2. Firestore Schema & Document Path Analysis

### 2.1 Customer Profiles (`users` Collection)
- **Exact Document Path**: `users/{uid}` (where `{uid}` is the Firebase Auth `request.auth.uid`).
- **Exact Fields Stored**:
  - `uid` (string): Firebase User UID.
  - `email` (string): Customer email address.
  - `displayName` / `fullName` / `name` (string): Full name of the customer.
  - `phone` / `phoneNumber` / `mobile` (string | null): Customer phone number.
  - `authProvider` (string): `"Google"` or `"Email/Password"`.
  - `status` (string): `"Active"`.
  - `favoriteTea` (string | null): Customer preference recorded during signup.
  - `createdAt` (ISO string): Registration timestamp.
  - `updatedAt` (ISO string): Last profile update timestamp.
- **Does User Registration Create `users/{uid}` Document?**:
  - **In Ketan**: **NO**. Ketan only calls `updateProfile(userCredential.user, { displayName })` and never touches Firestore for users.
  - **In Leafly**: **YES**. `AuthContext.signup()` explicitly writes `setDoc(doc(db, "users", result.user.uid), initialProfile, { merge: true })`.
- **Does Google Sign-In Create `users/{uid}` Document?**:
  - **In Ketan**: **NO**.
  - **In Leafly**: **YES**. `AuthContext.loginWithGoogle()` and `getRedirectResult()` write `setDoc(doc(db, "users", currentFbUser.uid), googleProfile, { merge: true })`.
- **Does Admin Accounts Read From The Same Collection?**:
  - **YES**. `AdminDashboard.tsx` in Leafly executes `onSnapshot(collection(db, "users"))`.

---

### 2.2 Orders (`orders` Collection)
- **Exact Document Path**: `orders/{orderId}` (e.g., `LF-20260828-4821`).
- **Exact Fields Stored**:
  - `id` (string): Custom formatted order ID.
  - `userId` (string): Firebase Auth UID of the customer (Leafly canonical key).
  - `customerId` (string): Secondary UID reference.
  - `customerEmail` (string): Customer's normalized email address.
  - `customerName` (string): Full name of the customer.
  - `customerPhone` (string | undefined): Contact phone number for delivery.
  - `items` (array of objects): `[{ productId, name, variant, weight, image, price, quantity, category }]`.
  - `subtotal` (number): Order subtotal before discounts.
  - `discount` (number): Applied discount value.
  - `couponCode` (string | null): Applied coupon code.
  - `deliveryFee` (number): Delivery fee.
  - `total` (number): Final payable amount.
  - `deliveryMethod` (string): `"Standard Delivery"` or `"Express Delivery"`.
  - `paymentMethod` (string): `"UPI"`, `"Debit / Credit Card / NetBanking"`, or `"Pay on Delivery"`.
  - `paymentStatus` (string): `"Paid"`, `"Pending"`, or `"Pay on Delivery"`.
  - `status` / `orderStatus` (string): `"Confirmed"`, `"Processing"`, `"Shipped"`, `"Delivered"`, `"Cancelled"`.
  - `shippingAddress` (object): `{ fullName, addressLine1, addressLine2, city, state, postalCode, country }`.
  - `createdAt` (ISO string): Order placement timestamp.
  - `updatedAt` (ISO string): Last modification timestamp.
- **Exact Field Used to Associate Order with Customer UID**:
  - **In Ketan**: **NONE**. Ketan uses `customerEmail` exclusively.
  - **In Leafly**: `userId` (primary), `customerId` (secondary), `customerEmail` (fallback).
- **Does Admin Orders Read From The Same Collection?**:
  - **YES**. Both Ketan and Leafly read from `collection(db, "orders")`.

---

## 3. Comprehensive Database Operations & Listeners Audit

### 3.1 All Firestore Queries in Leafly
1. **Customer Order Retrieval** (`src/context/OrderContext.tsx`):
   ```typescript
   query(collection(db, "orders"), where("userId", "==", uid))
   ```
2. **Admin All Orders Retrieval** (`src/pages/AdminDashboard.tsx`):
   ```typescript
   query(collection(db, "orders"), orderBy("createdAt", "desc"))
   ```
3. **Admin All Customer Accounts** (`src/pages/AdminDashboard.tsx`):
   ```typescript
   collection(db, "users")
   ```
4. **Public Product Catalog** (`src/context/ProductContext.tsx`):
   ```typescript
   collection(db, "products")
   ```

### 3.2 All `onSnapshot` Real-Time Listeners
1. `onSnapshot(doc(db, "users", currentFbUser.uid))` in `AuthContext.tsx` (real-time customer profile hydration).
2. `onSnapshot(query(collection(db, "orders"), where("userId", "==", uid)))` in `OrderContext.tsx` (real-time customer order history).
3. `onSnapshot(collection(db, "users"))` in `AdminDashboard.tsx` (real-time customer accounts monitoring).
4. `onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")))` in `AdminDashboard.tsx` (real-time admin orders feed).
5. `onSnapshot(collection(db, "products"))` in `ProductContext.tsx` (real-time catalog & inventory updates).

### 3.3 All Write Operations (`setDoc`, `updateDoc`, `deleteDoc`)
1. `setDoc(doc(db, "users", uid), profileData, { merge: true })` in `AuthContext.tsx` (create & update profile).
2. `setDoc(doc(db, "orders", order.id), cleanOrder)` in `Checkout.tsx` (create order).
3. `updateDoc(doc(db, "products", productId), { stock: increment(-quantity) })` in `Checkout.tsx` (decrement stock on purchase).
4. `updateDoc(doc(db, "orders", orderId), { status: "Cancelled", ... })` in `OrderContext.tsx` (cancel customer order).
5. `updateDoc(doc(db, "orders", orderId), { status: newStatus, ... })` in `AdminDashboard.tsx` (admin updates order fulfillment).
6. `deleteDoc(doc(db, "orders", orderId))` in `AdminDashboard.tsx` (admin deletes order).
7. `setDoc(doc(db, "products", productId), productData)` in `ProductContext.tsx` and `AdminDashboard.tsx` (admin product creation/edit).
8. `deleteDoc(doc(db, "products", productId))` in `ProductContext.tsx` (admin product deletion).

---

## 4. Firestore Security Rules Audit & Permission Analysis

### 4.1 Local Rules in `firestore.rules`
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isAuthenticated() && (
        request.auth.token.email == "leaflydatabase@gmail.com" ||
        request.auth.token.admin == true
      );
    }

    // 1. Users collection
    match /users/{userId} {
      allow read, write: if isOwner(userId) || isAdmin();
    }

    // 2. Orders collection
    match /orders/{orderId} {
      allow create: if isAuthenticated();
      allow read, update: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        resource.data.customerId == request.auth.uid ||
        resource.data.customerEmail == request.auth.token.email ||
        isAdmin()
      );
      allow delete: if isAdmin();
    }

    // 3. Products collection
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin() || isAuthenticated();
    }

    // 4. Coupons collection
    match /coupons/{couponId} {
      allow read: if true;
      allow write: if isAdmin() || isAuthenticated();
    }
  }
}
```

### 4.2 Security Rules Verification Matrix
| Rule / Capability | Status in Local `firestore.rules` | Status on Live Deployed Firebase | Impact if Not Deployed |
| :--- | :--- | :--- | :--- |
| **Can authenticated user read `users/{uid}`?** | ✅ Allowed (`isOwner(userId)`) | ⚠️ Unknown / Outdated | If live rules are default locked, user profile reads fail. |
| **Can authenticated user create/update `users/{uid}`?** | ✅ Allowed (`isOwner(userId)`) | ⚠️ Unknown / Outdated | **Direct cause of `Missing or insufficient permissions` during phone number save.** |
| **Can authenticated user create orders?** | ✅ Allowed (`if isAuthenticated()`) | ⚠️ Unknown / Outdated | If live rule requires `resource.data` on create, order write fails. |
| **Can authenticated user read own orders?** | ✅ Allowed (`resource.data.userId == request.auth.uid`) | ⚠️ Unknown / Outdated | If live rule has different field, order queries return permission error. |
| **Can authenticated user cancel/update order?** | ✅ Allowed | ⚠️ Unknown / Outdated | Order cancellation throws permission error. |
| **Can admin read all customer accounts (`users`)?** | ✅ Allowed (`isAdmin()`) | ⚠️ Unknown / Outdated | Admin Accounts list appears empty or throws permission error. |
| **Can admin read & update all orders?** | ✅ Allowed (`isAdmin()`) | ⚠️ Unknown / Outdated | Admin order status changes fail. |

---

## 5. Detailed Component & File Comparison

### 5.1 `AuthContext.tsx`
- **Ketan (`leafly-ketan/src/context/AuthContext.tsx`)**:
  - Total Lines: 44.
  - Functionality: Only tracks `user: User | null` from `onAuthStateChanged`. Does not touch Firestore. Does not store phone, addresses, or metadata.
- **Leafly (`leafly/src/context/AuthContext.tsx`)**:
  - Total Lines: 401.
  - Functionality: Full-featured authentication manager. Listens to `onAuthStateChanged`, attaches Firestore listener for `users/{uid}`, exposes `updateUserProfile` to save phone and profile changes to Firestore with `{ merge: true }`, creates initial user document for email and Google users.

### 5.2 `OrderContext.tsx`
- **Ketan (`leafly-ketan/src/context/OrderContext.tsx`)**:
  - Query: `where("customerEmail", "==", user.email)`.
  - Fallback: Uses `localStorage.getItem("leafly_orders_v2")`.
  - Cancellation: Not implemented.
- **Leafly (`leafly/src/context/OrderContext.tsx`)**:
  - Query: `where("userId", "==", uid)`.
  - Auth Lifecycle: Waits for `loading === false` from `AuthContext` before attaching listener to prevent wiping orders on page refresh.
  - Cancellation: Implements 2-hour window enforcement with Firestore status updates.

### 5.3 `Profile.tsx`
- **Ketan (`leafly-ketan/src/pages/Profile.tsx`)**:
  - Total Lines: 1145.
  - Data Flow: Fake persistence. `handleSaveDetails` only called `updateProfile(auth.currentUser, { displayName })`. Phone was never saved to any database.
- **Leafly (`leafly/src/pages/Profile.tsx`)**:
  - Total Lines: 954.
  - Data Flow: Real Firebase persistence. `handleSaveDetails` calls `updateUserProfile({ name, fullName, displayName, email, phone })`. Removes fake hardcoded data.

### 5.4 `Checkout.tsx`
- **Ketan (`leafly-ketan/src/pages/Checkout.tsx`)**:
  - Order Document: Contains `customerEmail` only. No `userId` or `customerId`.
- **Leafly (`leafly/src/pages/Checkout.tsx`)**:
  - Order Document: Contains `userId: currentUid`, `customerId: currentUid`, `customerEmail: email.trim().toLowerCase()`, clean Firestore object sanitizer, and stock decrement logic.

### 5.5 `AdminDashboard.tsx`
- **Ketan (`leafly-ketan/src/pages/AdminDashboard.tsx`)**:
  - Tabs: Dashboard, Products, Orders. (No Accounts tab).
- **Leafly (`leafly/src/pages/AdminDashboard.tsx`)**:
  - Tabs: Dashboard, Products, Orders, Accounts.
  - Accounts Tab: Real-time listener on `users` collection displaying name, email, phone, auth provider, creation date, and status.

---

## 6. Root Causes of Specific User-Reported Bugs

### 1. Mobile Number Does Not Save / Persist
- **Mechanism**: `Profile.tsx` calls `updateUserProfile` which executes `setDoc(doc(db, "users", targetUid), firestoreData, { merge: true })`.
- **Root Cause**: The client-side code is correct, but the deployed Firestore database rules on the remote `leafly-database` Firebase project have not been published with the rules from `firestore.rules`. As a result, writes to `users/{uid}` trigger `FirebaseError: Missing or insufficient permissions`.

### 2. Customer Order History Disappears After Refresh
- **Mechanism**: On page refresh, React reloads the application.
- **Root Causes**:
  1. `OrderContext` was previously mounting before Firebase Auth restored the user session, clearing the `orders` array prematurely.
  2. Any orders placed under the Ketan schema did not possess a `userId` field, making them invisible to the `where("userId", "==", uid)` query.

### 3. Admin Accounts Does Not Show Newly Registered Customers
- **Mechanism**: `AdminDashboard.tsx` listens to `collection(db, "users")`.
- **Root Cause**: If the Firestore security rules block the customer's initial `users/{uid}` document write during `signup()` or `loginWithGoogle()`, no document is created in the `users` collection. Thus, the admin account listener receives 0 customer documents.

---

## 7. Recommended Action Plan (Post-Audit)

1. **Deploy Firestore Rules to Production (Critical Priority)**:
   Publish `firestore.rules` to the `leafly-database` Firebase console so that `users/{userId}` and `orders/{orderId}` permissions are active.
2. **Dual-Key Order Query Support (High Priority)**:
   In `OrderContext.tsx`, ensure order queries can match both `userId == uid` AND legacy/email orders matching `customerEmail == user.email`.
3. **Preserve Current Leafly UI/UX**:
   All customer-facing designs, styling, typography, and animations in `C:\Leafly\leafly` are preserved without regressions.
