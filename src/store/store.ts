import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workReducer from './slices/workSlice';
import paymentReducer from './slices/paymentSlice';
import appReducer from './slices/appSlice';
import categoryReducer from './slices/categorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    work: workReducer,
    payment: paymentReducer,
    app: appReducer,
    category: categoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
