import React, { useState } from "react";
import styles from "../TopNav.module.css";
import UserSearch from "../../../../features/profile/components/UserSearch/UserSearch";

const SearchBar = ({ pageType, items, onSearch }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  if (pageType === "profile") {
    return <UserSearch />;
  }

  if (pageType !== "dishlists" && pageType !== "recipes") return null;

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder={`Search ${pageType}`}
        className={styles.searchInput}
        value={searchValue}
        onChange={handleSearchChange}
      />
      <span className={styles.searchIcon}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </span>
    </div>
  );
};

export default SearchBar;