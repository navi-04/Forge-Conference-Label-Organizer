import React from 'react';
import './Modal.css';

const DeleteLabelModal = ({ onClose, onDelete, selectedLabels }) => {
  const handleDelete = () => {
    onDelete(selectedLabels);
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Delete Labels</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="warning-text">
            Are you sure you want to delete the following {selectedLabels.length} label{selectedLabels.length !== 1 ? 's' : ''}?
            This will remove them from all pages in this space.
          </p>
          
          <div className="selected-labels">
            {selectedLabels.map(label => (
              <span key={label} className="selected-label">{label}</span>
            ))}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button className="danger-button" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteLabelModal;
