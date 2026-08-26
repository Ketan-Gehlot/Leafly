/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Order, OrderItem, OrderStatus, ShippingAddress } from "../types/contracts";
import { useAuth } from "./AuthContext";

export type { Order, OrderItem, OrderStatus, ShippingAddress };

type OrderContextType = {
  orders: Order[];
  latestOrder: Order | null;
  addOrder: (order: Order) => void;
  clearOrders: () => void;
  cancelOrder: (orderId: string, couponCode?: string | null) => Promise<void>;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const ORDERS_STORAGE_PREFIX = "leafly_orders_";

export function OrderProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>(() => {
    if (!currentUser?.uid) return [];
    try {
      const saved = localStorage.getItem(`${ORDERS_STORAGE_PREFIX}${currentUser.uid}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (currentUser?.uid) {
      try {
        const saved = localStorage.getItem(`${ORDERS_STORAGE_PREFIX}${currentUser.uid}`);
        setOrders(saved ? JSON.parse(saved) : []);
      } catch {
        setOrders([]);
      }
    } else {
      setOrders([]);
    }
  }, [currentUser?.uid]);

  const addOrder = (order: Order) => {
    setOrders((current) => {
      const exists = current.some((o) => o.id === order.id);
      const nextOrders = exists
        ? current.map((o) => (o.id === order.id ? order : o))
        : [order, ...current];
      
      if (currentUser?.uid) {
        localStorage.setItem(
          `${ORDERS_STORAGE_PREFIX}${currentUser.uid}`,
          JSON.stringify(nextOrders)
        );
      }
      return nextOrders;
    });
  };

  const clearOrders = () => {
    setOrders([]);
    if (currentUser?.uid) {
      localStorage.removeItem(`${ORDERS_STORAGE_PREFIX}${currentUser.uid}`);
    }
  };

  const cancelOrder = async (orderId: string) => {
    setOrders((current) => {
      const nextOrders = current.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: "Cancelled" as OrderStatus,
              status: "Cancelled",
              updatedAt: new Date().toISOString(),
            }
          : o
      );
      if (currentUser?.uid) {
        localStorage.setItem(
          `${ORDERS_STORAGE_PREFIX}${currentUser.uid}`,
          JSON.stringify(nextOrders)
        );
      }
      return nextOrders;
    });
  };

  const latestOrder = useMemo(
    () => (orders.length > 0 ? orders[0] : null),
    [orders]
  );

  return (
    <OrderContext.Provider
      value={{
        orders,
        latestOrder,
        addOrder,
        clearOrders,
        cancelOrder,
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


