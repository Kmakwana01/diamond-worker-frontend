import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentApi } from '../../api/paymentApi';

interface PaymentState {
  payments: any[];
  balance: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  balance: null,
  loading: false,
  error: null,
};

export const fetchPayments = createAsyncThunk(
  'payment/fetchAll',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await paymentApi.getPayments(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

export const fetchBalance = createAsyncThunk(
  'payment/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentApi.getBalance();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch balance');
    }
  }
);

export const createPayment = createAsyncThunk(
  'payment/create',
  async (data: Partial<any>, { rejectWithValue }) => {
    try {
      const response = await paymentApi.createPayment(data);
      return response.data.payment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment');
    }
  }
);

export const deletePayment = createAsyncThunk(
  'payment/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await paymentApi.deletePayment(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete payment');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.payments;
      })
      .addCase(fetchBalance.fulfilled, (state, action) => {
        state.balance = action.payload;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.payments.unshift(action.payload);
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.payments = state.payments.filter(p => p._id !== action.payload);
      });
  },
});

export const { clearError } = paymentSlice.actions;
export default paymentSlice.reducer;
