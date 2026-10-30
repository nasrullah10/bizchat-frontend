// hooks/useCustomers.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string;
  tags: string[];
  notes: string | null;
  total_orders: number;
  total_spent: number;
  last_active_at: string | null;
  first_contact_at: string | null;
  status: 'active' | 'inactive' | 'blocked';
  source: string;
  wa_id: string | null;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
  initials?: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('token');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/customers`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setCustomers(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomer = async (data: Partial<Customer>) => {
    try {
      const response = await axios.post(`${API_URL}/customers`, data, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setCustomers(prev => [response.data.data, ...prev]);
      return { success: true, data: response.data.data };
    } catch (err: any) {
      return { 
        success: false, 
        errors: err.response?.data?.errors || { general: err.message }
      };
    }
  };

  const updateCustomer = async (id: number, data: Partial<Customer>) => {
    try {
      const response = await axios.put(`${API_URL}/customers/${id}`, data, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setCustomers(prev => prev.map(c => c.id === id ? response.data.data : c));
      return { success: true, data: response.data.data };
    } catch (err: any) {
      return { 
        success: false, 
        errors: err.response?.data?.errors || { general: err.message }
      };
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/customers/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setCustomers(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
}