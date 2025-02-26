import React from "react";
import { useMutation, gql } from "@apollo/client";
import "./DishListTile.css";
import pinIcon from "../../../assets/icons/pin-drawing.png";
import { Link } from "react-router-dom";

// GraphQL Mutations
const FOLLOW_DISHLIST = gql`
  mutation FollowDishList($dishListId: ID!, $userId: String!) {
    followDishList(dishListId: $dishListId, userId: $userId) {
      id
      followers
    }
  }
`;

const UNFOLLOW_DISHLIST = gql`
  mutation UnfollowDishList($dishListId: ID!, $userId: String!) {
    unfollowDishList(dishListId: $dishListId, userId: $userId)
  }
`;

const REQUEST_TO_FOLLOW = gql`
  mutation RequestToFollow($dishListId: ID!, $userId: String!) {
    requestToFollow(dishListId: $dishListId, userId: $userId)
  }
`;

const DishListTile = ({
  dishLists,
  currentUserId,
  refetch,
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

  if (!dishLists || dishLists.length === 0)
    return (
      <div className="no-dishlists-container">
        <p className="no-dishlists-message">No DishLists found.</p>
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

        return (
          <div key={dishlist.id} className="dish-tile">
            <div className="dish-tile-header">
              <h3 className="list-title">
                <Link to={`/dishlist/${dishlist.id}`}>{dishlist.title}</Link>
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

            {/* Only show follow/unfollow for non-owners and non-collaborators */}
            {!userIsOwner && !userIsCollaborator && (
              <div className="follow-action">
                {userIsFollower ? (
                  <button
                    className="unfollow-btn"
                    onClick={() => handleUnfollow(dishlist.id)}
                  >
                    Unfollow
                  </button>
                ) : dishlist.visibility === "public" ? (
                  <button
                    className="follow-btn"
                    onClick={() => handleFollow(dishlist.id)}
                  >
                    Follow
                  </button>
                ) : (
                  !userHasPendingRequest && (
                    <button
                      className="request-follow-btn"
                      onClick={() => handleRequestFollow(dishlist.id)}
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
