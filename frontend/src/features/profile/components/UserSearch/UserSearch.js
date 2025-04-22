import React, { useState, useEffect, useRef } from "react";
import { useLazyQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { SEARCH_USERS } from "../../../../graphql/queries/userProfile";
import styles from "./UserSearch.module.css";

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchUsers, { loading, data }] = useLazyQuery(SEARCH_USERS);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced search function
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchUsers({ variables: { searchTerm: searchTerm.trim(), limit: 10 } });
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchUsers]);

  const handleUserSelect = (userId) => {
    navigate(`/profile/${userId}`);
    setSearchTerm("");
    setIsOpen(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const toggleSearch = () => {
    if (!isOpen && searchTerm.trim() === "") {
      setIsOpen(true);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.searchContainer} ref={searchRef}>
      <div className={styles.searchInputContainer}>
        <Search
          size={20}
          className={styles.searchIcon}
          onClick={toggleSearch}
        />
        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput}
          placeholder="Search for users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (searchTerm.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
        />
        {searchTerm && (
          <X
            size={18}
            className={styles.clearIcon}
            onClick={clearSearch}
          />
        )}
      </div>

      {isOpen && searchTerm.trim().length >= 2 && (
        <div className={styles.resultsDropdown}>
          {loading ? (
            <div className={styles.loadingItem}>Searching...</div>
          ) : data && data.searchUsers.length > 0 ? (
            data.searchUsers.map((user) => (
              <div
                key={user.id}
                className={styles.userItem}
                onClick={() => handleUserSelect(user.firebaseUid)}
              >
                <div className={styles.userAvatar}>
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.username} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>
                    {user.firstName} {user.lastName}
                  </div>
                  <div className={styles.userUsername}>@{user.username}</div>
                </div>
              </div>
            ))
          ) : searchTerm.trim().length >= 2 ? (
            <div className={styles.noResults}>No users found</div>
          ) : (
            <div className={styles.noResults}>
              Type at least 2 characters to search
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;