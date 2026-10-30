// hooks/useOrders.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface OrderItem {
  id?: number;
  name: string;
  quantity: number;
  price: number;
  total?: number;
}

export interface Order {
  id: number;
  user_id: number;
  customer_id: number;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  delivery_charges: number;
  discount: number;
  tax: number;
  total: number;
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded' | 'failed';
  payment_method: 'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'card';
  transaction_id?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: number;
    name: string;
    phone: string;
    address?: string;
  };
  items?: OrderItem[];
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  today_orders: number;
  total_revenue: number;
  delivered_orders: number;
  cancelled_orders: number;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('token');

  const fetchOrders = useCallback(async (params?: { search?: string; status?: string }) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        params
      });
      setOrders(response.data.data.data || response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setStats(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const createOrder = async (data: {
    customer_id: number;
    items: OrderItem[];
    delivery_charges?: number;
    discount?: number;
    tax?: number;
    payment_method: string;
    payment_status: string;
    status: string;
    delivery_address?: string;
    delivery_city?: string;
    delivery_phone?: string;
    notes?: string;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/orders`, data, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setOrders(prev => [response.data.data, ...prev]);
      await fetchStats();
      return { success: true, data: response.data.data };
    } catch (err: any) {
      return {
        success: false,
        errors: err.response?.data?.errors || { general: err.message }
      };
    }
  };

  const updateOrder = async (id: number, data: Partial<Order>) => {
    try {
      const response = await axios.put(`${API_URL}/orders/${id}`, data, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setOrders(prev => prev.map(o => o.id === id ? response.data.data : o));
      await fetchStats();
      return { success: true, data: response.data.data };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const deleteOrder = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setOrders(prev => prev.filter(o => o.id !== id));
      await fetchStats();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]);

  return {
    orders,
    stats,
    loading,
    error,
    fetchOrders,
    fetchStats,
    createOrder,
    updateOrder,
    deleteOrder
  };
}