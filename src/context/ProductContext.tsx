/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { products as initialProducts, type Product } from "../data/products";
import { db } from "../lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, writeBatch } from "firebase/firestore";

type ProductContextType = {
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  deleteProduct: (id: number | string) => Promise<void>;
  loading: boolean;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = collection(db, "products");

    // Initialize data if empty (runs in background)
    const initializeData = async () => {
      try {
        const snapshot = await getDocs(productsRef);
        if (snapshot.empty) {
          console.log("Initializing Firestore products...");
          const batch = writeBatch(db);
          initialProducts.forEach((product) => {
            const docRef = doc(productsRef, product.id.toString());
            batch.set(docRef, product);
          });
          await batch.commit();
          console.log("Firestore products initialized successfully.");
        }
      } catch (error) {
        console.error("Error initializing products:", error);
      }
    };

    // Set up real-time listener immediately
    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        if (snapshot.empty) {
          setProducts(initialProducts);
          setLoading(false);
          initializeData();
          return;
        }

        const fetchedProducts: Product[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Product;
          fetchedProducts.push({ ...data, id: Number(doc.id) || data.id });
        });

        // Sort by ID to maintain consistent order
        fetchedProducts.sort((a, b) => Number(a.id) - Number(b.id));
        setProducts(fetchedProducts);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching products from Firestore:", error);
        // Fallback to local data on error
        setProducts(initialProducts);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addProduct = async (product: Product) => {
    try {
      const newId = product.id || Date.now();
      const newProduct = { ...product, id: newId };
      await setDoc(doc(db, "products", newProduct.id.toString()), newProduct);
      setProducts((prev) => [...prev.filter((p) => p.id !== newProduct.id), newProduct]);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      await setDoc(doc(db, "products", updatedProduct.id.toString()), updatedProduct, { merge: true });
      setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const deleteProduct = async (id: number | string) => {
    try {
      await deleteDoc(doc(db, "products", id.toString()));
      setProducts((prev) => prev.filter((p) => p.id !== id && String(p.id) !== String(id)));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, loading }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
