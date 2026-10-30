// hooks/useTeamMembers.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface TeamMember {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'support' | 'viewer';
  permissions: string[];
  can_send_messages: boolean;
  can_manage_orders: boolean;
  can_manage_customers: boolean;
  can_broadcast: boolean;
  can_view_analytics: boolean;
  status: 'active' | 'inactive';
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamStats {
  total_members: number;
  active_members: number;
  admin_count: number;
  manager_count: number;
  support_count: number;
  viewer_count: number;
}

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('token');

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/team`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setMembers(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/team/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setStats(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const createMember = async (data: {
    name: string;
    email: string;
    phone?: string;
    role: string;
    password: string;
    can_send_messages?: boolean;
    can_manage_orders?: boolean;
    can_manage_customers?: boolean;
    can_broadcast?: boolean;
    can_view_analytics?: boolean;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/team`, data, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setMembers(prev => [response.data.data, ...prev]);
      await fetchStats();
      return { success: true, data: response.data.data };
    } catch (err: any) {
      return {
        success: false,
        errors: err.response?.data?.errors || { general: err.message }
      };
    }
  };

  const updateMember = async (id: number, data: Partial<TeamMember>) => {
    try {
      const response = await axios.put(`${API_URL}/team/${id}`, data, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setMembers(prev => prev.map(m => m.id === id ? response.data.data : m));
      await fetchStats();
      return { success: true, data: response.data.data };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const toggleMemberStatus = async (id: number) => {
    try {
      const response = await axios.patch(`${API_URL}/team/${id}/status`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setMembers(prev => prev.map(m => m.id === id ? response.data.data : m));
      await fetchStats();
      return { success: true, data: response.data.data };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const deleteMember = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/team/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setMembers(prev => prev.filter(m => m.id !== id));
      await fetchStats();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchStats();
  }, [fetchMembers, fetchStats]);

  return {
    members,
    stats,
    loading,
    error,
    fetchMembers,
    fetchStats,
    createMember,
    updateMember,
    toggleMemberStatus,
    deleteMember
  };
}