import React from "react";
import { useMutation } from "@apollo/client";
import pinIcon from "../../../assets/icons/pin-drawing.png";
import { Link } from "react-router-dom";
import "../DishListsPage.css";
import {
  FOLLOW_DISHLIST,
  UNFOLLOW_DISHLIST,
  REQUEST_TO_FOLLOW,
} from "../../../graphql";

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
    if (selectionMode && onSelectDishList && isOwner(dishListId)) {
      onSelectDishList(dishListId === selectedDishList ? null : dishListId);
    }
  };

  if (!dishLists || dishLists.length === 0)
    return (
      <div className="no-dishlists-container">
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
        <h3 className="no-dishlists-message">No DishLists Found</h3>
      </div>
    );

  return (
    <div className="dish-tiles">
      {dishLists.map((dishlist) => {
        const userIsOwner = dishlist.userId === currentUserId;
        const userIsCollaborator =
          dishlist.collaborators.includes(currentUserId);
        const userIsFollower = dishlist.followers.includes(currentUserId);
        const userHasPendingRequest =
          dishlist.followRequests?.includes(currentUserId);
        const isSelected = selectedDishList === dishlist.id;
        const canSelect = selectionMode && userIsOwner;

        return (
          <div
            key={dishlist.id}
            className={`dish-tile ${isSelected ? "selected" : ""} ${
              canSelect ? "selectable" : ""
            }`}
            onClick={() => handleDishListSelection(dishlist.id)}
          >
            {isSelected && (
              <div className="selection-indicator">
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

            <div className="dish-tile-header">
              <h3 className="list-title">
                {selectionMode ? (
                  <span>{dishlist.title}</span>
                ) : (
                  <Link to={`/dishlist/${dishlist.id}`}>{dishlist.title}</Link>
                )}
              </h3>
              {dishlist.isPinned && (
                <img src={pinIcon} alt="pin" className="pin" />
              )}
            </div>

            <div className="status-badges">
              {userIsOwner && <span className="badge owner-badge">Owner</span>}
              {userIsCollaborator && (
                <span className="badge collab-badge">Collaborator</span>
              )}
              {userIsFollower && (
                <span className="badge follower-badge">Following</span>
              )}
              {userHasPendingRequest && (
                <span className="badge pending-badge">Pending</span>
              )}
              <span className={`badge visibility-badge ${dishlist.visibility}`}>
                {dishlist.visibility.charAt(0).toUpperCase() +
                  dishlist.visibility.slice(1)}
              </span>
            </div>

            {/* Only show follow/unfollow for non-owners and non-collaborators when not in selection mode */}
            {!selectionMode && !userIsOwner && !userIsCollaborator && (
              <div className="follow-action">
                {userIsFollower ? (
                  <button
                    className="unfollow-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnfollow(dishlist.id);
                    }}
                  >
                    Unfollow
                  </button>
                ) : dishlist.visibility === "public" ? (
                  <button
                    className="follow-btn"
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
                      className="request-follow-btn"
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
