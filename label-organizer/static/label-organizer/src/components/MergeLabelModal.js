import React, { useState } from 'react';
import './Modal.css';

const MergeLabelModal = ({ onClose, onMerge, selectedLabels, allLabels }) => {
  const [targetType, setTargetType] = useState('existing');
  const [existingTarget, setExistingTarget] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [error, setError] = useState(null);
  
  // Filter out the selected labels from all labels for dropdown
  const availableLabels = allLabels
    .filter(label => !selectedLabels.includes(label.name))
    .map(label => label.name);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const targetLabel = targetType === 'existing' ? existingTarget : newTarget.trim();
    
    if (!targetLabel) {
      setError('Please provide a target label name');
      return;
    }
    
    if (targetType === 'new' && selectedLabels.includes(targetLabel)) {
      setError('New label name cannot be one of the labels being merged');
      return;
    }
    
    onMerge(selectedLabels, targetLabel);
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Merge Labels</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="modal-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Source Labels:</label>
            <div className="selected-labels">
              {selectedLabels.map(label => (
                <span key={label} className="selected-label">{label}</span>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Target Label Type:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="existing"
                  checked={targetType === 'existing'}
                  onChange={() => setTargetType('existing')}
                />
                Use an existing label
              </label>
              <label>
                <input
                  type="radio"
                  value="new"
                  checked={targetType === 'new'}
                  onChange={() => setTargetType('new')}
                />
                Create a new label
              </label>
            </div>
          </div>
          
          {targetType === 'existing' ? (
            <div className="form-group">
              <label htmlFor="existingTarget">Select Target Label:</label>
              <select
                id="existingTarget"
                value={existingTarget}
                onChange={(e) => setExistingTarget(e.target.value)}
                required
              >
                <option value="">-- Select a label --</option>
                {availableLabels.map(label => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="newTarget">New Target Label Name:</label>
              <input
                id="newTarget"
                type="text"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="Enter a new label name"
                required
              />
            </div>
          )}
          
          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Merge Labels
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MergeLabelModal;
