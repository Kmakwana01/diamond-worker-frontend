import { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { paymentApi } from '../api/paymentApi';
import Toast from 'react-native-toast-message';
import { getCurrentMonthDateRange } from '@/utils/helpers';

interface BalanceData {
  totalEarnings: number;
  totalPaid: number;
  pendingBalance: number;
  remainingBalance?: number;
}

interface Transaction {
  _id: string; 
  id?: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  paymentDate: string;
  paidBy?: string;
  note?: string;
  createdAt: string;
  status?: string;
  category?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
}

export interface PaymentStats {
  balance: BalanceData | null;
  transactions: Transaction[];
}

export const usePaymentData = () => {
  const { selectedCategory } = useSelector((state: RootState) => state.category);
  const [stats, setStats] = useState<PaymentStats>({ balance: null, transactions: [] });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      console.log("💰 Fetching payment data for category:", selectedCategory);

      if (!selectedCategory) {
        setStats({ balance: null, transactions: [] });
        return;
      }

      setLoading(true);

      // Get current month date range
      const { startDate, endDate } = getCurrentMonthDateRange();

      const params = {
        category: selectedCategory,
        startDate,
        endDate,
        page: 1,
        limit: 50,
      };

      // Fetch balance and transactions in parallel
      const [balanceResponse, transactionsResponse] = await Promise.all([
        paymentApi.getBalance(params),
        paymentApi.getPayments(params),
      ]);

      if (!mountedRef.current) return;

      // Process balance
      let balanceData: BalanceData | null = null;
      if (balanceResponse.data?.summary) {
        const summary = balanceResponse.data.summary;
        balanceData = {
          totalEarnings: summary.totalEarnings || 0,
          totalPaid: summary.totalPaid || 0,
          pendingBalance: summary.remainingBalance || 0,
          remainingBalance: summary.remainingBalance || 0,
        };
      } else if (balanceResponse.data?.data) {
        balanceData = balanceResponse.data.data;
      }

      console.log('💰 Balance data:', balanceData);

      // Process transactions
      let transactions: Transaction[] = [];
      if (transactionsResponse.data?.data?.payments) {
        transactions = transactionsResponse.data.data.payments;
      } else if (transactionsResponse.data?.payments) {
        transactions = transactionsResponse.data.payments;
      }

      console.log('💰 Transactions count:', transactions.length);

      setStats({ balance: balanceData, transactions });
    } catch (err: any) {
      console.log('❌ Payment fetch failed:', err);
      Toast.show({
        type: 'error',
        text1: 'Failed to load payment data',
        text2: err?.response?.data?.message || 'Please try again',
      });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      fetchAll();
    } else {
      setLoading(false);
    }
  }, [fetchAll, selectedCategory]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
  }, [fetchAll]);

  return { stats, loading, refreshing, refresh };
};