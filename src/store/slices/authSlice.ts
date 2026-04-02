import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authApi from "../../api/authApi";
import { STORAGE_KEYS } from "../../utils/constants";
import { clearCategorySelection } from "./categorySlice";
import googleAuthService from "../../services/googleAuthService";

interface User {
  id: string;
  email: string;
  name: string;
  photo?: string;
  selectedCategory?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  registrationEmail: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  registrationEmail: null,
};

// Optimized Google Login - Single async flow, no sequential waits
export const googleLogin = createAsyncThunk<
  { user: User; accessToken: string; refreshToken: string },
  void,
  { rejectValue: string }
>("auth/googleLogin", async (_, { rejectWithValue }) => {
  const startTime = Date.now();

  try {
    console.log("🚀 [0ms] Starting Google login");

    // Step 1: Get Google credentials (1-2 seconds)
    const googleData = await googleAuthService.signIn();
    console.log(`✅ [${Date.now() - startTime}ms] Got Google data`);

    // Step 2: Backend authentication (parallel with storage prep)
    const backendPromise = authApi.googleLogin({
      idToken: googleData.idToken,
      user: {
        id: googleData.user.id,
        email: googleData.user.email,
        name: googleData.user.name,
        photo: googleData.user.photo,
      },
    });

    console.log(`📤 [${Date.now() - startTime}ms] Sent to backend`);
    const response = await backendPromise;

    if (!response.data.success) {
      throw new Error(response.data.message || "Login failed");
    }

    const { accessToken, refreshToken, user } = response.data.data;
    console.log(`✅ [${Date.now() - startTime}ms] Backend authenticated`);

    // Step 3: Save to storage (non-blocking for UI)
    AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      [STORAGE_KEYS.USER, JSON.stringify(user)],
    ]).catch((err) => console.error("Storage error:", err));

    console.log(`✅ [${Date.now() - startTime}ms] Login complete`);
    return { user, accessToken, refreshToken };
  } catch (error: any) {
    console.error(`❌ [${Date.now() - startTime}ms] Error:`, error.message);
    return rejectWithValue(error.message || "Google login failed");
  }
});

// Email/Password Login (unchanged)
export const login = createAsyncThunk<
  { user: User; accessToken: string; refreshToken: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await authApi.login({ email, password });
    const { accessToken, refreshToken, user } = response.data.data;

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      [STORAGE_KEYS.USER, JSON.stringify(user)],
    ]);

    return { user, accessToken, refreshToken };
  } catch (error: any) {
    console.log("object :>> ", error.response.data);
    return rejectWithValue(error?.response?.data?.message || "Login failed");
  }
});

// Register (unchanged)
export const register = createAsyncThunk<
  { email: string; message: string },
  { name: string; email: string; password: string; phone?: string },
  { rejectValue: string }
>("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await authApi.register(userData);
    return {
      email: userData.email,
      message: response.data.message,
    };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Registration failed"
    );
  }
});

// Verify OTP (unchanged)
export const verifyOTP = createAsyncThunk<
  { user: User; accessToken: string; refreshToken: string },
  { email: string; otp: string },
  { rejectValue: string }
>("auth/verifyOTP", async ({ email, otp }, { rejectWithValue }) => {
  try {
    const response = await authApi.verifyOTP(email, otp);
    const { accessToken, refreshToken, user } = response.data.data;

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      [STORAGE_KEYS.USER, JSON.stringify(user)],
    ]);

    return { user, accessToken, refreshToken };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "OTP verification failed"
    );
  }
});

// Logout (unchanged)
export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      try {
        await authApi.logout();
        await googleAuthService.signOut();
      } catch (error) {
        console.log("⚠️ Logout error (ignoring):", error);
      }
      await AsyncStorage.clear();
      dispatch(clearCategorySelection());
    } catch (error: any) {
      return rejectWithValue(error?.message || "Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setRegistrationEmail: (state, action: PayloadAction<string>) => {
      state.registrationEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Google Login
    builder
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Google login failed";
        state.isAuthenticated = false;
      });

    // Email Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationEmail = action.payload.email;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.registrationEmail = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "OTP verification failed";
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { clearError, setUser, setAuthenticated, setRegistrationEmail } =
  authSlice.actions;
export default authSlice.reducer;
