import React from 'react';
import Input from '../../Input/Input';
import Button from '../../Button/Button';
import './AddItemForm.css';

interface AddItemFormData {
  name: string;
  quantity: number;
  category: string;
  image: string;
  notes: string;
}

interface AddItemFormProps {
  listId: number;
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (listId: number) => void;
  formData: AddItemFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, listId: number) => void;
}

const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  const urlPattern = /^https?:\/\/.+/i;
  const imagePattern = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
  return urlPattern.test(url) && imagePattern.test(url);
};

const ImagePreview: React.FC<{ url: string }> = ({ url }) => (
  <div style={{ marginTop: '12px', marginBottom: '12px' }}>
    <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontFamily: 'Poppins, sans-serif' }}>
      Image Preview:
    </p>
    <img
      src={url}
      alt="Preview"
      style={{
        maxWidth: '100%',
        maxHeight: '200px',
        borderRadius: '8px',
        objectFit: 'cover',
        border: '1px solid #e5e7eb',
      }}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  </div>
);

const AddItemForm: React.FC<AddItemFormProps> = ({
  listId,
  isVisible,
  onClose,
  onSubmit,
  formData,
  onChange,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="add-item-form-container"
      style={{
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: '10px',
        border: '1px solid #e5e7eb',
        marginTop: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h4
          style={{
            margin: 0,
            color: '#1f2937',
            fontSize: '18px',
            fontWeight: '600',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          Add a new item to this list
        </h4>
        <button
          onClick={onClose}
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
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4b5563')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6b7280')}
        >
          Cancel
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(listId);
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '12px',
          }}
        >
          <Input
            type="text"
            name="name"
            placeholder="Item name *"
            value={formData.name}
            onChange={(e) => onChange(e, listId)}
            required
          />
          <Input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={String(formData.quantity)}
            onChange={(e) => onChange(e, listId)}
            min="1"
          />
          <Input
            type="text"
            name="category"
            placeholder="Category (e.g., Food, Drinks)"
            value={formData.category}
            onChange={(e) => onChange(e, listId)}
          />
          <Input
            type="text"
            name="image"
            placeholder="Image URL (optional)"
            value={formData.image}
            onChange={(e) => onChange(e, listId)}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <Input
            type="text"
            name="notes"
            placeholder="Notes (optional)"
            value={formData.notes || ''}
            onChange={(e) => onChange(e, listId)}
          />
        </div>

        {formData.image && !isValidImageUrl(formData.image) && (
          <p
            style={{
              color: '#dc3545',
              fontSize: '14px',
              margin: '8px 0',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            Please enter a valid image URL (must start with http/https and end with a valid
            image extension)
          </p>
        )}

        {formData.image && isValidImageUrl(formData.image) && <ImagePreview url={formData.image} />}

        <div className="form-actions" style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <Button
            type="submit"
            disabled={!formData.name.trim() || !!(formData.image && !isValidImageUrl(formData.image))}
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
              transition: 'background-color 0.2s',
            }}
          >
            Add Item
          </Button>
          <Button
            type="button"
            onClick={onClose}
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
              transition: 'background-color 0.2s',
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddItemForm;
