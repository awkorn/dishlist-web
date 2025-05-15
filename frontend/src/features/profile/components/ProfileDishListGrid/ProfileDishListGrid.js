import React from "react";
import { Link } from "react-router-dom";
import { Pin } from "lucide-react";
import styles from "./ProfileDishListGrid.module.css";

const ProfileDishListGrid = ({ dishLists, currentUserId }) => {
  if (!dishLists || dishLists.length === 0) {
    return (
      <div className={styles.noDishlistsContainer}>
        <div className={styles.emptyStateIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#274b75"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h3 className={styles.noDishlistsMessage}>No DishLists Available</h3>
      </div>
    );
  }

  return (
    <div className={styles.dishTiles}>
      {dishLists.map((dishlist) => {
        const userIsOwner = dishlist.userId === currentUserId;
        const userIsCollaborator =
          dishlist.collaborators.includes(currentUserId);
        const userIsFollower = dishlist.followers.includes(currentUserId);

        return (
          <div key={dishlist.id} className={styles.dishTile}>
            <div className={styles.dishTileHeader}>
              <h3 className={styles.listTitle}>
                <Link to={`/dishlist/${dishlist.id}`}>{dishlist.title}</Link>
              </h3>
              {dishlist.isPinned && <Pin size={20} className={styles.pin} />}
            </div>

            {dishlist.description && (
              <p className={styles.description}>{dishlist.description}</p>
            )}

            <div className={styles.statusBadges}>
              {userIsOwner && (
                <span className={`${styles.badge} ${styles.ownerBadge}`}>
                  Owner
                </span>
              )}
              {userIsCollaborator && (
                <span className={`${styles.badge} ${styles.collabBadge}`}>
                  Collaborator
                </span>
              )}
              {userIsFollower && (
                <span className={`${styles.badge} ${styles.followerBadge}`}>
                  Following
                </span>
              )}
              <span
                className={`${styles.badge} ${styles.visibilityBadge} ${
                  styles[dishlist.visibility + "Badge"]
                }`}
              >
                {dishlist.visibility.charAt(0).toUpperCase() +
                  dishlist.visibility.slice(1)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProfileDishListGrid;