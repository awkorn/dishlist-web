import React, { useState, useEffect } from 'react';
import { useMutation, useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';
import { toast } from 'react-toastify';
import './CollaboratorList.css';

// GraphQL query to get user details
const GET_USER_BY_FIREBASE_UID = gql`
  query GetUserByFirebaseUid($firebaseUid: String!) {
    getUserByFirebaseUid(firebaseUid: $firebaseUid) {
      id
      username
      email
      profilePicture
    }
  }
`;

// GraphQL mutation to remove a collaborator
const REMOVE_COLLABORATOR = gql`
  mutation RemoveCollaborator($dishListId: ID!, $targetUserId: String!, $userId: String!) {
    removeCollaborator(
      dishListId: $dishListId,
      targetUserId: $targetUserId,
      userId: $userId
    ) {
      id
      collaborators
    }
  }
`;

const CollaboratorList = ({ collaborators, dishListId, onRefetch }) => {
  const [collaboratorDetails, setCollaboratorDetails] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get Apollo client instance
  const client = useApolloClient();
  
  // Get current user from auth context for the remove mutation
  const currentUserId = localStorage.getItem('userId'); // Simplified, use your auth context in real implementation
  
  // Set up the remove collaborator mutation
  const [removeCollaborator, { loading: removeLoading }] = useMutation(REMOVE_COLLABORATOR);
  
  // Fetch details for each collaborator
  useEffect(() => {
    const fetchCollaboratorDetails = async () => {
      const details = [];
      
      for (const uid of collaborators) {
        try {
          const { data } = await client.query({
            query: GET_USER_BY_FIREBASE_UID,
            variables: { firebaseUid: uid }
          });
          
          if (data?.getUserByFirebaseUid) {
            details.push({
              ...data.getUserByFirebaseUid,
              firebaseUid: uid
            });
          }
        } catch (error) {
          console.error(`Error fetching details for user ${uid}:`, error);
        }
      }
      
      setCollaboratorDetails(details);
    };
    
    if (collaborators.length > 0) {
      fetchCollaboratorDetails();
    }
  }, [collaborators, client]);
  
  // Handle removing a collaborator
  const handleRemoveCollaborator = async (targetUserId) => {
    try {
      await removeCollaborator({
        variables: {
          dishListId,
          targetUserId,
          userId: currentUserId
        }
      });
      
      toast.success('Collaborator removed successfully');
      
      // Update local state
      setCollaboratorDetails(prev => 
        prev.filter(collab => collab.firebaseUid !== targetUserId)
      );
      
      // Trigger refetch of parent data
      if (onRefetch) {
        onRefetch();
      }
    } catch (error) {
      toast.error('Failed to remove collaborator: ' + error.message);
    }
  };
  
  // If no collaborators, don't render anything
  if (collaborators.length === 0) {
    return null;
  }
  
  return (
    <div className="collaborators-section">
      <div 
        className="collaborators-header" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>
          <span className="collaborators-count">{collaborators.length}</span>
          {" "}
          {collaborators.length === 1 ? 'Collaborator' : 'Collaborators'}
        </h3>
        <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </div>
      
      {isExpanded && (
        <div className="collaborators-list">
          {collaboratorDetails.length > 0 ? (
            collaboratorDetails.map(collab => (
              <div key={collab.id} className="collaborator-item">
                <div className="collaborator-info">
                  {collab.profilePicture ? (
                    <img 
                      src={collab.profilePicture} 
                      alt={collab.username} 
                      className="collaborator-avatar" 
                    />
                  ) : (
                    <div className="collaborator-avatar-placeholder">
                      {collab.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="collaborator-details">
                    <div className="collaborator-name">{collab.username}</div>
                    <div className="collaborator-email">{collab.email}</div>
                  </div>
                </div>
                <button 
                  className="remove-button"
                  onClick={() => handleRemoveCollaborator(collab.firebaseUid)}
                  disabled={removeLoading}
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <div className="loading-collaborators">Loading collaborator details...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollaboratorList;