import React, { useState, useEffect, useCallback } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  const closeToast = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 300); // Wait for fade out animation before removing
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      closeToast();
    }, duration);

    return () => clearTimeout(timer);
  }, [closeToast, duration]);

  return (
    <div className={`toast toast-${type} ${visible ? 'show' : 'hide'}`}>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={closeToast}>×</button>
    </div>
  );
};

export default Toast;