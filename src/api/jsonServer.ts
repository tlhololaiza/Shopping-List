import type { User, RegisterData, ShoppingList, ShoppingListItem } from '../utils/types';

const API_BASE_URL = 'http://localhost:5000';

export const registerUser = async (userData: RegisterData): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Registration failed: ${errorText}`);
  }

  return response.json();
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const response = await fetch(`${API_BASE_URL}/users?email=${email}`);

  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }

  const users: User[] = await response.json();
  return users.length > 0 ? users[0] : null;
};

export const updateUser = async (userId: number, updatedData: Partial<User>): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error('Failed to update user data');
  }

  return response.json();
};

// --- Shopping List API Functions (Full CRUD) ---

// Create a new shopping list
export const createShoppingList = async (listData: { userId: number; name: string }): Promise<ShoppingList> => {
  const response = await fetch(`${API_BASE_URL}/shoppingLists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(listData),
  });

  if (!response.ok) {
    throw new Error('Failed to create shopping list');
  }

  return response.json();
};

// Get all shopping lists for a user, embedding items
export const getShoppingListsByUserId = async (userId: number): Promise<ShoppingList[]> => {
  const response = await fetch(`${API_BASE_URL}/shoppingLists?userId=${userId}&_embed=items`);
  if (!response.ok) {
    throw new Error('Failed to fetch shopping lists');
  }
  return response.json();
};

// Delete a shopping list and its items
export const deleteShoppingList = async (listId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/shoppingLists/${listId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete shopping list');
  }
};

// Add a new item to a shopping list
export const createShoppingListItem = async (itemData: Omit<ShoppingListItem, 'id'>): Promise<ShoppingListItem> => {
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  });
  if (!response.ok) {
    throw new Error('Failed to create shopping list item');
  }
  return response.json();
};

// Search for items by name (keyword search)
export const searchShoppingListItems = async (userId: number, keyword: string): Promise<ShoppingListItem[]> => {
  const response = await fetch(`${API_BASE_URL}/items?name_like=${keyword}&shoppingList.userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to search for shopping list items');
  }
  return response.json();
};