// hooks/useTemplates.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Template {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  content: string;
  triggers: string[];
  match_type: string;
  message_type: string;
  buttons: any[] | null;
  conditions: any;
  priority: number;
  is_active: boolean;
  include_products: boolean;
  product_category: string | null;
  product_limit: number;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProcessMessageResponse {
  success: boolean;
  reply: string | null;
  template_id: number | null;
  template_name: string | null;
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('token');

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/whatsapp/templates`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setTemplates(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = async (data: Partial<Template>) => {
    try {
      const response = await axios.post(`${API_URL}/whatsapp/templates`, data, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setTemplates(prev => [response.data.data, ...prev]);
      return { success: true, data: response.data.data };
    } catch (err: any) {
      return { 
        success: false, 
        errors: err.response?.data?.errors || { general: err.message }
      };
    }
  };

  const updateTemplate = async (id: number, data: Partial<Template>) => {
    try {
      const response = await axios.put(`${API_URL}/whatsapp/templates/${id}`, data, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setTemplates(prev => prev.map(t => t.id === id ? response.data.data : t));
      return { success: true, data: response.data.data };
    } catch (err: any) {
      return { 
        success: false, 
        errors: err.response?.data?.errors || { general: err.message }
      };
    }
  };

  const deleteTemplate = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/whatsapp/templates/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setTemplates(prev => prev.filter(t => t.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const toggleTemplate = async (id: number) => {
    try {
      const response = await axios.post(`${API_URL}/whatsapp/templates/toggle/${id}`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setTemplates(prev => prev.map(t => t.id === id ? response.data.data : t));
      return { success: true, data: response.data.data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // ✅ FIXED: Single < instead of <<
  const processMessage = async (message: string, customerId?: number, phone?: string): Promise<ProcessMessageResponse> => {
    try {
      const response = await axios.post(`${API_URL}/whatsapp/templates/process`, {
        message,
        customer_id: customerId,
        phone
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return response.data;
    } catch (err: any) {
      return { 
        success: false, 
        reply: null, 
        template_id: null, 
        template_name: null 
      };
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplate,
    processMessage
  };
}