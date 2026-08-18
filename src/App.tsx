import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import { lazy, Suspense } from "react";

import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import WishlistDrawer from "./components/WishlistDrawer";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ProductProvider } from "./context/ProductContext";

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

function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <WishlistProvider>
          <OrderProvider>
            <BrowserRouter>
              <Navbar />

              <Suspense fallback={null}>
                <Routes>
                  <Route path="/"                element={<Home />} />
                  <Route path="/shop"            element={<Shop />} />
                  <Route path="/product/:id"     element={<ProductDetail />} />
                  <Route path="/gifting"         element={<GiftingPage />} />
                  <Route path="/checkout"        element={<Checkout />} />
                  <Route path="/order-success"   element={<OrderSuccess />} />
                  <Route path="/orders"          element={<Orders />} />
                  <Route path="/tea-maker"       element={<TeaMaker />} />
                  <Route path="/tea-collections" element={<TeaCollections />} />
                  <Route path="/why-leafly"      element={<WhyLeafly />} />
                  <Route path="/journal"         element={<Journal />} />
                  <Route path="/about"           element={<About />} />
                  <Route path="/contact"         element={<Contact />} />
                  <Route path="/profile"         element={<Profile />} />
                  <Route path="/admin"           element={<AdminDashboard />} />
                  <Route path="*"               element={<NotFound />} />
                </Routes>
              </Suspense>

              <CartDrawer />
              <WishlistDrawer />
            </BrowserRouter>
          </OrderProvider>
        </WishlistProvider>
      </CartProvider>
    </ProductProvider>
  );
}

export default App;