import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import LabelTable from './components/LabelTable';
import AddLabelModal from './components/AddLabelModal';
import DeleteLabelModal from './components/DeleteLabelModal';
import MergeLabelModal from './components/MergeLabelModal';
import SearchBar from './components/SearchBar';
import ExportButton from './components/ExportButton';
import './App.css';

function App() {
  const [labels, setLabels] = useState([]);
  const [filteredLabels, setFilteredLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState([]);
  
  useEffect(() => {
    fetchLabels();
  }, [retryCount]);
  
  useEffect(() => {
    if (searchTerm) {
      setFilteredLabels(labels.filter(label => 
        label.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredLabels(labels);
    }
  }, [searchTerm, labels]);
  
  const fetchLabels = async () => {
    setIsLoading(true);
    setLoadingStatus('Fetching labels...');
    setError(null);
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 15000); // 15 second timeout
    });
    
    try {
      // Race between the actual fetch and the timeout
      const data = await Promise.race([
        invoke('getLabels'),
        timeoutPromise
      ]);
      
      if (data && Array.isArray(data)) {
        setLabels(data);
        setFilteredLabels(data);
        setIsLoading(false);
        setLoadingStatus('');
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      console.error('Error fetching labels:', err);
      setError(err.message || 'Failed to fetch labels. Please try again.');
      setIsLoading(false);
      setLoadingStatus('');
    }
  };
  
  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  };
  
  const handleAddLabel = (newLabel, selectedPages) => {
    setIsAddModalOpen(false);
    // After successfully adding, refresh the labels
    fetchLabels();
  };
  
  const handleDeleteLabels = async (labelsToDelete) => {
    setIsDeleteModalOpen(false);
    try {
      await invoke('deleteLabels', { labels: labelsToDelete });
      // Refresh labels after deletion
      fetchLabels();
    } catch (err) {
      setError('Failed to delete labels');
      console.error(err);
    }
  };
  
  const handleMergeLabels = async (sourceLabelNames, targetLabelName) => {
    setIsMergeModalOpen(false);
    try {
      await invoke('mergeLabels', { 
        sourceLabels: sourceLabelNames, 
        targetLabel: targetLabelName 
      });
      // Refresh labels after merging
      fetchLabels();
    } catch (err) {
      setError('Failed to merge labels');
      console.error(err);
    }
  };
  
  const handleSearch = (term) => {
    setSearchTerm(term);
  };
  
  const handleLabelSelection = (labelNames) => {
    setSelectedLabels(labelNames);
  };

  return (
    <div className="app-container">
      <h1>Label Organizer</h1>
      
      {error && (
        <div className="error-message">
          {error}
          <button className="retry-button" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}
      
      <div className="action-bar">
        <SearchBar onSearch={handleSearch} />
        <div className="action-buttons">
          <button 
            className="primary-button" 
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Label
          </button>
          <button 
            className="secondary-button" 
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={selectedLabels.length === 0}
          >
            Delete Selected
          </button>
          <button 
            className="secondary-button" 
            onClick={() => setIsMergeModalOpen(true)}
            disabled={selectedLabels.length < 2}
          >
            Merge Selected
          </button>
          <ExportButton labels={labels} />
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading">
          <p>{loadingStatus || 'Loading labels...'}</p>
          {/* Add a loading spinner or progress indicator here if desired */}
          {loadingStatus === 'Fetching labels...' && (
            <p className="loading-time">This might take a moment...</p>
          )}
        </div>
      ) : (
        <LabelTable 
          labels={filteredLabels} 
          onSelectionChange={handleLabelSelection} 
        />
      )}
      
      {isAddModalOpen && (
        <AddLabelModal 
          onClose={() => setIsAddModalOpen(false)} 
          onAddLabel={handleAddLabel} 
        />
      )}
      
      {isDeleteModalOpen && (
        <DeleteLabelModal 
          onClose={() => setIsDeleteModalOpen(false)} 
          onDelete={handleDeleteLabels} 
          selectedLabels={selectedLabels} 
        />
      )}
      
      {isMergeModalOpen && (
        <MergeLabelModal 
          onClose={() => setIsMergeModalOpen(false)} 
          onMerge={handleMergeLabels} 
          selectedLabels={selectedLabels} 
          allLabels={labels} 
        />
      )}
    </div>
  );
}

export default App;
