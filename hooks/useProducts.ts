// hooks/useProducts.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Product {
  id: number;
  user_id: number;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  cost_price: number | null;
  stock_quantity: number;
  unit: string;
  category: string | null;
  images: string[] | null;
  status: 'active' | 'inactive' | 'out_of_stock';
  tags: string[] | null;
  notes: string | null;
  profit_margin?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductStats {
  total: number;
  active: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('token');

  const fetchProducts = useCallback(async (filters?: Record<string, any>) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== 'all') params.append(key, String(value));
        });
      }
      
      const response = await axios.get(`${API_URL}/products?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      setProducts(response.data.data);
      setCategories(response.data.categories || []);
      setStats(response.data.stats || null);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = async (data: Partial<Product>) => {
    try {
      const response = await axios.post(`${API_URL}/products`, data, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setProducts(prev => [response.data.data, ...prev]);
      return { success: true, data: response.data.data };
    } catch (err: any) {
      return { 
        success: false, 
        errors: err.response?.data?.errors || { general: err.message }
      };
    }
  };

  const updateProduct = async (id: number, data: Partial<Product>) => {
    try {
      const response = await axios.put(`${API_URL}/products/${id}`, data, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setProducts(prev => prev.map(p => p.id === id ? response.data.data : p));
      return { success: true, data: response.data.data };
    } catch (err: any) {
      return { 
        success: false, 
        errors: err.response?.data?.errors || { general: err.message }
      };
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setProducts(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const bulkUpdateStock = async (products: { id: number; stock_quantity: number }[]) => {
    try {
      const response = await axios.post(`${API_URL}/products/bulk-update-stock`, { products }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      await fetchProducts(); // Refresh
      return { success: true, message: response.data.message };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    categories,
    stats,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkUpdateStock
  };
}