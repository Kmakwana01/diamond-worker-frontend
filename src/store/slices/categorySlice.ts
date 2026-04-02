import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { categoryApi } from '../../api/categoryApi';
interface CategoryState {
  availableCategories: any[];
  userCategories: string[];
  selectedCategory: string | null;
  hasSelectedCategory: boolean; 
  currentCategoryConfig: any | null;
  categoryStats: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  availableCategories: [],
  userCategories: [],
  selectedCategory: 'DIAMOND',
  hasSelectedCategory: true,
  currentCategoryConfig: null,
  categoryStats: null,
  loading: false,
  error: null,
};

// Fetch all available categories
export const fetchAvailableCategories = createAsyncThunk(
  'category/fetchAvailable',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryApi.getCategories();
      console.log('📦 Categories fetched:', response.data?.data?.length);
      return response.data?.data || [];
    } catch (error: any) {
      console.error('❌ Failed to fetch categories:', error);
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// ✅ SELECT CATEGORY FOR SESSION - THIS IS THE KEY FIX
export const selectCategoryForSession = createAsyncThunk(
  'category/selectForSession',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      console.log('📦 Selecting category for session:', categoryId);
      
      // Fetch category config
      const configResponse = await categoryApi.getCategoryConfig(categoryId);
      const config = configResponse.data?.data;
      
      // Fetch initial stats
      const statsResponse = await categoryApi.getCategoryStats(categoryId);
      const stats = statsResponse.data?.data;
      
      console.log('✅ Category selected for session:', categoryId);
      
      return {
        categoryId,
        config,
        stats,
      };
    } catch (error: any) {
      console.error('❌ Failed to select category:', error);
      return rejectWithValue(error?.message || 'Failed to select category');
    }
  }
);

// Fetch category stats
export const fetchCategoryStats = createAsyncThunk(
  'category/fetchStats',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      console.log('📊 Fetching stats for category:', categoryId);
      const response = await categoryApi.getCategoryStats(categoryId);
      return response.data?.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch category stats:', error);
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    // ✅ CLEAR CATEGORY WHEN LOGGING OUT
    clearCategorySelection: (state) => {
      state.selectedCategory = null;
      state.hasSelectedCategory = false; // ✅ RESET TO FALSE
      state.currentCategoryConfig = null;
      state.categoryStats = null;
      console.log('🗑️ Category selection cleared');
    },
  },
  extraReducers: (builder) => {
    // Fetch available categories
    builder
      .addCase(fetchAvailableCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.availableCategories = action.payload;
        console.log('✅ Categories loaded:', action.payload.length);
      })
      .addCase(fetchAvailableCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ✅ SELECT CATEGORY FOR SESSION - UPDATE STATE PROPERLY
    builder
      .addCase(selectCategoryForSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(selectCategoryForSession.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload.categoryId;
        state.hasSelectedCategory = true; // ✅ SET TO TRUE HERE!
        state.currentCategoryConfig = action.payload.config;
        state.categoryStats = action.payload.stats;
        console.log('✅ Category session started:', action.payload.categoryId);
      })
      .addCase(selectCategoryForSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.hasSelectedCategory = false; // ✅ KEEP FALSE ON ERROR
      });

    // Fetch category stats
    builder
      .addCase(fetchCategoryStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategoryStats.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryStats = action.payload;
      })
      .addCase(fetchCategoryStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCategorySelection } = categorySlice.actions;
export default categorySlice.reducer;
