import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { Pin } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "../../pages/DishListsPage.module.css";
import { GET_DISHLISTS_RECIPE_COUNTS } from "../../../../graphql";

const DishListTile = ({
  dishLists,
  currentUserId,
  selectionMode = false,
  selectedDishList,
  onSelectDishList,
  isOwner,
  isCollaborator,
  isFollowing,
}) => {
  const [recipeCounts, setRecipeCounts] = useState({});

  // Fetch recipe counts for all dishlists
  const { loading: countsLoading, data: countsData } = useQuery(
    GET_DISHLISTS_RECIPE_COUNTS,
    {
      variables: {
        dishListIds: dishLists?.map((list) => list.id) || [],
        userId: currentUserId,
      },
      skip: !dishLists?.length || !currentUserId,
      fetchPolicy: "cache-first", 
      notifyOnNetworkStatusChange: true,
    }
  );

  // Process recipe counts data when it arrives
  useEffect(() => {
    if (countsData?.dishListsRecipeCounts) {
      const countsMap = {};
      countsData.dishListsRecipeCounts.forEach((item) => {
        countsMap[item.dishListId] = item.count;
      });
      setRecipeCounts(countsMap);
    }
  }, [countsData]);

  const handleDishListSelection = (dishListId) => {
    if (selectionMode && onSelectDishList) {
      // Allow selection for any dishlist the user has access to
      const userIsOwner = isOwner(dishListId);
      const userIsCollaborator = isCollaborator(dishListId);
      const userIsFollower = isFollowing(dishListId);
      
      // User can select if they have any relationship to the dishlist
      if (userIsOwner || userIsCollaborator || userIsFollower) {
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
        const userIsOwner = isOwner(dishlist.id);
        const userIsCollaborator = isCollaborator(dishlist.id);
        const userIsFollower = isFollowing(dishlist.id);
        const userHasPendingRequest =
          dishlist.followRequests?.includes(currentUserId);
        const isSelected = selectedDishList === dishlist.id;
        
        // User can select if they have any relationship to the dishlist
        const canSelect = selectionMode && (userIsOwner || userIsCollaborator || userIsFollower);
        
        const tileClasses = [
          styles.dishTile,
          isSelected ? styles.selectedTile : "",
          canSelect ? styles.selectableTile : "",
          canSelect ? "dish-list-selectable" : "", 
        ]
          .filter(Boolean)
          .join(" ");

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
              {dishlist.isPinned && <Pin size={20} className={styles.pin} />}
            </div>

            {/* Recipe Count Display */}
            <div className={styles.recipeCountDisplay}>
              {countsLoading ? (
                <span className={styles.loadingCount}>Loading...</span>
              ) : (
                <span>
                  {recipeCounts[dishlist.id] !== undefined
                    ? `${recipeCounts[dishlist.id]} ${
                        recipeCounts[dishlist.id] === 1 ? "recipe" : "recipes"
                      }`
                    : "No recipes"}
                </span>
              )}
            </div>

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
              {userHasPendingRequest && (
                <span className={`${styles.badge} ${styles.pendingBadge}`}>
                  Pending
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

export default DishListTile;