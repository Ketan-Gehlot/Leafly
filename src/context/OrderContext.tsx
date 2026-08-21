/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUser } from "@clerk/clerk-react";
import type { ProductVariantKey } from "../data/products";

export type OrderItem = {
  id: string;
  productId?: number;
  name: string;
  variant?: ProductVariantKey | string;
  weight?: string;
  image: string;
  price: number;
  quantity: number;
  category?: string;
};

export type ShippingAddress = {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type Order = {
  id: string;
  userId?: string;
  createdAt: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  couponCode?: string;
  deliveryFee: number;
  total: number;
  deliveryMethod: string;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
};

type OrderContextType = {
  orders: Order[];
  latestOrder: Order | null;
  addOrder: (order: Order) => Promise<void>;
  clearOrders: () => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);
const STORAGE_KEY = "leafly_orders_v2";

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  
  // Local state for guest users or optimistic updates
  const [localOrders, setLocalOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [firestoreOrders, setFirestoreOrders] = useState<Order[]>([]);

  // Listen to Firestore if logged in
  useEffect(() => {
    if (!user) {
      setFirestoreOrders([]);
      return;
    }

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ ...doc.data() } as Order));
      // Sort by date descending
      ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setFirestoreOrders(ordersData);
    });

    return unsubscribe;
  }, [user]);

  // Sync local orders to localstorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localOrders));
    } catch {
      // Ignore
    }
  }, [localOrders]);

  const activeOrders = user ? firestoreOrders : localOrders;

  const addOrder = async (order: Order) => {
    if (user) {
      // Save to Firestore
      try {
        await addDoc(collection(db, "orders"), {
          ...order,
          userId: user.id
        });
      } catch (err) {
        console.error("Failed to save order to firestore", err);
      }
    } else {
      // Save locally
      setLocalOrders((current) => [...current, order]);
    }
  };

  const clearOrders = () => {
    setLocalOrders([]);
  };

  const latestOrder = useMemo(
    () => (activeOrders.length > 0 ? activeOrders[0] : null), // Changed to activeOrders[0] since we sorted desc
    [activeOrders]
  );

  return (
    <OrderContext.Provider
      value={{
        orders: activeOrders,
        latestOrder,
        addOrder,
        clearOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderContext() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error("useOrderContext must be used inside OrderProvider");
  }

  return context;
}
