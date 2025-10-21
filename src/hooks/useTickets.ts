import { useState, useEffect } from 'react';
import { ticketsApi } from '@/lib/api';
import type { Ticket } from '@/types';

interface UseTicketsOptions {
  status?: string;
  priority?: string;
  autoFetch?: boolean;
}

export function useTickets(options: UseTicketsOptions = {}) {
  const { status, priority, autoFetch = true } = options;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (status) params.status = status;
      if (priority) params.priority = priority;

      const response = await ticketsApi.getAll(params);
      setTickets(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to fetch tickets');
      console.error('Fetch tickets error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchTickets();
    }
  }, [status, priority, autoFetch]);

  return {
    tickets,
    loading,
    error,
    refetch: fetchTickets,
  };
}
