// src/utils/types.ts

// Defines the data structure for a user in the database
export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  cellNumber: string;
  password?: string; // Optional because it might not always be fetched
}

// Defines the data structure for user registration
export interface RegisterData {
  name: string;
  surname: string;
  email: string;
  password: string;
  cellNumber: string;
}

// Defines the data structure for an individual item in a shopping list
export interface ShoppingListItem {
  id: number;
  name: string;
  quantity: number;
  notes?: string;
  category: string;
  image?: string; // URL to the image
  shoppingListId: number; // Foreign key to the parent list
}

// Defines the data structure for a shopping list
export interface ShoppingList {
  id: number;
  userId: number;
  name: string;
  items: ShoppingListItem[];
}