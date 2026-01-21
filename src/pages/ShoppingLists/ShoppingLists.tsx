import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { Search as SearchIcon, CalendarRange } from 'lucide-react';
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
import DeleteConfirmationModal from '../../components/ShoppingList/DeleteConfirmationModal/DeleteConfirmationModal';
import ItemCard from '../../components/ShoppingList/ItemCard/ItemCard';
import AddItemForm from '../../components/ShoppingList/AddItemForm/AddItemForm';
import SearchBar from '../../components/ShoppingList/SearchBar/SearchBar';
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
      } catch {
        dispatch(setError('Failed to fetch shopping lists. Please try again.'));
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchLists();
  }, [user, dispatch]);

  // Perform search when search term changes
  useEffect(() => {
    const performSearch = async () => {
      if (!user?.id) return;
      
      if (searchTerm.trim()) {
        try {
          const results = await searchShoppingListItems(user.id, searchTerm);
          setSearchResults(results);
        } catch {
          setSearchResults([]);
        }
      } else {
        setSearchResults(null);
      }
    };
    
    performSearch();
  }, [searchTerm, user]);

  // Handle shopping list creation
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim() && user?.id) {
      const newListData = { userId: user.id, name: newListName.trim(), items: [] };
      try {
        const createdList = await createShoppingList(newListData);
        dispatch(addShoppingList(createdList));
        setNewListName('');
      } catch {
        // Failed to create list
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
      } catch {
        // Failed to add item
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
    } catch {
      // Failed to delete
    } finally {
      setConfirmDelete(null);
    }
  };

  // Handle item update from a shopping list
  const handleUpdateItem = async (listId: number, itemId: number, updatedData: Partial<ShoppingListItem>) => {
    try {
      const updated = await updateShoppingListItem(itemId, updatedData);
      dispatch(updateItemInShoppingList({ listId, itemId, updatedItem: updated }));
    } catch {
      // Failed to update item
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
      } catch {
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
      } catch {
        // Failed to update list name
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
      <DeleteConfirmationModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={performDelete}
        title="Confirm delete"
        message={
          confirmDelete?.type === 'list'
            ? 'This will remove the list and all its items.'
            : 'This will remove the item from this list.'
        }
        itemName={confirmDelete?.name || ''}
      />

      <h2>My Shopping Lists</h2>
      
      <SearchBar
        searchTerm={searchTerm}
        sortKey={sortKey}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
      />
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
                      <p style={{ margin: '0', fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CalendarRange size={14} aria-hidden="true" />
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
              <div style={{ fontSize: '48px', marginBottom: '16px', display: 'flex', justifyContent: 'center', color: '#6b7280' }}>
                <SearchIcon size={48} aria-hidden="true" />
              </div>
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
                          <ItemCard
                            key={item.id}
                            item={item}
                            listId={list.id}
                            isEditing={editingItemId === item.id}
                            editingData={editingItemId === item.id ? editingItemData : undefined}
                            onEdit={startEditingItem}
                            onDelete={handleDeleteItem}
                            onSave={handleSaveEditedItem}
                            onCancel={cancelEditingItem}
                            onChange={handleEditItemChange}
                          />
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontStyle: 'italic', color: '#666' }}>No items in this list yet.</p>
                    )}
                  </div>
                  
                  <AddItemForm
                    listId={list.id}
                    isVisible={addItemFormVisibleListId === list.id}
                    onClose={() => setAddItemFormVisibleListId(null)}
                    onSubmit={handleAddItem}
                    formData={formData}
                    onChange={handleItemFormChange}
                  />
                  
                  {addItemFormVisibleListId !== list.id && (
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