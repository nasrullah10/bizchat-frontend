// hooks/useWhatsApp.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

const fetchWithAuth = async (url: string, options: any = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
};

export function useWhatsApp(businessId: string | number | null) {
  const [status, setStatus] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!businessId) return;
    const bizId = String(businessId);

    const saved = localStorage.getItem(`messages_${bizId}`);
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch(e) {}
    }

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      socket.emit('subscribe-business', bizId);
    });

    socket.on('connect_error', (err: any) => {
      console.error('❌ Socket error:', err.message);
    });

    socket.on('whatsapp-qr', (data: any) => {
      if (data.qr) {
        setQrCode(data.qr);
        setStatus({ status: 'qr_pending', message: 'Scan QR code' });
        setLoading(false);
      }
    });

    socket.on('whatsapp-status', (data: any) => {
      setStatus({
        connected: data.status === 'connected',
        status: data.status,
        phone_number: data.phone_number,
        message: data.message
      });
      
      if (data.status === 'connected') {
        setQrCode(null);
        setLoading(false);
      }
      if (data.status === 'disconnected') {
        setQrCode(null);
        setLoading(false);
      }
    });

    socket.on('whatsapp-message', (data: any) => {
      setMessages(prev => {
        if (prev.some(m => m.id === data.id)) return prev;
        const updated = [data, ...prev];
        localStorage.setItem(`messages_${bizId}`, JSON.stringify(updated.slice(0, 100)));
        return updated;
      });
    });

    socket.on('auto-reply-triggered', (data: any) => {
      console.log('🤖 Auto-reply sent:', data);
      setAutoReplyEnabled(true);
    });

    checkStatus();

    return () => {
      socket.disconnect();
    };
  }, [businessId]);

  const checkStatus = useCallback(async () => {
    try {
      const data = await fetchWithAuth(`${API_URL}/whatsapp/status/${businessId}`);
      if (data.success && data.data?.status === 'connected') {
        setStatus({
          connected: true,
          status: 'connected',
          phone_number: data.data.phone_number,
          message: 'WhatsApp is active'
        });
      }
    } catch (err: any) {
      console.error('Status check error:', err.message);
    }
  }, [businessId]);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    setQrCode(null);

    try {
      const data = await fetchWithAuth(`${API_URL}/whatsapp/connect`, {
        method: 'POST',
        body: JSON.stringify({ business_id: businessId })
      });
      
      if (!data.success) {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [businessId]);

  const disconnect = useCallback(async () => {
    setLoading(true);
    try {
      await fetchWithAuth(`${API_URL}/whatsapp/disconnect`, {
        method: 'POST',
        body: JSON.stringify({ business_id: businessId })
      });
      
      setStatus({ status: 'disconnected', message: 'Disconnected' });
      setQrCode(null);
      setMessages([]);
      localStorage.removeItem(`messages_${String(businessId)}`);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const sendMessage = useCallback(async (to: string, message: string) => {
    if (!status?.connected) {
      alert('❌ WhatsApp not connected!');
      throw new Error('Not connected');
    }

    try {
      const data = await fetchWithAuth(`${API_URL}/whatsapp/send`, {
        method: 'POST',
        body: JSON.stringify({
          business_id: businessId,
          to: String(to).replace(/\D/g, ''),
          message
        })
      });

      if (!data.success) {
        throw new Error(data.error || 'Failed to send');
      }

      const msg = {
        id: Date.now().toString(),
        to,
        text: message,
        direction: 'outgoing',
        status: 'sent',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => {
        const updated = [msg, ...prev];
        localStorage.setItem(`messages_${String(businessId)}`, JSON.stringify(updated.slice(0, 100)));
        return updated;
      });
      
      return data;
    } catch (err: any) {
      alert('❌ Send failed: ' + err.message);
      throw err;
    }
  }, [businessId, status]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(`messages_${String(businessId)}`);
  }, [businessId]);

  return {
    status,
    qrCode,
    messages,
    loading,
    error,
    autoReplyEnabled,
    connect,
    disconnect,
    sendMessage,
    clearMessages
  };
}