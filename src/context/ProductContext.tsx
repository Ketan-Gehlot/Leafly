import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, doc, setDoc, deleteDoc, onSnapshot, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import { products as initialProducts, type Product } from "../data/products";

type ProductContextType = {
  products: Product[];
  loading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for products
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      if (querySnapshot.empty) {
        // Seed initial data if empty
        try {
          console.log("Seeding initial products to Firestore...");
          const seedPromises = initialProducts.map((p) =>
            setDoc(doc(db, "products", p.id.toString()), p)
          );
          await Promise.all(seedPromises);
          // The snapshot will trigger again after seeding
        } catch (error) {
          console.error("Error seeding products:", error);
        }
      } else {
        const fetchedProducts = querySnapshot.docs.map((doc) => {
          return { id: Number(doc.id), ...doc.data() } as Product;
        });
        // Sort by ID to keep consistent order
        fetchedProducts.sort((a, b) => a.id - b.id);
        setProducts(fetchedProducts);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const addProduct = async (product: Product) => {
    try {
      // Use the provided product ID as the document ID
      await setDoc(doc(db, "products", product.id.toString()), product);
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      await setDoc(doc(db, "products", updatedProduct.id.toString()), updatedProduct, { merge: true });
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await deleteDoc(doc(db, "products", id.toString()));
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider value={{ products, loading, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
