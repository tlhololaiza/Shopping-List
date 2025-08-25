import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  setShoppingLists,
  addShoppingList,
  deleteShoppingList,
  addItemToShoppingList,
  setLoading,
  setError,
} from '../../redux/shoppingListSlice';
import {
  getShoppingListsByUserId,
  createShoppingList,
  deleteShoppingList as deleteListApi,
  createShoppingListItem,
} from '../../api/jsonServer';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import type { ShoppingListItem } from '../../utils/types';
import './ShoppingLists.css';

const ShoppingLists: React.FC = () => {
  const dispatch = useAppDispatch();
  const { lists, isLoading, error } = useAppSelector((state) => state.shoppingList);
  const user = useAppSelector((state) => state.auth.user);
  const [newListName, setNewListName] = useState('');
  
  // Track form data per list ID
  const [itemForms, setItemForms] = useState<Record<number, Omit<ShoppingListItem, 'id'>>>({});
  
  // Track image loading states and errors
  const [imageStates, setImageStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});

  // Load shopping lists with embedded items on component mount
  useEffect(() => {
    const fetchLists = async () => {
      if (user) {
        dispatch(setLoading(true));
        try {
          const fetchedLists = await getShoppingListsByUserId(user.id);
          dispatch(setShoppingLists(fetchedLists));
        } catch (err) {
          dispatch(setError('Failed to fetch shopping lists.'));
        } finally {
          dispatch(setLoading(false));
        }
      }
    };
    fetchLists();
  }, [user, dispatch]);

  // Initialize form data for a specific list
  const getItemFormData = (listId: number): Omit<ShoppingListItem, 'id'> => {
    return itemForms[listId] || {
      name: '',
      quantity: 1,
      notes: '',
      category: '',
      image: '',
      shoppingListId: listId,
    };
  };

  // Handle image load states
  const handleImageLoad = (imageUrl: string) => {
    setImageStates(prev => ({ ...prev, [imageUrl]: 'loaded' }));
  };

  const handleImageError = (imageUrl: string) => {
    setImageStates(prev => ({ ...prev, [imageUrl]: 'error' }));
  };

  const handleImageLoadStart = (imageUrl: string) => {
    setImageStates(prev => ({ ...prev, [imageUrl]: 'loading' }));
  };

  // Validate image URL format
  const isValidImageUrl = (url: string): boolean => {
    if (!url) return true; // Empty is valid (optional)
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol) && 
             /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
    } catch {
      return false;
    }
  };

  // Handle creating a new list
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim() && user) {
      dispatch(setLoading(true));
      try {
        const newList = await createShoppingList({ userId: user.id, name: newListName });
        dispatch(addShoppingList({ ...newList, items: [] }));
        setNewListName('');
      } catch (err) {
        dispatch(setError('Failed to create new shopping list.'));
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  // Handle deleting a list
  const handleDeleteList = async (listId: number) => {
    if (window.confirm('Are you sure you want to delete this shopping list and all its items?')) {
      dispatch(setLoading(true));
      try {
        await deleteListApi(listId);
        dispatch(deleteShoppingList(listId));
        // Clean up form data for this list
        setItemForms(prev => {
          const updated = { ...prev };
          delete updated[listId];
          return updated;
        });
      } catch (err) {
        dispatch(setError('Failed to delete shopping list.'));
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  // Handle item form changes
  const handleItemFormChange = (e: React.ChangeEvent<HTMLInputElement>, listId: number) => {
    const { name, value } = e.target;
    const parsedValue = name === 'quantity' ? parseInt(value) || 1 : value;
    
    setItemForms(prev => ({
      ...prev,
      [listId]: {
        ...getItemFormData(listId),
        [name]: parsedValue,
      }
    }));
  };

  // Handle adding a new item to a list
  const handleAddItem = async (e: React.FormEvent, listId: number) => {
    e.preventDefault();
    const formData = getItemFormData(listId);
    
    if (formData.name.trim()) {
      // Validate image URL if provided
      if (formData.image && !isValidImageUrl(formData.image)) {
        dispatch(setError('Please enter a valid image URL (must be http/https and end with jpg, png, gif, etc.)'));
        return;
      }

      dispatch(setLoading(true));
      try {
        const newItem = await createShoppingListItem({
          name: formData.name,
          quantity: formData.quantity,
          notes: formData.notes,
          category: formData.category,
          image: formData.image,
          shoppingListId: listId,
        });
        dispatch(addItemToShoppingList({ listId, item: newItem }));
        
        // Reset form for this specific list
        setItemForms(prev => ({
          ...prev,
          [listId]: {
            name: '',
            quantity: 1,
            notes: '',
            category: '',
            image: '',
            shoppingListId: listId,
          }
        }));
      } catch (err) {
        dispatch(setError('Failed to add new item.'));
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  // Component for rendering item images with error handling
  const ItemImage: React.FC<{ item: ShoppingListItem }> = ({ item }) => {
    if (!item.image) {
      return (
        <div className="item-image-placeholder">
          <span>📦</span>
        </div>
      );
    }

    const imageState = imageStates[item.image];

    return (
      <div className="item-image-container">
        {imageState === 'loading' && (
          <div className="image-loading">Loading...</div>
        )}
        {imageState === 'error' ? (
          <div className="image-error" title="Failed to load image">
            <span>🖼️❌</span>
          </div>
        ) : (
          <img
            src={item.image}
            alt={item.name}
            className="item-image"
            onLoad={() => handleImageLoad(item.image!)}
            onError={() => handleImageError(item.image!)}
            onLoadStart={() => handleImageLoadStart(item.image!)}
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '1px solid #ddd',
              display: imageState === 'error' ? 'none' : 'block'
            }}
          />
        )}
      </div>
    );
  };

  // Image URL preview component
  const ImagePreview: React.FC<{ url: string }> = ({ url }) => {
    if (!url || !isValidImageUrl(url)) return null;

    return (
      <div className="image-preview">
        <p><small>Image Preview:</small></p>
        <img
          src={url}
          alt="Preview"
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  };

  return (
    <div className="shopping-lists-container">
      <h2>Your Shopping Lists</h2>

      {isLoading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="list-creation-form">
        <h3>Create New List</h3>
        <form onSubmit={handleCreateList}>
          <Input
            type="text"
            name="newListName"
            placeholder="New Shopping List Name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
          <Button type="submit">Add New List</Button>
        </form>
      </div>

      <div className="lists-display">
        {lists.length > 0 ? (
          lists.map((list) => {
            const formData = getItemFormData(list.id);
            
            return (
              <div key={list.id} className="shopping-list-card">
                <div className="list-header">
                  <h3>{list.name}</h3>
                  <Button 
                    onClick={() => handleDeleteList(list.id)}
                    className="delete-button"
                    style={{ backgroundColor: '#dc3545', color: 'white' }}
                  >
                    Delete List
                  </Button>
                </div>
                
                <hr />
                
                <div className="items-section">
                  <h4>Items ({list.items.length})</h4>
                  {list.items.length > 0 ? (
                    <div className="items-grid">
                      {list.items.map((item) => (
                        <div key={item.id} className="item-card">
                          <div className="item-content">
                            <ItemImage item={item} />
                            <div className="item-details">
                              <h5>{item.name}</h5>
                              <p><strong>Quantity:</strong> {item.quantity}</p>
                              <p><strong>Category:</strong> {item.category}</p>
                              {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No items in this list yet.</p>
                  )}
                </div>
                
                <hr />
                
                <div className="add-item-section">
                  <h4>Add New Item</h4>
                  <form onSubmit={(e) => handleAddItem(e, list.id)} className="item-form">
                    <div className="form-row">
                      <Input
                        type="text"
                        name="name"
                        placeholder="Item Name *"
                        value={formData.name}
                        onChange={(e) => handleItemFormChange(e, list.id)}
                        required
                      />
                      <Input
                        type="number"
                        name="quantity"
                        placeholder="Quantity"
                        value={formData.quantity.toString()}
                        onChange={(e) => handleItemFormChange(e, list.id)}
                        min="1"
                      />
                    </div>
                    <div className="form-row">
                      <Input
                        type="text"
                        name="category"
                        placeholder="Category *"
                        value={formData.category}
                        onChange={(e) => handleItemFormChange(e, list.id)}
                        required
                      />
                      <Input
                        type="text"
                        name="notes"
                        placeholder="Notes (Optional)"
                        value={formData.notes || ''}
                        onChange={(e) => handleItemFormChange(e, list.id)}
                      />
                    </div>
                    <div className="image-input-section">
                      <Input
                        type="url"
                        name="image"
                        placeholder="Image URL (Optional) - e.g., https://example.com/image.jpg"
                        value={formData.image || ''}
                        onChange={(e) => handleItemFormChange(e, list.id)}
                        style={{
                          borderColor: formData.image && !isValidImageUrl(formData.image) ? '#dc3545' : undefined
                        }}
                      />
                      {formData.image && !isValidImageUrl(formData.image) && (
                        <p style={{ color: '#dc3545', fontSize: '0.9em', margin: '5px 0' }}>
                          Please enter a valid image URL (must start with http/https and be a valid image format)
                        </p>
                      )}
                      {formData.image && isValidImageUrl(formData.image) && (
                        <ImagePreview url={formData.image} />
                      )}
                    </div>
                    
                    <div className="form-actions">
                      <Button 
                        type="submit" 
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
          <div className="empty-state">
            <p>You have no shopping lists yet. Create your first one above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingLists;