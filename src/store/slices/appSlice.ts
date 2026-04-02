import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../../utils/constants";
import i18n from "../../utils/i18n";

interface AppState {
  language: string;
  theme: "light" | "dark";
  isFirstLaunch: boolean;
}

const initialState: AppState = {
  language: "en",
  theme: "light",
  isFirstLaunch: true,
};

// Async thunk to load language from AsyncStorage
export const loadLanguage = createAsyncThunk(
  "app/loadLanguage",
  async (_, { rejectWithValue }) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (savedLanguage) {
        await i18n.changeLanguage(savedLanguage);
        return savedLanguage;
      }
      return "en"; // Default language
    } catch (error: any) {
      console.error("Error loading language:", error);
      return rejectWithValue("Failed to load language");
    }
  }
);

// Async thunk to save language to AsyncStorage
export const saveLanguage = createAsyncThunk(
  "app/saveLanguage",
  async (language: string, { rejectWithValue }) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
      await i18n.changeLanguage(language);
      return language;
    } catch (error: any) {
      console.error("Error saving language:", error);
      return rejectWithValue("Failed to save language");
    }
  }
);

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
    setFirstLaunch: (state, action: PayloadAction<boolean>) => {
      state.isFirstLaunch = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLanguage.fulfilled, (state, action) => {
        state.language = action.payload;
      })
      .addCase(saveLanguage.fulfilled, (state, action) => {
        state.language = action.payload;
      });
  },
});

export const { setLanguage, setTheme, setFirstLaunch } = appSlice.actions;
export default appSlice.reducer;
