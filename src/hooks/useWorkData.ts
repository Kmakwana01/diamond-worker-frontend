// src/hooks/useWorkData.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { WorkEntry, WorkStats, WorkQueryParams } from '../types/work';
import Toast from 'react-native-toast-message';
import { workApi } from '../api/workApi';

interface UseWorkDataReturn {
  workEntries: WorkEntry[];
  stats: WorkStats | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  fetchWorkEntries: (params?: WorkQueryParams) => Promise<void>;
  fetchStats: () => Promise<void>;
  refresh: () => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  setWorkEntries: React.Dispatch<React.SetStateAction<WorkEntry[]>>;
}

export const useWorkData = (): UseWorkDataReturn => {
  const { t } = useTranslation();
  const { selectedCategory } = useSelector((state: RootState) => state.category);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [stats, setStats] = useState<WorkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchWorkEntries = useCallback(
    async (params?: WorkQueryParams) => {
      try {
        // Always include selected category
        const queryParams = {
          limit: 100,
          ...params,
          category: selectedCategory || undefined,
        };
        
        const response = await workApi.getWorkEntries(queryParams);
        if (!mountedRef.current) return;

        const entries: WorkEntry[] = response.data?.data?.workEntries || [];
        setWorkEntries(entries);
        setError(null);
      } catch (err: any) {
        console.error('Fetch work entries error:', err);
        if (!mountedRef.current) return;

        const errorMessage = err?.response?.data?.message || t('work.loadFailed');
        setError(errorMessage);
        Toast.show({
          type: 'error',
          text1: t('work.loadFailed'),
          text2: errorMessage,
        });
      }
    },
    [selectedCategory, t]
  );

  const fetchStats = useCallback(async () => {
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await workApi.getWorkStats(params);
      if (!mountedRef.current) return;
      setStats(response.data?.data || null);
    } catch (err: any) {
      console.error('Fetch work stats error:', err);
      // Stats are optional, don't show error toast
    }
  }, [selectedCategory]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchWorkEntries(), fetchStats()]);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      if (mountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [fetchWorkEntries, fetchStats]);

  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        await workApi.deleteWorkEntry(id);
        if (!mountedRef.current) return;

        setWorkEntries((prev) => prev.filter((entry) => entry._id !== id));
        fetchStats(); // Refresh stats after deletion
        Toast.show({
          type: 'success',
          text1: t('work.deleteSuccess'),
        });
      } catch (err: any) {
        console.error('Delete work entry error:', err);
        const errorMessage = err?.response?.data?.message || t('work.deleteFailed');
        Toast.show({
          type: 'error',
          text1: t('work.deleteFailed'),
          text2: errorMessage,
        });
        throw err;
      }
    },
    [fetchStats, t]
  );

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([fetchWorkEntries(), fetchStats()]);
      } catch (err) {
        console.error('Initial load error:', err);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadInitialData();
  }, [fetchWorkEntries, fetchStats, selectedCategory]); // Re-fetch when category changes

  return {
    workEntries,
    stats,
    loading,
    refreshing,
    error,
    fetchWorkEntries,
    fetchStats,
    refresh,
    deleteEntry,
    setWorkEntries,
  };
};
