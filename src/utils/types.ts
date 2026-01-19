// src/utils/types.ts

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  password?: string;
}

export interface RegisterData {
  name: string;
  surname: string;
  email: string;
  password: string;
}

export interface ShoppingListItem {
  id: number;
  name: string;
  quantity: number;
  notes?: string;
  category: string;
  image?: string;
  shoppingListId: number;
  dateAdded: string;
}

export interface ShoppingList {
  id: number;
  userId: number;
  name: string;
  items: ShoppingListItem[];
}