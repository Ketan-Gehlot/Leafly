/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type OrderItem = {
  id: string;
  name: string;
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
  createdAt: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: string;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
};

type OrderContextType = {
  orders: Order[];
  latestOrder: Order | null;
  addOrder: (order: Order) => void;
  clearOrders: () => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);
const STORAGE_KEY = "leafly_orders";

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Ignore storage errors.
    }
  }, [orders]);

  const addOrder = (order: Order) => {
    setOrders((current) => [...current, order]);
  };

  const clearOrders = () => {
    setOrders([]);
  };

  const latestOrder = useMemo(
    () => (orders.length > 0 ? orders[orders.length - 1] : null),
    [orders]
  );

  return (
    <OrderContext.Provider
      value={{
        orders,
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
