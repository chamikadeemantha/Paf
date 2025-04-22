import React, { useState, createContext, useContext } from 'react';
import Toast from './Toast';
import './ToastContainer.css';

// Create context with a default value
const ToastContext = createContext({
  showToast: () => {},
  showSuccess: () => {},
  showError: () => {},
  showInfo: () => {},
  showWarning: () => {}
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const contextValue = {
    showToast,
    showSuccess: (message, duration) => showToast(message, 'success', duration),
    showError: (message, duration) => showToast(message, 'error', duration),
    showInfo: (message, duration) => showToast(message, 'info', duration),
    showWarning: (message, duration) => showToast(message, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};