import { useState, useEffect } from 'react';
import { knowledgeApi } from '@/lib/api';
import type { KnowledgeItem } from '@/types';

interface UseKnowledgeParams {
  category?: string;
  isActive?: boolean;
}

export function useKnowledge(params: UseKnowledgeParams = {}) {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: { category?: string; isActive?: boolean } = {};
      if (params.category) filters.category = params.category;
      if (params.isActive !== undefined) filters.isActive = params.isActive;

      const data = await knowledgeApi.getAll(filters);
      setItems(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch knowledge items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [params.category, params.isActive]);

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
  };
}
