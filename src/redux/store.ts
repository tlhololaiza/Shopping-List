import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import formReducer from './formSlice'; 
import shoppingListReducer from './shoppingListSlice'; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    forms: formReducer, 
    shoppingList: shoppingListReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;