import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../../Button/Button';
import './DeleteConfirmationModal.css';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span className="modal-icon" aria-hidden="true"><AlertTriangle size={22} /></span>
          <h3>{title}</h3>
        </div>
        <p className="modal-message">{message}</p>
        <p className="modal-item-name">{itemName}</p>
        <div className="modal-actions">
          <Button onClick={onClose} style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#e5e7eb',
            color: '#111827',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px',
          }}>
            Cancel
          </Button>
          <Button onClick={onConfirm} style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px',
          }}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
