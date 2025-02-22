import React, { useState } from "react";

const SearchBar = ({ pageType, items, onSearch }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value.trim() === "") {
      onSearch(items);
    } else {
      const filteredItems = items.filter((item) =>
        item.title.toLowerCase().includes(value.toLowerCase())
      );
      onSearch(filteredItems);
    }
  };

  if (pageType !== "dishlists" && pageType !== "recipes") return null;

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder={`Search ${pageType}`}
        className="search-input"
        value={searchValue}
        onChange={handleSearchChange}
      />
    </div>
  );
};

export default SearchBar;
