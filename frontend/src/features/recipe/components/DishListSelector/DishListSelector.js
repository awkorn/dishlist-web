import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import styles from "./DishListSelector.module.css";
import { GET_USER_DISHLISTS } from "../../../../graphql/queries/dishLists";

const DishListSelector = ({
  currentUserId,
  dishListParam,
  value,
  onChange,
}) => {
  const [internalSelectedDishList, setInternalSelectedDishList] = useState(
    value || ""
  );

  // Determine which value and setter to use (props vs internal)
  const selectedDishList =
    value !== undefined ? value : internalSelectedDishList;

  const handleDishListChange = (newValue) => {
    if (onChange) {
      onChange(newValue); // Controlled component using props
    }

    setInternalSelectedDishList(newValue); // Internal state for uncontrolled usage
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDishLists, setFilteredDishLists] = useState([]);
  const [allDishLists, setAllDishLists] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch user's dishlists
  const { loading, error, data } = useQuery(GET_USER_DISHLISTS, {
    variables: { userId: currentUserId },
    skip: !currentUserId,
  });

  // Initialize with dishListParam from URL if provided
  useEffect(() => {
    if (dishListParam && !selectedDishList) {
      handleDishListChange(dishListParam);
    }
  }, [dishListParam, selectedDishList]);

  // Set default "My Recipes" dishlist if none is selected and no URL param
  useEffect(() => {
    if (!loading && !error && data && !selectedDishList && !dishListParam) {
      const myRecipes = data.getUserOwnedDishLists?.find(
        (list) => list.title === "My Recipes"
      );
      if (myRecipes) {
        handleDishListChange(myRecipes.id);
      }
    }
  }, [data, loading, error, selectedDishList, dishListParam]);

  // Process and combine dishlists when data is fetched
  useEffect(() => {
    if (data) {
      const ownedLists = data.getUserOwnedDishLists || [];
      const collaboratedLists = data.getUserCollaboratedDishLists || [];

      // Add a type property to distinguish between owned and collaborated lists
      const ownedWithType = ownedLists.map((list) => ({
        ...list,
        type: "owned",
      }));
      const collaboratedWithType = collaboratedLists.map((list) => ({
        ...list,
        type: "collaborated",
      }));

      // Sort pinned lists first, then alphabetically
      const sortedOwnedLists = ownedWithType.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.title.localeCompare(b.title);
      });

      // Combine both lists
      const combinedLists = [...sortedOwnedLists, ...collaboratedWithType];
      setAllDishLists(combinedLists);
      setFilteredDishLists(combinedLists);
    }
  }, [data]);

  // Filter dishlists based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDishLists(allDishLists);
    } else {
      const filtered = allDishLists.filter((list) =>
        list.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDishLists(filtered);
    }
  }, [searchTerm, allDishLists]);

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const selector = document.getElementById("dishlist-selector");
      if (selector && !selector.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle dishlist selection
  const handleSelect = (id) => {
    handleDishListChange(id);
    setIsExpanded(false);
  };

  // Get display name for selected dishlist
  const getSelectedDishListName = () => {
    if (!selectedDishList) return "Select a DishList";

    const selected = allDishLists.find((list) => list.id === selectedDishList);
    return selected ? selected.title : "Select a DishList";
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className={styles.dishlistSelectorSection}>
      <h3>Select DishList</h3>
      {value === "" && (
        <p className={styles.errorMessage}>Please select a DishList</p>
      )}

      <div id="dishlist-selector" className={styles.dishlistSelector}>
        <div
          className={`${styles.selectedDishlist} ${
            isExpanded ? styles.expanded : ""
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className={styles.selectedText}>
            {getSelectedDishListName()}
          </span>
          <span
            className={`${styles.dropdownArrow} ${isExpanded ? styles.up : ""}`}
          >
            ▼
          </span>
        </div>

        {isExpanded && (
          <div className={styles.dishlistDropdown}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search DishLists..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.dishlistSearch}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {loading ? (
              <div className={styles.dropdownLoading}>
                Loading your DishLists...
              </div>
            ) : error ? (
              <div className={styles.dropdownError}>
                Error loading DishLists
              </div>
            ) : filteredDishLists.length === 0 ? (
              <div className={styles.noResults}>No DishLists found</div>
            ) : (
              <ul className={styles.dishlistOptions}>
                {filteredDishLists.map((list) => (
                  <li
                    key={list.id}
                    className={`${styles.dishlistOption} ${
                      selectedDishList === list.id ? styles.selected : ""
                    }`}
                    onClick={() => handleSelect(list.id)}
                  >
                    <span className={styles.dishlistTitle}>{list.title}</span>
                    {list.isPinned && (
                      <span className={styles.pinnedIndicator}>📌</span>
                    )}
                    {list.type === "collaborated" && (
                      <span className={styles.collaboratorIndicator}>
                        Collaborator
                      </span>
                    )}
                    {selectedDishList === list.id && (
                      <span className={styles.selectedCheck}>✓</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <p className={styles.dishlistHint}>
        The recipe will be added to your selected DishList.
      </p>
    </div>
  );
};

export default DishListSelector;
