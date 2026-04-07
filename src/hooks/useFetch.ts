import { useState, useEffect } from 'react';
import apiClient from '@/config/axios';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T>(url: string, options?: any): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiClient({
          url,
          method: options?.method || 'GET',
          data: options?.body,
          headers: options?.headers
        });
        
        setData(response.data);
      } catch (err: any) {
        setError(err.message || 'An error occurred fetching data.');
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchData();
    }
  }, [url, refetchTrigger, options]);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  return { data, loading, error, refetch };
}
