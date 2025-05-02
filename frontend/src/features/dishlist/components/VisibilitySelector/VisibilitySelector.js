import React, { useState, useRef, useEffect } from "react";
import styles from "./VisibilitySelector.module.css";
import { ChevronDown } from 'lucide-react';

const VisibilitySelector = ({ currentVisibility, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef(null);

  // Options for visibility with icons and descriptions
  const visibilityOptions = [
    {
      value: "public",
      label: "Public",
      description: "Anyone can view and follow this dishlist",
    },
    {
      value: "private",
      label: "Private",
      description: "Only you and collaborators can see this dishlist",
    }
  ];

  // Find the current selected option
  const selectedOption =
    visibilityOptions.find((option) => option.value === currentVisibility) ||
    visibilityOptions[1];

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.visibilitySelector} ref={selectorRef}>
      <button
        className={styles.visibilityButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className={styles.visibilityLabel}>{selectedOption.label}</span>
        <ChevronDown size={16} className={styles.dropdownArrow} />
      </button>

      {isOpen && (
        <div className={styles.visibilityDropdown}>
          {visibilityOptions.map((option) => (
            <div
              key={option.value}
              className={`${styles.dropdownItem} ${
                option.value === currentVisibility
                  ? styles.dropdownItemSelected
                  : ""
              }`}
              onClick={() => handleSelect(option.value)}
            >
              <div className={styles.optionHeader}>
                <span className={styles.optionIcon}>{option.icon}</span>
                <span className={styles.optionLabel}>{option.label}</span>
                {option.value === currentVisibility && (
                  <span className={styles.selectedCheck}>✓</span>
                )}
              </div>
              <p className={styles.optionDescription}>{option.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisibilitySelector;