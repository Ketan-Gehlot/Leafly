/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import { products as initialProducts, type Product } from '../data/products';

type ProductContextType = {
  products: Product[];
  loading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  deleteProduct: (id: number | string) => Promise<void>;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('leafly-products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return initialProducts.map((initP) => {
            const savedP = parsed.find((p: Product) => p.id === initP.id);
            if (!savedP) return initP;
            return {
              ...initP,
              ...savedP,
              rating: savedP.rating ?? initP.rating,
              reviewCount: savedP.reviewCount ?? initP.reviewCount,
            };
          });
        }
      } catch {
        // ignore
      }
    }
    return initialProducts;
  });

  const [loading] = useState<boolean>(false);

  const addProduct = async (product: Product) => {
    setProducts((prev) => {
      const next = [...prev, product];
      localStorage.setItem('leafly-products', JSON.stringify(next));
      return next;
    });
  };

  const updateProduct = async (updatedProduct: Product) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      localStorage.setItem('leafly-products', JSON.stringify(next));
      return next;
    });
  };

  const deleteProduct = async (id: number | string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem('leafly-products', JSON.stringify(next));
      return next;
    });
  };

  return (
    <ProductContext.Provider value={{ products, loading, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}

