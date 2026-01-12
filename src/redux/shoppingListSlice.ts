import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ShoppingList, ShoppingListItem } from '../utils/types';

interface ShoppingListState {
  lists: ShoppingList[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ShoppingListState = {
  lists: [],
  isLoading: false,
  error: null,
};

const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState,
  reducers: {
    // Action to set all shopping lists
    setShoppingLists: (state, action: PayloadAction<ShoppingList[]>) => {
      state.lists = action.payload;
      state.isLoading = false;
    },
    // Action to add a new shopping list
    addShoppingList: (state, action: PayloadAction<ShoppingList>) => {
      state.lists.push(action.payload);
    },
    // Action to delete a shopping list
    deleteShoppingList: (state, action: PayloadAction<number>) => {
      state.lists = state.lists.filter((list) => list.id !== action.payload);
    },
    // Action to add an item to a specific shopping list
    addItemToShoppingList: (state, action: PayloadAction<{ listId: number; item: ShoppingListItem }>) => {
      const { listId, item } = action.payload;
      const list = state.lists.find((l) => l.id === listId);
      if (list) {
        list.items.push(item);
      }
    },
    // NEW: Action to update the name of a shopping list
    updateShoppingListName: (state, action: PayloadAction<{ listId: number; newName: string }>) => {
      const { listId, newName } = action.payload;
      const listToUpdate = state.lists.find((list) => list.id === listId);
      if (listToUpdate) {
        listToUpdate.name = newName;
      }
    },
    // Action to delete an item from a shopping list
    deleteItemFromShoppingList: (state, action: PayloadAction<{ listId: number; itemId: number }>) => {
      const { listId, itemId } = action.payload;
      const list = state.lists.find((l) => l.id === listId);
      if (list) {
        list.items = list.items.filter((item) => item.id !== itemId);
      }
    },
    // Action to update an item in a shopping list
    updateItemInShoppingList: (state, action: PayloadAction<{ listId: number; itemId: number; updatedItem: Partial<ShoppingListItem> }>) => {
      const { listId, itemId, updatedItem } = action.payload;
      const list = state.lists.find((l) => l.id === listId);
      if (list) {
        const item = list.items.find((i) => i.id === itemId);
        if (item) {
          Object.assign(item, updatedItem);
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setShoppingLists,
  addShoppingList,
  deleteShoppingList,
  addItemToShoppingList,
  updateShoppingListName,
  deleteItemFromShoppingList,
  updateItemInShoppingList,
  setLoading,
  setError,
} = shoppingListSlice.actions;

export default shoppingListSlice.reducer;