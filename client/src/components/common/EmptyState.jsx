import React from 'react';
import './EmptyState.css';

const EmptyState = ({ icon, title, message }) => {
  return (
    <div className="empty-state">
      {icon}
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;