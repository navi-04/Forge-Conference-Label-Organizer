import React, { useState, useEffect } from 'react';
import './LabelTable.css';

const LabelTable = ({ labels, onSelectionChange }) => {
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending'
  });

  useEffect(() => {
    onSelectionChange(selectedLabels);
  }, [selectedLabels, onSelectionChange]);

  const toggleSelectLabel = (labelName) => {
    setSelectedLabels(prevSelected => {
      if (prevSelected.includes(labelName)) {
        return prevSelected.filter(name => name !== labelName);
      } else {
        return [...prevSelected, labelName];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedLabels.length === labels.length) {
      setSelectedLabels([]);
    } else {
      setSelectedLabels(labels.map(label => label.name));
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedLabels = () => {
    const sortableLabels = [...labels];
    if (sortConfig.key) {
      sortableLabels.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableLabels;
  };

  const getUsageText = (label) => {
    const total = label.pageCount + label.blogPostCount;
    const parts = [];
    
    if (label.pageCount > 0) {
      parts.push(`${label.pageCount} ${label.pageCount === 1 ? 'page' : 'pages'}`);
    }
    
    if (label.blogPostCount > 0) {
      parts.push(`${label.blogPostCount} ${label.blogPostCount === 1 ? 'blog post' : 'blog posts'}`);
    }
    
    return parts.join(', ');
  };

  return (
    <div className="label-table-container">
      {labels.length === 0 ? (
        <div className="no-labels">No labels found in this space.</div>
      ) : (
        <table className="label-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  checked={selectedLabels.length === labels.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th 
                className={`sortable ${sortConfig.key === 'name' ? sortConfig.direction : ''}`}
                onClick={() => requestSort('name')}
              >
                Label name
              </th>
              <th 
                className={`sortable ${sortConfig.key === 'totalCount' ? sortConfig.direction : ''}`}
                onClick={() => requestSort('totalCount')}
              >
                Usage count
              </th>
            </tr>
          </thead>
          <tbody>
            {getSortedLabels().map((label) => (
              <tr key={label.name}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedLabels.includes(label.name)}
                    onChange={() => toggleSelectLabel(label.name)}
                  />
                </td>
                <td>{label.name}</td>
                <td>{getUsageText(label)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LabelTable;
