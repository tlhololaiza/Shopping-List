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

  // Handle shopping list deletion
  const handleDeleteList = async (listId: number) => {
    try {
      await deleteListApi(listId);
      dispatch(deleteShoppingList(listId));
    } catch (err) {
      console.error('Failed to delete list:', err);
    }
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
          shoppingListId: listId,
          dateAdded: new Date().toISOString(),
        };
        const createdItem = await createShoppingListItem(newItem);
        dispatch(addItemToShoppingList({ listId, item: createdItem }));
        setItemForms((prev) => ({ ...prev, [listId]: { name: '', quantity: 1, category: '', image: '', shoppingListId: listId, dateAdded: '' } }));
      } catch (err) {
        console.error('Failed to add item:', err);
      }
    }
  };

  // Handle item deletion from a shopping list
  const handleDeleteItem = async (listId: number, itemId: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteShoppingListItem(itemId);
        dispatch(deleteItemFromShoppingList({ listId, itemId }));
      } catch (err) {
        console.error('Failed to delete item:', err);
      }
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
  const handleEditListSubmit = (listId: number) => async (e: React.FormEvent) => {
    e.preventDefault();
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
      <h2>My Shopping Lists</h2>
      
      {/* Search Input and Sort Dropdown */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
        <Input
          type="text"
          name="search"
          placeholder="Search for an item..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <select 
          value={sortKey} 
          onChange={(e) => handleSortChange(e.target.value as 'name' | 'category' | 'date')}
          style={{
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            fontSize: '16px',
            backgroundColor: 'white',
            cursor: 'pointer'
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
          <h3>Search Results for "{searchTerm}" ({searchResults.length} items found)</h3>
          {searchResults.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {sortItems(searchResults).map((item) => (
                <div key={`${item.id}-${item.shoppingListId}`} className="item-card" style={{
                  border: '1px solid #ddd',
                  padding: '15px',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#333', flex: 1 }}>{item.name}</h4>
                    <button 
                      onClick={() => handleDeleteItem(item.shoppingListId, item.id)}
                      style={{ 
                        padding: '4px 8px', 
                        fontSize: '12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        marginLeft: '8px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                  <p style={{ margin: '5px 0' }}><strong>Quantity:</strong> {item.quantity}</p>
                  <p style={{ margin: '5px 0' }}><strong>Category:</strong> {item.category}</p>
                  {item.notes && <p style={{ margin: '5px 0' }}><strong>Notes:</strong> {item.notes}</p>}
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                    <strong>Added:</strong> {new Date(item.dateAdded).toLocaleDateString()}
                  </p>
                  {item.image && (
                    <div style={{ marginTop: '10px' }}>
                      <img 
                        src={item.image} 
                        alt={item.name}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>No items found matching your search.</p>
              <button 
                onClick={() => handleSearchChange('')}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* List Creation Form */}
          <div className="list-creation-form" style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '30px' 
          }}>
            <h3>Create a new Shopping List</h3>
            <form onSubmit={handleCreateList} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  type="text"
                  name="newListName"
                  placeholder="Enter new list name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                />
              </div>
              <Button onClick={() => {}} disabled={!newListName.trim()}>Create List</Button>
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
                      <form onSubmit={handleEditListSubmit(list.id)} style={{ flex: 1 }}>
                        <Input
                          type="text"
                          name="editListName"
                          value={editListName}
                          onChange={(e) => setEditListName(e.target.value)}
                          onBlur={handleEditListSubmit(list.id)}
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
                            backgroundColor: '#6c757d',
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
                    <Button onClick={() => handleDeleteList(list.id)}>Delete List</Button>
                  </div>
                  
                  <div className="item-grid" style={{ marginBottom: '25px' }}>
                    <h4 style={{ color: '#555', marginBottom: '15px' }}>
                      Items ({sortedItems.length}) - Sorted by {getSortDisplayText(sortKey)}
                    </h4>
                    {sortedItems.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                        {sortedItems.map((item) => (
                          <div key={item.id} className="item-card" style={{
                            border: editingItemId === item.id ? '2px solid #007bff' : '1px solid #eee',
                            padding: '15px',
                            borderRadius: '6px',
                            backgroundColor: editingItemId === item.id ? '#e7f3ff' : '#fafafa'
                          }}>
                            {editingItemId === item.id && editingItemData ? (
                              // Edit mode
                              <div>
                                <div style={{ marginBottom: '10px' }}>
                                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Name</label>
                                  <input
                                    type="text"
                                    name="name"
                                    value={editingItemData.name || ''}
                                    onChange={handleEditItemChange}
                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                                  />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Quantity</label>
                                  <input
                                    type="number"
                                    name="quantity"
                                    value={editingItemData.quantity || 1}
                                    onChange={handleEditItemChange}
                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                                  />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Category</label>
                                  <input
                                    type="text"
                                    name="category"
                                    value={editingItemData.category || ''}
                                    onChange={handleEditItemChange}
                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                                  />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Notes</label>
                                  <input
                                    type="text"
                                    name="notes"
                                    value={editingItemData.notes || ''}
                                    onChange={handleEditItemChange}
                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                                  />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Image URL</label>
                                  <input
                                    type="text"
                                    name="image"
                                    value={editingItemData.image || ''}
                                    onChange={handleEditItemChange}
                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                                  />
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => handleSaveEditedItem(list.id, item.id)}
                                    style={{
                                      flex: 1,
                                      padding: '8px',
                                      backgroundColor: '#28a745',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '12px'
                                    }}
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={cancelEditingItem}
                                    style={{
                                      flex: 1,
                                      padding: '8px',
                                      backgroundColor: '#6c757d',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '12px'
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // View mode
                              <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                  <h5 style={{ margin: 0, color: '#333', flex: 1 }}>{item.name}</h5>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button 
                                      onClick={() => startEditingItem(item)}
                                      style={{ 
                                        padding: '4px 8px', 
                                        fontSize: '12px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteItem(list.id, item.id)}
                                      style={{ 
                                        padding: '4px 8px', 
                                        fontSize: '12px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                                <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Qty:</strong> {item.quantity}</p>
                                <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Category:</strong> {item.category}</p>
                                {item.notes && <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Notes:</strong> {item.notes}</p>}
                                <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                                  Added: {new Date(item.dateAdded).toLocaleDateString()}
                                </p>
                                {item.image && isValidImageUrl(item.image) && (
                                  <div style={{ marginTop: '8px' }}>
                                    <img 
                                      src={item.image} 
                                      alt={item.name}
                                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontStyle: 'italic', color: '#666' }}>No items in this list yet.</p>
                    )}
                  </div>
                  
                  <div className="add-item-form-container" style={{
                    backgroundColor: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '6px'
                  }}>
                    <h4 style={{ marginTop: 0, color: '#555' }}>Add a new item to this list</h4>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddItem(list.id); }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                        <Input
                          type="text"
                          name="name"
                          placeholder="Item name"
                          value={formData.name}
                          onChange={(e) => handleItemFormChange(e, list.id)}
                        />
                        <Input
                          type="number"
                          name="quantity"
                          placeholder="Quantity"
                          value={String(formData.quantity)}
                          onChange={(e) => handleItemFormChange(e, list.id)}
                        />
                        <Input
                          type="text"
                          name="category"
                          placeholder="Category"
                          value={formData.category}
                          onChange={(e) => handleItemFormChange(e, list.id)}
                        />
                        <Input
                          type="text"
                          name="image"
                          placeholder="Image URL"
                          value={formData.image}
                          onChange={(e) => handleItemFormChange(e, list.id)}
                        />
                      </div>
                      
                      {formData.image && !isValidImageUrl(formData.image) && (
                        <p style={{ color: '#dc3545', fontSize: '14px', margin: '8px 0' }}>
                          Please enter a valid image URL (must start with http/https and end with a valid image extension)
                        </p>
                      )}
                      
                      {formData.image && isValidImageUrl(formData.image) && (
                        <ImagePreview url={formData.image} />
                      )}
                      
                      <div className="form-actions" style={{ marginTop: '15px' }}>
                        <Button
                          onClick={() => {}}
                          disabled={!formData.name.trim() || (formData.image && !isValidImageUrl(formData.image))}
                        >
                          Add Item
                        </Button>
                      </div>
                    </form>
                  </div>
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