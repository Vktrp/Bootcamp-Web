import { configureStore } from '@reduxjs/toolkit';
import cart from '@/features/cart/slice';
import auth from '@/features/auth/slice';
import React from 'react';
export const store = configureStore({ reducer: { cart, auth } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;