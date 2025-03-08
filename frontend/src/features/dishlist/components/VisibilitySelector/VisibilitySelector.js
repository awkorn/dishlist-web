import React, { useState, useRef, useEffect } from 'react';
import './VisibilitySelector.css';

const VisibilitySelector = ({ currentVisibility, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef(null);
  
  // Options for visibility with icons and descriptions
  const visibilityOptions = [
    {
      value: 'public',
      label: 'Public',
      description: 'Anyone can view and follow this dishlist',
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Only you and collaborators can see this dishlist',
    },
    {
      value: 'shared',
      label: 'Shared',
      description: 'Only specific people you invite can view this dishlist',
    }
  ];
  
  // Find the current selected option
  const selectedOption = visibilityOptions.find(option => option.value === currentVisibility) || visibilityOptions[1];
  
  // Handle selecting a new visibility option
  const handleSelect = (value) => {
    if (value !== currentVisibility) {
      onChange(value);
    }
    setIsOpen(false);
  };
  
  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="visibility-selector" ref={selectorRef}>
      <button 
        className="visibility-button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="visibility-label">{selectedOption.label}</span>
        <span className="dropdown-arrow">▼</span>
      </button>
      
      {isOpen && (
        <div className="visibility-dropdown">
          {visibilityOptions.map(option => (
            <div 
              key={option.value}
              className={`dropdown-item ${option.value === currentVisibility ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              <div className="option-header">
                <span className="option-icon">{option.icon}</span>
                <span className="option-label">{option.label}</span>
                {option.value === currentVisibility && (
                  <span className="selected-check">✓</span>
                )}
              </div>
              <p className="option-description">{option.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisibilitySelector;