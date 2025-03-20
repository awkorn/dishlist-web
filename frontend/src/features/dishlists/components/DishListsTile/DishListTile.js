import React from "react";
import { useMutation } from "@apollo/client";
import { Pin } from 'lucide-react';
import { Link } from "react-router-dom";
import styles from "../../pages/DishListsPage.module.css";
import {
  FOLLOW_DISHLIST,
  UNFOLLOW_DISHLIST,
  REQUEST_TO_FOLLOW,
} from "../../../../graphql";

const DishListTile = ({
  dishLists,
  currentUserId,
  refetch,
  selectionMode = false,
  selectedDishList,
  onSelectDishList,
  isOwner,
}) => {
  const [followDishList] = useMutation(FOLLOW_DISHLIST, {
    onCompleted: () => refetch(),
  });

  const [unfollowDishList] = useMutation(UNFOLLOW_DISHLIST, {
    onCompleted: () => refetch(),
  });

  const [requestToFollow] = useMutation(REQUEST_TO_FOLLOW, {
    onCompleted: () => refetch(),
  });

  const handleFollow = (dishListId) => {
    followDishList({
      variables: { dishListId, userId: currentUserId },
    });
  };

  const handleUnfollow = (dishListId) => {
    unfollowDishList({
      variables: { dishListId, userId: currentUserId },
    });
  };

  const handleRequestFollow = (dishListId) => {
    requestToFollow({
      variables: { dishListId, userId: currentUserId },
    });
    alert("Follow request sent!");
  };

  const handleDishListSelection = (dishListId) => {
    if (selectionMode && onSelectDishList) {   
      // Modified condition to ensure ownership check works
      if (isOwner(dishListId)) {
        onSelectDishList(dishListId === selectedDishList ? null : dishListId);
      }
    }
  };

  if (!dishLists || dishLists.length === 0)
    return (
      <div className={styles.noDishlistsContainer}>
        <div className="empty-state-icon">
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
        <h3 className={styles.noDishlistsMessage}>No DishLists Found</h3>
      </div>
    );

  return (
    <div className={styles.dishTiles}>
      {dishLists.map((dishlist) => {
        const userIsOwner = dishlist.userId === currentUserId;
        const userIsCollaborator =
          dishlist.collaborators.includes(currentUserId);
        const userIsFollower = dishlist.followers.includes(currentUserId);
        const userHasPendingRequest =
          dishlist.followRequests?.includes(currentUserId);
        const isSelected = selectedDishList === dishlist.id;
        const canSelect = selectionMode && userIsOwner;

        const tileClasses = [
          styles.dishTile,
          isSelected ? styles.selectedTile : "",
          canSelect ? styles.selectableTile : "",
        ].filter(Boolean).join(" ");

        return (
          <div
            key={dishlist.id}
            className={tileClasses}
            onClick={() => handleDishListSelection(dishlist.id)}
          >
            {isSelected && (
              <div className={styles.selectionIndicator}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            )}

            <div className={styles.dishTileHeader}>
              <h3 className={styles.listTitle}>
                {selectionMode ? (
                  <span>{dishlist.title}</span>
                ) : (
                  <Link to={`/dishlist/${dishlist.id}`}>{dishlist.title}</Link>
                )}
              </h3>
              {dishlist.isPinned && (
                <Pin size={20} className={styles.pin} />
              )}
            </div>

            <div className={styles.statusBadges}>
              {userIsOwner && <span className={`${styles.badge} ${styles.ownerBadge}`}>Owner</span>}
              {userIsCollaborator && (
                <span className={`${styles.badge} ${styles.collabBadge}`}>Collaborator</span>
              )}
              {userIsFollower && (
                <span className={`${styles.badge} ${styles.followerBadge}`}>Following</span>
              )}
              {userHasPendingRequest && (
                <span className={`${styles.badge} ${styles.pendingBadge}`}>Pending</span>
              )}
              <span className={`${styles.badge} ${styles.visibilityBadge} ${styles[dishlist.visibility + 'Badge']}`}>
                {dishlist.visibility.charAt(0).toUpperCase() +
                  dishlist.visibility.slice(1)}
              </span>
            </div>

            {/* Only show follow/unfollow for non-owners and non-collaborators when not in selection mode */}
            {!selectionMode && !userIsOwner && !userIsCollaborator && (
              <div className={styles.followAction}>
                {userIsFollower ? (
                  <button
                    className={styles.unfollowBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnfollow(dishlist.id);
                    }}
                  >
                    Unfollow
                  </button>
                ) : dishlist.visibility === "public" ? (
                  <button
                    className={styles.followBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollow(dishlist.id);
                    }}
                  >
                    Follow
                  </button>
                ) : (
                  !userHasPendingRequest && (
                    <button
                      className={styles.requestFollowBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestFollow(dishlist.id);
                      }}
                    >
                      Request to Follow
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DishListTile;