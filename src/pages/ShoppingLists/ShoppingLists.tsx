import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  setShoppingLists,
  addShoppingList,
  deleteShoppingList,
  addItemToShoppingList,
  updateShoppingListName,
  deleteItemFromShoppingList,
  updateItemInShoppingList,
  setLoading,
  setError,
} from '../../redux/shoppingListSlice';
import {
  getShoppingListsByUserId,
  createShoppingList,
  deleteShoppingList as deleteListApi,
  createShoppingListItem,
  updateShoppingList as updateListApi,
  updateShoppingListItem,
  deleteShoppingListItem,
  searchShoppingListItems,
} from '../../api/jsonServer';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import type { ShoppingListItem, ShoppingList } from '../../utils/types';
import './ShoppingLists.css';

type DeleteTarget =
  | { type: 'list'; listId: number; name: string }
  | { type: 'item'; listId: number; itemId: number; name: string };

// Component to render a preview of a selected image
const ImagePreview = ({ url }: { url: string }) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    const img = new Image();
    img.src = url;
    img.onload = () => setImageState('loaded');
    img.onerror = () => setImageState('error');
  }, [url]);

  return (
    <div className="image-preview">
      {imageState === 'loading' && <p>Loading image...</p>}
      {imageState === 'error' && <p style={{ color: '#dc3545' }}>Failed to load image.</p>}
      {imageState === 'loaded' && (
        <img
          src={url}
          alt="Preview"
          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
        />
      )}
    </div>
  );
};

const ShoppingLists: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { lists, isLoading, error } = useAppSelector((state) => state.shoppingList);
  const user = useAppSelector((state) => state.auth.user);
  const [newListName, setNewListName] = useState('');
  
  // Track form data per list ID
  const [itemForms, setItemForms] = useState<Record<number, Omit<ShoppingListItem, 'id'>>>({});
  
  // Track image loading states and errors
  const [imageStates, setImageStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});

  // State for sorting and searching - initialized from URL
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'category' | 'date'>('date');
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [editListName, setEditListName] = useState('');
  const [searchResults, setSearchResults] = useState<ShoppingListItem[] | null>(null);
  
  // State for editing items
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingItemData, setEditingItemData] = useState<Partial<ShoppingListItem> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DeleteTarget | null>(null);
  
  // State for add item form visibility per list
  const [addItemFormVisibleListId, setAddItemFormVisibleListId] = useState<number | null>(null);

  // Parse URL parameters on component mount and location change
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search') || '';
    const sortParam = urlParams.get('sort') as 'name' | 'category' | 'date' || 'date';
    
    setSearchTerm(searchParam);
    setSortKey(sortParam);
  }, [location.search]);

  // Update URL when search term or sort key changes
  const updateURL = (search: string, sort: string) => {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set('search', search.trim());
    }
    if (sort !== 'date') { // Only add sort param if it's not the default
      params.set('sort', sort);
    }
    
    const newSearch = params.toString();
    const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
    navigate(newPath, { replace: true });
  };

  // Handle search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateURL(value, sortKey);
  };

  // Handle sort key changes
  const handleSortChange = (sort: 'name' | 'category' | 'date') => {
    setSortKey(sort);
    updateURL(searchTerm, sort);
  };

  // Load shopping lists with embedded items on component mount
  useEffect(() => {
    const fetchLists = async () => {
      if (!user?.id) return;
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        const fetchedLists = await getShoppingListsByUserId(user.id);
        dispatch(setShoppingLists(fetchedLists));
      } catch (err) {
        dispatch(setError('Failed to fetch shopping lists. Please try again.'));
        console.error('Fetch failed:', err);
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchLists();
  }, [user, dispatch]);

  // Handle shopping list creation
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim() && user?.id) {
      const newListData = { userId: user.id, name: newListName.trim(), items: [] };
      try {
        const createdList = await createShoppingList(newListData);
        dispatch(addShoppingList(createdList));
        setNewListName('');
      } catch (err) {
        console.error('Failed to create list:', err);
      }
    }
  };

  // Handle shopping list deletion (deferred until confirmed)
  const handleDeleteList = (listId: number, name: string) => {
    setConfirmDelete({ type: 'list', listId, name });
  };

  // Handle item creation for a specific list
  const handleAddItem = async (listId: number) => {
    const formData = itemForms[listId];
    if (formData?.name.trim()) {
      try {
        const newItem: Omit<ShoppingListItem, 'id'> = {
          name: formData.name.trim(),
          quantity: formData.quantity,
          category: formData.category,
          image: formData.image,
          notes: formData.notes,
          shoppingListId: listId,
          dateAdded: new Date().toISOString(),
        };
        const createdItem = await createShoppingListItem(newItem);
        dispatch(addItemToShoppingList({ listId, item: createdItem }));
        setItemForms((prev) => ({ ...prev, [listId]: { name: '', quantity: 1, category: '', image: '', notes: '', shoppingListId: listId, dateAdded: '' } }));
      } catch (err) {
        console.error('Failed to add item:', err);
      }
    }
  };

  // Handle item deletion from a shopping list (deferred until confirmed)
  const handleDeleteItem = (listId: number, itemId: number, name: string) => {
    setConfirmDelete({ type: 'item', listId, itemId, name });
  };

  const performDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'list') {
        await deleteListApi(confirmDelete.listId);
        dispatch(deleteShoppingList(confirmDelete.listId));
      } else {
        await deleteShoppingListItem(confirmDelete.itemId);
        dispatch(deleteItemFromShoppingList({ listId: confirmDelete.listId, itemId: confirmDelete.itemId }));
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setConfirmDelete(null);
    }
  };

  // Handle item update from a shopping list
  const handleUpdateItem = async (listId: number, itemId: number, updatedData: Partial<ShoppingListItem>) => {
    try {
      const updated = await updateShoppingListItem(itemId, updatedData);
      dispatch(updateItemInShoppingList({ listId, itemId, updatedItem: updated }));
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  // Start editing an item
  const startEditingItem = (item: ShoppingListItem) => {
    setEditingItemId(item.id);
    setEditingItemData({ ...item });
  };

  // Handle editing item changes
  const handleEditItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingItemData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value,
    }));
  };

  // Save edited item
  const handleSaveEditedItem = async (listId: number, itemId: number) => {
    if (editingItemData) {
      await handleUpdateItem(listId, itemId, editingItemData);
      setEditingItemId(null);
      setEditingItemData(null);
    }
  };

  // Cancel editing
  const cancelEditingItem = () => {
    setEditingItemId(null);
    setEditingItemData(null);
  };

  // Handle input changes for item forms
  const handleItemFormChange = (e: React.ChangeEvent<HTMLInputElement>, listId: number) => {
    const { name, value } = e.target;
    setItemForms((prev) => ({
      ...prev,
      [listId]: {
        ...prev[listId],
        [name]: name === 'quantity' ? Number(value) : value,
        shoppingListId: listId,
        dateAdded: prev[listId]?.dateAdded || '',
      },
    }));
  };

  // Implement search functionality with debouncing
  useEffect(() => {
    const handleSearch = async () => {
      if (!user?.id) return;
      if (searchTerm.trim() === '') {
        setSearchResults(null);
        return;
      }
      try {
        const results = await searchShoppingListItems(user.id, searchTerm);
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      }
    };
    const timerId = setTimeout(() => {
      handleSearch();
    }, 500); // Debounce search
    return () => clearTimeout(timerId);
  }, [searchTerm, user]);

  // Handle editing a list name
  const handleEditListSubmit = async (listId: number) => {
    if (editListName.trim() && editingListId === listId) {
      try {
        await updateListApi(listId, editListName.trim());
        dispatch(updateShoppingListName({ listId, newName: editListName.trim() }));
        setEditingListId(null);
      } catch (err) {
        console.error('Failed to update list name:', err);
      }
    }
  };
  
  // Sorting function
  const sortItems = (items: ShoppingListItem[]) => {
    const sortedItems = [...items];
    switch (sortKey) {
      case 'name':
        sortedItems.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'category':
        sortedItems.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'date':
        sortedItems.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
      default:
        break;
    }
    return sortedItems;
  };

  // Get display text for sort options
  const getSortDisplayText = (key: string) => {
    switch (key) {
      case 'name':
        return 'Name (A-Z)';
      case 'category':
        return 'Category (A-Z)';
      case 'date':
        return 'Date Added (Newest First)';
      default:
        return 'Date Added (Newest First)';
    }
  };

  return (
    <div className="shopping-lists-container">
      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              padding: '24px',
            }}
          >
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>⚠️</span>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#111827', fontWeight: 700 }}>Confirm delete</h3>
            </div>
            <p style={{ margin: '0 0 6px 0', color: '#4b5563', fontSize: '14px' }}>
              {confirmDelete.type === 'list'
                ? 'This will remove the list and all its items.'
                : 'This will remove the item from this list.'}
            </p>
            <p style={{ margin: '0 0 16px 0', color: '#111827', fontSize: '15px', fontWeight: 600 }}>
              {confirmDelete.name}
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <Button
                onClick={() => setConfirmDelete(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#e5e7eb',
                  color: '#111827',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={performDelete}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <h2>My Shopping Lists</h2>
      
      {/* Search Input and Sort Dropdown */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ flex: 1 }}>
          <Input
            type="text"
            name="search"
            placeholder="Search for an item..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <select 
          value={sortKey} 
          onChange={(e) => handleSortChange(e.target.value as 'name' | 'category' | 'date')}
          style={{
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '15px',
            backgroundColor: 'white',
            color: '#1f2937',
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            minWidth: '180px'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#10b981';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
          }}
        >
          <option value="date">{getSortDisplayText('date')}</option>
          <option value="name">{getSortDisplayText('name')}</option>
          <option value="category">{getSortDisplayText('category')}</option>
        </select>
      </div>

      {/* URL Info Display (for debugging - remove in production) */}
      {(searchTerm || sortKey !== 'date') && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px', 
          marginBottom: '20px', 
          borderRadius: '5px',
          fontSize: '14px',
          color: '#6c757d'
        }}>
          Current URL parameters: 
          {searchTerm && ` search="${searchTerm}"`}
          {sortKey !== 'date' && ` sort="${sortKey}"`}
        </div>
      )}

      {/* Main Content Area: Search Results or All Lists */}
      {searchResults !== null ? (
        <div className="search-results">
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
              Search Results
            </h3>
            <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
              Found {searchResults.length} item{searchResults.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </p>
          </div>
          {searchResults.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {sortItems(searchResults).map((item) => {
                const list = lists.find((l) => l.id === item.shoppingListId);
                return (
                  <div
                    key={`${item.id}-${item.shoppingListId}`}
                    className="search-result-card"
                    style={{
                      border: '1px solid #e5e7eb',
                      padding: '16px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    {/* List Badge */}
                    {list && (
                      <div style={{ marginBottom: '12px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#e0e7ff',
                            color: '#4f46e5',
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '500',
                          }}
                        >
                          📋 {list.name}
                        </span>
                      </div>
                    )}

                    {/* Item Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h4
                        style={{
                          margin: '0',
                          color: '#111827',
                          fontSize: '15px',
                          fontWeight: '600',
                          flex: 1,
                          paddingRight: '8px',
                        }}
                      >
                        {item.name}
                      </h4>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <Button
                          onClick={() => handleDeleteItem(item.shoppingListId, item.id, item.name)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Item Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '6px' }}>
                        <p style={{ margin: '0', fontSize: '11px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>QUANTITY</p>
                        <p style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{item.quantity}</p>
                      </div>
                      <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '6px' }}>
                        <p style={{ margin: '0', fontSize: '11px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>CATEGORY</p>
                        <p style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{item.category || '—'}</p>
                      </div>
                    </div>

                    {/* Notes */}
                    {item.notes && (
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>NOTES</p>
                        <p
                          style={{
                            margin: '0',
                            fontSize: '13px',
                            color: '#374151',
                            fontStyle: 'italic',
                            backgroundColor: '#fef3c7',
                            padding: '8px',
                            borderRadius: '4px',
                          }}
                        >
                          {item.notes}
                        </p>
                      </div>
                    )}

                    {/* Date and Image */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        gap: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid #e5e7eb',
                      }}
                    >
                      <p style={{ margin: '0', fontSize: '12px', color: '#9ca3af' }}>
                        📅{' '}
                        {new Date(item.dateAdded).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      {item.image && (
                        <div>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 20px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
                No items found
              </h3>
              <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>
                Try adjusting your search term
              </p>
              <Button
                onClick={() => handleSearchChange('')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* List Creation Form */}
          <div className="list-creation-form" style={{ 
            backgroundColor: '#ffffff', 
            padding: '24px', 
            borderRadius: '10px', 
            marginBottom: '30px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>Create a new Shopping List</h3>
            <form onSubmit={handleCreateList} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  type="text"
                  name="newListName"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Enter new list name"
                />
              </div>
              <Button 
                type="submit"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                }}
              >
                Create List
              </Button>
            </form>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading lists...</p>
            </div>
          ) : error ? (
            <div className="error-message" style={{ 
              color: '#dc3545', 
              backgroundColor: '#f8d7da', 
              padding: '15px', 
              borderRadius: '5px', 
              marginBottom: '20px' 
            }}>
              {error}
            </div>
          ) : lists.length > 0 ? (
            lists.map((list) => {
              const sortedItems = sortItems(list.items);
              const formData = itemForms[list.id] || { 
                name: '', 
                quantity: 1, 
                category: '', 
                image: '',
                notes: '',
                shoppingListId: list.id, 
                dateAdded: '' 
              };
              const isValidImageUrl = (url: string) => 
                url && /^(http|https):\/\/.*\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
              
              return (
                <div key={list.id} className="shopping-list-card" style={{
                  border: '1px solid #ddd',
                  padding: '25px',
                  marginBottom: '30px',
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    {editingListId === list.id ? (
                      <form onSubmit={(e) => { e.preventDefault(); handleEditListSubmit(list.id); }} style={{ flex: 1 }}>
                        <Input
                          type="text"
                          name="editListName"
                          placeholder="List name"
                          value={editListName}
                          onChange={(e) => setEditListName(e.target.value)}
                          onBlur={() => handleEditListSubmit(list.id)}
                          autoFocus
                        />
                      </form>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <h3 style={{ margin: 0, color: '#333' }}>{list.name}</h3>
                        <button 
                          onClick={() => { setEditingListId(list.id); setEditListName(list.name); }} 
                          style={{ 
                            padding: '4px 8px', 
                            fontSize: '12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                    <Button 
                      onClick={() => handleDeleteList(list.id, list.name)}
                      style={{ backgroundColor: '#ef4444', color: 'white', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)' }}
                    >
                      Delete List
                    </Button>
                  </div>
                  
                  <div className="item-grid" style={{ marginBottom: '25px' }}>
                    <h4 style={{ color: '#555', marginBottom: '15px' }}>
                      Items ({sortedItems.length}) - Sorted by {getSortDisplayText(sortKey)}
                    </h4>
                    {sortedItems.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                        {sortedItems.map((item) => (
                          <div key={item.id} className="item-card" style={{
                            border: editingItemId === item.id ? '2px solid #6366f1' : '1px solid #e5e7eb',
                            padding: '0',
                            borderRadius: '10px',
                            backgroundColor: editingItemId === item.id ? '#f0f4ff' : '#ffffff',
                            boxShadow: editingItemId === item.id ? '0 4px 12px rgba(99, 102, 241, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease'
                          }}>
                            {editingItemId === item.id && editingItemData ? (
                              // Edit mode
                              <div style={{ backgroundColor: '#f0f4ff', padding: '16px', borderRadius: '8px', border: '2px solid #6366f1', width: '100%' }}>
                                <h5 style={{ margin: '0 0 14px 0', color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>Edit Item</h5>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#374151', marginBottom: '6px', fontWeight: '500' }}>Name</label>
                                    <input
                                      type="text"
                                      name="name"
                                      value={editingItemData.name || ''}
                                      onChange={handleEditItemChange}
                                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#374151', marginBottom: '6px', fontWeight: '500' }}>Quantity</label>
                                    <input
                                      type="number"
                                      name="quantity"
                                      value={editingItemData.quantity || 1}
                                      onChange={handleEditItemChange}
                                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                    />
                                  </div>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                  <label style={{ display: 'block', fontSize: '12px', color: '#374151', marginBottom: '6px', fontWeight: '500' }}>Category</label>
                                  <input
                                    type="text"
                                    name="category"
                                    value={editingItemData.category || ''}
                                    onChange={handleEditItemChange}
                                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                  />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                  <label style={{ display: 'block', fontSize: '12px', color: '#374151', marginBottom: '6px', fontWeight: '500' }}>Notes</label>
                                  <input
                                    type="text"
                                    name="notes"
                                    value={editingItemData.notes || ''}
                                    onChange={handleEditItemChange}
                                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                  />
                                </div>
                                <div style={{ marginBottom: '14px' }}>
                                  <label style={{ display: 'block', fontSize: '12px', color: '#374151', marginBottom: '6px', fontWeight: '500' }}>Image URL</label>
                                  <input
                                    type="text"
                                    name="image"
                                    value={editingItemData.image || ''}
                                    onChange={handleEditItemChange}
                                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                  />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                  <Button
                                    onClick={() => handleSaveEditedItem(list.id, item.id)}
                                    style={{
                                      padding: '10px 16px',
                                      backgroundColor: '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      transition: 'background-color 0.2s',
                                      width: '100%'
                                    }}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    onClick={cancelEditingItem}
                                    style={{
                                      padding: '10px 16px',
                                      backgroundColor: '#9ca3af',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      transition: 'background-color 0.2s',
                                      width: '100%'
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // View mode
                              <div style={{ padding: '20px' }}>
                                {item.image && isValidImageUrl(item.image) && (
                                  <div style={{ marginBottom: '16px', marginLeft: '-20px', marginRight: '-20px', marginTop: '-20px', display: 'flex', justifyContent: 'center', overflow: 'hidden', borderRadius: '10px 10px 0 0' }}>
                                    <img 
                                      src={item.image} 
                                      alt={item.name}
                                      style={{ 
                                        width: '100%', 
                                        maxHeight: '200px', 
                                        objectFit: 'cover'
                                      }}
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                  <h5 style={{ margin: 0, color: '#1f2937', fontSize: '16px', fontWeight: '700', flex: 1 }}>{item.name}</h5>
                                </div>
                                <div style={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: '1fr 1fr', 
                                  gap: '12px', 
                                  marginBottom: '16px',
                                  padding: '12px',
                                  backgroundColor: '#f3f4f6',
                                  borderRadius: '8px'
                                }}>
                                  <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quantity</p>
                                    <p style={{ margin: 0, fontSize: '18px', color: '#1f2937', fontWeight: '700' }}>{item.quantity}</p>
                                  </div>
                                  <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</p>
                                    <p style={{ margin: 0, fontSize: '18px', color: '#1f2937', fontWeight: '700' }}>{item.category}</p>
                                  </div>
                                </div>
                                {item.notes && (
                                  <div style={{ 
                                    marginBottom: '16px', 
                                    padding: '12px', 
                                    backgroundColor: '#fef3c7', 
                                    borderLeft: '4px solid #fbbf24',
                                    borderRadius: '6px'
                                  }}>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#92400e', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notes</p>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#78350f' }}>{item.notes}</p>
                                  </div>
                                )}
                                <div style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  paddingTop: '12px',
                                  borderTop: '1px solid #e5e7eb'
                                }}>
                                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>
                                    {new Date(item.dateAdded).toLocaleDateString()}
                                  </p>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button 
                                      onClick={() => startEditingItem(item)}
                                      style={{
                                        padding: '6px 14px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                                      }}
                                    >
                                      Edit
                                    </Button>
                                    <Button 
                                      onClick={() => handleDeleteItem(list.id, item.id, item.name)}
                                      style={{
                                        padding: '6px 14px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
                                      }}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontStyle: 'italic', color: '#666' }}>No items in this list yet.</p>
                    )}
                  </div>
                  
                  {addItemFormVisibleListId === list.id ? (
                    <div className="add-item-form-container" style={{
                      backgroundColor: '#ffffff',
                      padding: '24px',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      marginTop: '20px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ margin: 0, color: '#1f2937', fontSize: '18px', fontWeight: '600', fontFamily: 'Poppins, sans-serif' }}>Add a new item to this list</h4>
                        <button
                          onClick={() => setAddItemFormVisibleListId(null)}
                          style={{
                            padding: '6px 14px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            fontFamily: 'Poppins, sans-serif',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
                        >
                          Cancel
                        </button>
                      </div>
                      <form onSubmit={(e) => { e.preventDefault(); handleAddItem(list.id); }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                          <Input
                            type="text"
                            name="name"
                            placeholder="Item name *"
                            value={formData.name}
                            onChange={(e) => handleItemFormChange(e, list.id)}
                            required
                          />
                          <Input
                            type="number"
                            name="quantity"
                            placeholder="Quantity"
                            value={String(formData.quantity)}
                            onChange={(e) => handleItemFormChange(e, list.id)}
                            min="1"
                          />
                          <Input
                            type="text"
                            name="category"
                            placeholder="Category (e.g., Food, Drinks)"
                            value={formData.category}
                            onChange={(e) => handleItemFormChange(e, list.id)}
                          />
                          <Input
                            type="text"
                            name="image"
                            placeholder="Image URL (optional)"
                            value={formData.image}
                            onChange={(e) => handleItemFormChange(e, list.id)}
                          />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <Input
                            type="text"
                            name="notes"
                            placeholder="Notes (optional)"
                            value={formData.notes || ''}
                            onChange={(e) => handleItemFormChange(e, list.id)}
                          />
                        </div>
                        
                        {formData.image && !isValidImageUrl(formData.image) && (
                          <p style={{ color: '#dc3545', fontSize: '14px', margin: '8px 0', fontFamily: 'Poppins, sans-serif' }}>
                            Please enter a valid image URL (must start with http/https and end with a valid image extension)
                          </p>
                        )}
                        
                        {formData.image && isValidImageUrl(formData.image) && (
                          <ImagePreview url={formData.image} />
                        )}
                        
                        <div className="form-actions" style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                          <Button
                            type="submit"
                            disabled={!formData.name.trim() || (formData.image && !isValidImageUrl(formData.image))}
                            style={{
                              padding: '12px 24px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '15px',
                              fontWeight: '600',
                              fontFamily: 'Poppins, sans-serif',
                              flex: 1,
                              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                              transition: 'background-color 0.2s'
                            }}
                          >
                            Add Item
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setAddItemFormVisibleListId(null)}
                            style={{
                              padding: '12px 24px',
                              backgroundColor: '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '15px',
                              fontWeight: '600',
                              fontFamily: 'Poppins, sans-serif',
                              flex: 1,
                              transition: 'background-color 0.2s'
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setAddItemFormVisibleListId(list.id)}
                      style={{
                        marginTop: '20px',
                        padding: '12px 24px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: '600',
                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      + Add Item
                    </Button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty-state" style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '10px',
              color: '#666'
            }}>
              <h3 style={{ color: '#333', marginBottom: '15px' }}>No Shopping Lists Yet</h3>
              <p>Create your first shopping list above to get started organizing your items!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShoppingLists;