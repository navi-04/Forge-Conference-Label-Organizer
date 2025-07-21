import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import './Modal.css';

const AddLabelModal = ({ onClose, onAddLabel }) => {
  const [labelName, setLabelName] = useState('');
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPages, setFilteredPages] = useState([]);
  
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const pagesData = await invoke('getPages');
        setPages(pagesData);
        setFilteredPages(pagesData);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch pages');
        console.error(err);
        setIsLoading(false);
      }
    };
    
    fetchPages();
  }, []);
  
  useEffect(() => {
    if (searchTerm) {
      setFilteredPages(pages.filter(page => 
        page.title.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredPages(pages);
    }
  }, [searchTerm, pages]);
  
  const toggleSelectPage = (pageId) => {
    setSelectedPages(prevSelected => {
      if (prevSelected.includes(pageId)) {
        return prevSelected.filter(id => id !== pageId);
      } else {
        return [...prevSelected, pageId];
      }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!labelName.trim()) {
      setError('Label name cannot be empty');
      return;
    }
    
    if (selectedPages.length === 0) {
      setError('Please select at least one page');
      return;
    }
    
    try {
      await invoke('addLabel', { 
        labelName: labelName.trim(), 
        pageIds: selectedPages 
      });
      onAddLabel(labelName, selectedPages);
    } catch (err) {
      setError('Failed to add label');
      console.error(err);
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add Label</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="modal-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="labelName">Label Name:</label>
            <input
              id="labelName"
              type="text"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              placeholder="Enter a label name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Select Pages:</label>
            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="page-search"
            />
            
            <div className="pages-list">
              {isLoading ? (
                <div className="loading">Loading pages...</div>
              ) : filteredPages.length > 0 ? (
                filteredPages.map(page => (
                  <div key={page.id} className="page-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedPages.includes(page.id)}
                        onChange={() => toggleSelectPage(page.id)}
                      />
                      {page.title}
                    </label>
                  </div>
                ))
              ) : (
                <div className="no-pages">No pages found</div>
              )}
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Add Label
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLabelModal;
