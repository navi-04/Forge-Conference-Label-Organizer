import React from 'react';

const ExportButton = ({ labels }) => {
  const handleExport = () => {
    // Convert labels to CSV format
    const headers = ['Label Name', 'Pages', 'Blog Posts', 'Total Count'];
    const rows = labels.map(label => [
      label.name,
      label.pageCount,
      label.blogPostCount,
      label.pageCount + label.blogPostCount
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create a blob and download it
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `confluence-labels-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <button 
      className="secondary-button" 
      onClick={handleExport}
      disabled={!labels || labels.length === 0}
    >
      Export to CSV
    </button>
  );
};

export default ExportButton;
