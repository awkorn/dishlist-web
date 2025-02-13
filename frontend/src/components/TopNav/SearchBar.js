import React from "react";

const SearchBar = ({ pageType }) => {
  if (pageType !== "dishlists" && pageType !== "recipes") return null;

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder={`Search ${pageType}`}
        className="search-input"
      />
    </div>
  );
};

export default SearchBar;
