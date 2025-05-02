import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_USERS } from "../../../../graphql/queries/userProfile";
import styles from "./SearchUserModal.module.css";

const SearchUserModal = ({
  onClose,
  onSelect,
  currentCollaborators = [],
  ownerId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Use lazy query for user search
  const [searchUsers, { loading, data }] = useLazyQuery(SEARCH_USERS);

  // When search term changes, trigger the query
  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchUsers({
        variables: { searchTerm, limit: 10 },
      });
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, searchUsers]);

  // When data changes, update search results
  useEffect(() => {
    if (data?.searchUsers) {
      // Filter out current collaborators and the owner
      const filteredUsers = data.searchUsers.filter(
        (user) =>
          user.firebaseUid !== ownerId &&
          !currentCollaborators.includes(user.firebaseUid)
      );
      setSearchResults(filteredUsers);
    }
  }, [data, currentCollaborators, ownerId]);

  // Handle selecting a user
  const handleSelectUser = (userId) => {
    onSelect(userId);
  };

  // Handle clicking outside the modal to close it
  const handleOutsideClick = (e) => {
    if (e.target.className === styles.modalOverlay) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOutsideClick}>
      <div className={styles.searchUserModal}>
        <div className={styles.modalHeader}>
          <h2>Invite a Collaborator</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalSearchContainer}>
          <input
            type="text"
            placeholder="Search by username or name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.modalSearchInput}
            autoFocus
          />
        </div>

        <div className={styles.modalSearchResults}>
          {loading ? (
            <div className={styles.modalSearchLoading}>Searching...</div>
          ) : searchResults.length > 0 ? (
            <ul className={styles.modalUserList}>
              {searchResults.map((user) => (
                <li key={user.id} className={styles.modalUserItem}>
                  <div className={styles.modalUserInfo}>
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className={styles.modalUserAvatar}
                      />
                    ) : (
                      <div className={styles.modalUserAvatarPlaceholder}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className={styles.modalUserDetails}>
                      <div className={styles.modalUsername}>
                        {user.username}
                      </div>
                      <div className={styles.modalFullname}>
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                  </div>
                  <button
                    className={styles.modalInviteButton}
                    onClick={() => handleSelectUser(user.firebaseUid)}
                  >
                    Invite
                  </button>
                </li>
              ))}
            </ul>
          ) : searchTerm.length >= 2 ? (
            <div className={styles.modalNoResults}>No users found</div>
          ) : (
            <div className={styles.modalSearchPrompt}>
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchUserModal;
