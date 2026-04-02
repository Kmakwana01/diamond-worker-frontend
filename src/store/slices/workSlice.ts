import { WorkEntry } from './../../types/work';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { workApi } from '../../api/workApi';

interface WorkState {
  entries: WorkEntry[];
  stats: any | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
}

const initialState: WorkState = {
  entries: [],
  stats: null,
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
};

export const fetchWorkEntries = createAsyncThunk(
  'work/fetchEntries',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await workApi.getWorkEntries(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch work entries');
    }
  }
);

export const fetchWorkStats = createAsyncThunk(
  'work/fetchStats',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await workApi.getWorkStats(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const createWorkEntry = createAsyncThunk(
  'work/create',
  async (data: Partial<WorkEntry>, { rejectWithValue }) => {
    try {
      const response = await workApi.createWorkEntry(data);
      return response.data.workEntry;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create work entry');
    }
  }
);

export const deleteWorkEntry = createAsyncThunk(
  'work/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await workApi.deleteWorkEntry(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete work entry');
    }
  }
);

const workSlice = createSlice({
  name: 'work',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkEntries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.workEntries;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchWorkStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createWorkEntry.fulfilled, (state, action) => {
        state.entries.unshift(action.payload);
      })
      .addCase(deleteWorkEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter(e => e._id !== action.payload);
      });
  },
});

export const { clearError } = workSlice.actions;
export default workSlice.reducer;
