// hooks/useBroadcasts.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface BroadcastCampaign {
  id: number;
  user_id: number;
  name: string;
  content: string;
  message_type: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  replied_count: number;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed' | 'cancelled';
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BroadcastFilters {
  tags?: string[];
  min_orders?: number;
  max_orders?: number;
  date_from?: string;
  date_to?: string;
}

export function useBroadcasts() {
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('token');

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/broadcasts`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setCampaigns(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCampaign = async (data: {
    name: string;
    content: string;
    message_type?: string;
    filters?: BroadcastFilters;
    scheduled_at?: string;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/broadcasts`, data, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setCampaigns(prev => [response.data.data, ...prev]);
      return { success: true, data: response.data.data };
    } catch (err: any) {
      return {
        success: false,
        errors: err.response?.data?.errors || { general: err.message }
      };
    }
  };

  const sendCampaign = async (id: number) => {
    try {
      const response = await axios.post(`${API_URL}/broadcasts/${id}/send`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      await fetchCampaigns();
      return { success: true, message: response.data.message };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const cancelCampaign = async (id: number) => {
    try {
      const response = await axios.post(`${API_URL}/broadcasts/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      await fetchCampaigns();
      return { success: true, message: response.data.message };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const deleteCampaign = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/broadcasts/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setCampaigns(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Auto-refresh every 10 seconds for live status updates
  useEffect(() => {
    fetchCampaigns();

    const interval = setInterval(() => {
      fetchCampaigns();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchCampaigns]);

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    createCampaign,
    sendCampaign,
    cancelCampaign,
    deleteCampaign
  };
}