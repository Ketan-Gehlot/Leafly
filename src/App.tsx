import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import WishlistDrawer from "./components/WishlistDrawer";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ProductProvider } from "./context/ProductContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SyncClerkToFirebase from "./components/SyncClerkToFirebase";
import { ErrorBoundary } from "./components/ErrorBoundary";

/* Route-level code splitting — each page is a separate JS chunk.
   Only the Home bundle ships on initial page load. */
const About          = lazy(() => import("./pages/About"));
const Checkout       = lazy(() => import("./pages/Checkout"));
const Contact        = lazy(() => import("./pages/Contact"));
const GiftingPage    = lazy(() => import("./pages/GiftingPage"));
const Home           = lazy(() => import("./pages/Home"));
const Journal        = lazy(() => import("./pages/Journal"));
const NotFound       = lazy(() => import("./pages/NotFound"));
const OrderSuccess   = lazy(() => import("./pages/OrderSuccess"));
const Orders         = lazy(() => import("./pages/Orders"));
const ProductDetail  = lazy(() => import("./pages/ProductDetail"));
const Profile        = lazy(() => import("./pages/Profile"));
const Shop           = lazy(() => import("./pages/Shop"));
const TeaCollections = lazy(() => import("./pages/TeaCollections"));
const TeaMaker       = lazy(() => import("./pages/TeaMaker"));
const WhyLeafly      = lazy(() => import("./pages/WhyLeafly"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Login          = lazy(() => import("./pages/Login"));
const CustomerLogin  = lazy(() => import("./pages/CustomerLogin"));
const CustomerSignup = lazy(() => import("./pages/CustomerSignup"));

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  // If no key is present, we still wrap with ClerkProvider using a dummy key to prevent crashes,
  // but Clerk components (SignIn/SignUp) will not work until a real key is provided.
  const clerkKey = PUBLISHABLE_KEY || "pk_test_cGxhY2Vob2xkZXIuY2xlcmsuYWNjb3VudHMk";

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <SyncClerkToFirebase />
      <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <WishlistProvider>
            <OrderProvider>
            <BrowserRouter>
              <Navbar />

              <ErrorBoundary>
                <Suspense fallback={null}>
                  <Routes>
                  <Route path="/"                element={<Home />} />
                  <Route path="/shop"            element={<Shop />} />
                  <Route path="/product/:id"     element={<ProductDetail />} />
                  <Route path="/gifting"         element={<GiftingPage />} />
                  <Route path="/checkout"        element={<Checkout />} />
                  <Route path="/order-success"   element={<OrderSuccess />} />
                  <Route path="/orders"          element={
                    <>
                      <SignedIn>
                        <Orders />
                      </SignedIn>
                      <SignedOut>
                        <RedirectToSignIn />
                      </SignedOut>
                    </>
                  } />
                  <Route path="/tea-maker"       element={<TeaMaker />} />
                  <Route path="/tea-collections" element={<TeaCollections />} />
                  <Route path="/why-leafly"      element={<WhyLeafly />} />
                  <Route path="/journal"         element={<Journal />} />
                  <Route path="/about"           element={<About />} />
                  <Route path="/contact"         element={<Contact />} />
                  <Route path="/customer-login/*"  element={<CustomerLogin />} />
                  <Route path="/customer-signup/*" element={<CustomerSignup />} />
                  <Route path="/profile"         element={
                    <>
                      <SignedIn>
                        <Profile />
                      </SignedIn>
                      <SignedOut>
                        <RedirectToSignIn />
                      </SignedOut>
                    </>
                  } />
                  <Route path="/login"           element={<Login />} />
                  <Route path="/admin"           element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="*"               element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>

              <CartDrawer />
              <WishlistDrawer />
            </BrowserRouter>
            </OrderProvider>
          </WishlistProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
    </ClerkProvider>
  );
}

export default App;