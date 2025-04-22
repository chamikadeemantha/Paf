import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={onClose}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-dialog-title">{title}</h3>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button 
            className="confirm-dialog-cancel" 
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-dialog-confirm confirm-dialog-${type}`} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
