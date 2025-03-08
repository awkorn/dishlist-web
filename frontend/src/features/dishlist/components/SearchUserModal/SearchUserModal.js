import React, { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import './SearchUserModal.css';

// GraphQL query to search users
const SEARCH_USERS = gql`
  query SearchUsers($searchTerm: String!, $limit: Int) {
    searchUsers(searchTerm: $searchTerm, limit: $limit) {
      id
      firebaseUid
      username
      email
      profilePicture
    }
  }
`;

const SearchUserModal = ({ onClose, onSelect, currentCollaborators = [], ownerId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Use lazy query for user search
  const [searchUsers, { loading, data }] = useLazyQuery(SEARCH_USERS);
  
  // When search term changes, trigger the query
  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchUsers({
        variables: { searchTerm, limit: 10 }
      });
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, searchUsers]);
  
  // When data changes, update search results
  useEffect(() => {
    if (data?.searchUsers) {
      // Filter out current collaborators and the owner
      const filteredUsers = data.searchUsers.filter(user => 
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
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOutsideClick}>
      <div className="search-user-modal">
        <div className="modal-header">
          <h2>Invite a Collaborator</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-search-container">
          <input
            type="text"
            placeholder="Search by username or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="modal-search-input"
            autoFocus
          />
        </div>
        
        <div className="modal-search-results">
          {loading ? (
            <div className="modal-search-loading">Searching...</div>
          ) : searchResults.length > 0 ? (
            <ul className="modal-user-list">
              {searchResults.map(user => (
                <li key={user.id} className="modal-user-item">
                  <div className="modal-user-info">
                    {user.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={user.username} 
                        className="modal-user-avatar" 
                      />
                    ) : (
                      <div className="modal-user-avatar-placeholder">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="modal-user-details">
                      <div className="modal-username">{user.username}</div>
                      <div className="modal-email">{user.email}</div>
                    </div>
                  </div>
                  <button 
                    className="modal-invite-button"
                    onClick={() => handleSelectUser(user.firebaseUid)}
                  >
                    Invite
                  </button>
                </li>
              ))}
            </ul>
          ) : searchTerm.length >= 2 ? (
            <div className="modal-no-results">No users found</div>
          ) : (
            <div className="modal-search-prompt">Type at least 2 characters to search</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchUserModal;