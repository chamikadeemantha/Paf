import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClass = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  }[size] || 'spinner-medium';

  return (
    <div className="spinner-container">
      <div className={`spinner ${sizeClass}`}>
        <div className="spinner-inner"></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
