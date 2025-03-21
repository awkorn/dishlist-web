import React, { useState, useEffect } from "react";
import { useMutation, useApolloClient } from "@apollo/client";
import { gql } from "@apollo/client";
import { toast } from "react-toastify";
import styles from "./CollaboratorList.module.css";

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

const REMOVE_COLLABORATOR = gql`
  mutation RemoveCollaborator(
    $dishListId: ID!
    $targetUserId: String!
    $userId: String!
  ) {
    removeCollaborator(
      dishListId: $dishListId
      targetUserId: $targetUserId
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
  const client = useApolloClient();
  const currentUserId = localStorage.getItem("userId");

  const [removeCollaborator, { loading: removeLoading }] =
    useMutation(REMOVE_COLLABORATOR);

  useEffect(() => {
    const fetchCollaboratorDetails = async () => {
      const details = [];
      for (const uid of collaborators) {
        try {
          const { data } = await client.query({
            query: GET_USER_BY_FIREBASE_UID,
            variables: { firebaseUid: uid },
          });
          if (data?.getUserByFirebaseUid) {
            details.push({
              ...data.getUserByFirebaseUid,
              firebaseUid: uid,
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

  const handleRemoveCollaborator = async (targetUserId) => {
    try {
      await removeCollaborator({
        variables: {
          dishListId,
          targetUserId,
          userId: currentUserId,
        },
      });
      toast.success("Collaborator removed successfully");
      setCollaboratorDetails((prev) =>
        prev.filter((collab) => collab.firebaseUid !== targetUserId)
      );
      if (onRefetch) onRefetch();
    } catch (error) {
      toast.error("Failed to remove collaborator: " + error.message);
    }
  };

  if (collaborators.length === 0) return null;

  return (
    <div className={styles.collaboratorsSection}>
      <div
        className={styles.collaboratorsHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>
          <span className={styles.collaboratorsCount}>
            {collaborators.length}
          </span>{" "}
          {collaborators.length === 1 ? "Collaborator" : "Collaborators"}
        </h3>
        <span
          className={`${styles.toggleIcon} ${
            isExpanded ? styles.expanded : ""
          }`}
        >
          ▼
        </span>
      </div>

      {isExpanded && (
        <div className={styles.collaboratorsList}>
          {collaboratorDetails.length > 0 ? (
            collaboratorDetails.map((collab) => (
              <div key={collab.id} className={styles.collaboratorItem}>
                <div className={styles.collaboratorInfo}>
                  {collab.profilePicture ? (
                    <img
                      src={collab.profilePicture}
                      alt={collab.username}
                      className={styles.collaboratorAvatar}
                    />
                  ) : (
                    <div className={styles.collaboratorAvatarPlaceholder}>
                      {collab.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={styles.collaboratorDetails}>
                    <div className={styles.collaboratorName}>
                      {collab.username}
                    </div>
                    <div className={styles.collaboratorEmail}>
                      {collab.email}
                    </div>
                  </div>
                </div>
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveCollaborator(collab.firebaseUid)}
                  disabled={removeLoading}
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <div className={styles.loadingCollaborators}>
              Loading collaborator details...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollaboratorList;
