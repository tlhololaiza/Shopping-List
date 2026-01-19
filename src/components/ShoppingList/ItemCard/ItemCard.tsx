import React from 'react';
import Button from '../../Button/Button';
import type { ShoppingListItem } from '../../../utils/types';
import './ItemCard.css';

interface ItemCardProps {
  item: ShoppingListItem;
  listId: number;
  isEditing: boolean;
  editingData?: Partial<ShoppingListItem>;
  onEdit: (item: ShoppingListItem) => void;
  onDelete: (listId: number, itemId: number, itemName: string) => void;
  onSave: (listId: number, itemId: number) => void;
  onCancel: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  const urlPattern = /^https?:\/\/.+/i;
  const imagePattern = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
  return urlPattern.test(url) && imagePattern.test(url);
};

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  listId,
  isEditing,
  editingData,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onChange,
}) => {
  return (
    <div
      className="item-card"
      style={{
        border: isEditing ? '2px solid #6366f1' : '1px solid #e5e7eb',
        padding: '0',
        borderRadius: '10px',
        backgroundColor: isEditing ? '#f0f4ff' : '#ffffff',
        boxShadow: isEditing
          ? '0 4px 12px rgba(99, 102, 241, 0.15)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)',
        overflow: isEditing ? 'visible' : 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      {isEditing && editingData ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            width: '100%',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h5
            style={{
              margin: '0 0 18px 0',
              color: '#1f2937',
              fontSize: '16px',
              fontWeight: '600',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            Edit Item
          </h5>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              marginBottom: '14px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  color: '#374151',
                  marginBottom: '8px',
                  fontWeight: '500',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                value={editingData.name || ''}
                onChange={onChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  fontFamily: 'Poppins, sans-serif',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  color: '#374151',
                  marginBottom: '8px',
                  fontWeight: '500',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={editingData.quantity || 1}
                onChange={onChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  fontFamily: 'Poppins, sans-serif',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                color: '#374151',
                marginBottom: '8px',
                fontWeight: '500',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Category
            </label>
            <input
              type="text"
              name="category"
              value={editingData.category || ''}
              onChange={onChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                fontFamily: 'Poppins, sans-serif',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
            />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                color: '#374151',
                marginBottom: '8px',
                fontWeight: '500',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Notes
            </label>
            <input
              type="text"
              name="notes"
              value={editingData.notes || ''}
              onChange={onChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                fontFamily: 'Poppins, sans-serif',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
            />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                color: '#374151',
                marginBottom: '8px',
                fontWeight: '500',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Image URL
            </label>
            <input
              type="text"
              name="image"
              value={editingData.image || ''}
              onChange={onChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                fontFamily: 'Poppins, sans-serif',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Button
              onClick={() => onSave(listId, item.id)}
              style={{
                padding: '12px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Poppins, sans-serif',
                transition: 'background-color 0.2s',
                width: '100%',
              }}
            >
              Save
            </Button>
            <Button
              onClick={onCancel}
              style={{
                padding: '12px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Poppins, sans-serif',
                transition: 'background-color 0.2s',
                width: '100%',
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px' }}>
          {item.image && isValidImageUrl(item.image) && (
            <div
              style={{
                marginBottom: '16px',
                marginLeft: '-20px',
                marginRight: '-20px',
                marginTop: '-20px',
                display: 'flex',
                justifyContent: 'center',
                overflow: 'hidden',
                borderRadius: '10px 10px 0 0',
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: '100%',
                  maxHeight: '200px',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '14px',
            }}
          >
            <h5
              style={{
                margin: 0,
                color: '#1f2937',
                fontSize: '16px',
                fontWeight: '700',
                flex: 1,
              }}
            >
              {item.name}
            </h5>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 4px 0',
                  fontSize: '11px',
                  color: '#6b7280',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Quantity
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '18px',
                  color: '#1f2937',
                  fontWeight: '700',
                }}
              >
                {item.quantity}
              </p>
            </div>
            <div>
              <p
                style={{
                  margin: '0 0 4px 0',
                  fontSize: '11px',
                  color: '#6b7280',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Category
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '18px',
                  color: '#1f2937',
                  fontWeight: '700',
                }}
              >
                {item.category}
              </p>
            </div>
          </div>
          {item.notes && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#fef3c7',
                borderLeft: '4px solid #fbbf24',
                borderRadius: '6px',
              }}
            >
              <p
                style={{
                  margin: '0 0 4px 0',
                  fontSize: '11px',
                  color: '#92400e',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Notes
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#78350f' }}>{item.notes}</p>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '12px',
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>
              {new Date(item.dateAdded).toLocaleDateString()}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                onClick={() => onEdit(item)}
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
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                }}
              >
                Edit
              </Button>
              <Button
                onClick={() => onDelete(listId, item.id, item.name)}
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
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemCard;
