import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  LEAVE_COLLABORATION,
  INVITE_COLLABORATOR,
  UPDATE_VISIBILITY,
  GET_DISHLIST_DETAIL,
  GET_DISHLIST_RECIPES,
  GET_USER_BY_FIREBASE_UID,
  FOLLOW_DISHLIST,
  UNFOLLOW_DISHLIST,
  REQUEST_TO_FOLLOW
} from "../../../graphql/index";
import { useAuth } from "../../../contexts/AuthProvider";
import TopNav from "../../../components/layout/TopNav/TopNav";
import RecipeList from "../components/RecipeList/RecipeList";
import { toast } from "react-toastify";
import SearchUserModal from "../components/SearchUserModal/SearchUserModal";
import VisibilitySelector from "../components/VisibilitySelector/VisibilitySelector";
import DishListActions from "../components/DishListActions/DishListActions";
import styles from "./DishListDetailPage.module.css";
import { ArrowLeft, UserCircle, Users } from "lucide-react";
import { useApolloClient } from "@apollo/client";

const DishListDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, hasPendingRequest } = useAuth();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [collaboratorDetails, setCollaboratorDetails] = useState([]);
  const [creatorDetails, setCreatorDetails] = useState(null);
  const client = useApolloClient();

  // Fetch dishlist details
  const {
    loading: dishlistLoading,
    error: dishlistError,
    data: dishlistData,
    refetch: refetchDishlist,
  } = useQuery(GET_DISHLIST_DETAIL, {
    variables: { id, userId: currentUser?.uid },
    skip: !currentUser?.uid,
    fetchPolicy: "cache-and-network",
  });

  // Fetch recipes in this dishlist
  const {
    loading: recipesLoading,
    error: recipesError,
    data: recipesData,
  } = useQuery(GET_DISHLIST_RECIPES, {
    variables: { dishListId: id, userId: currentUser?.uid },
    skip: !currentUser?.uid,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  // Fetch creator details
  const [getUserDetails] = useLazyQuery(GET_USER_BY_FIREBASE_UID);

  // Mutations
  const [leaveCollaboration] = useMutation(LEAVE_COLLABORATION);
  const [inviteCollaborator] = useMutation(INVITE_COLLABORATOR);
  const [updateVisibility] = useMutation(UPDATE_VISIBILITY);
  const [followDishList] = useMutation(FOLLOW_DISHLIST);
  const [unfollowDishList] = useMutation(UNFOLLOW_DISHLIST);
  const [requestToFollow] = useMutation(REQUEST_TO_FOLLOW);

  // When recipes data changes, update state
  useEffect(() => {
    if (recipesData?.getDishListRecipes) {
      setRecipes(recipesData.getDishListRecipes);
      setFilteredRecipes(recipesData.getDishListRecipes);
    }
  }, [recipesData]);

  // Handle recipe search/filtering
  useEffect(() => {
    if (recipes.length > 0 && searchTerm) {
      try {
        const searchString = String(searchTerm).toLowerCase();
        const filtered = recipes.filter((recipe) =>
          recipe.title.toLowerCase().includes(searchString)
        );
        setFilteredRecipes(filtered);
      } catch (error) {
        console.error("Error filtering recipes:", error);
        setFilteredRecipes(recipes);
      }
    } else {
      setFilteredRecipes(recipes);
    }
  }, [searchTerm, recipes]);

  // Handle leaving collaboration
  const handleLeaveCollaboration = async () => {
    try {
      await leaveCollaboration({
        variables: {
          userId: currentUser?.uid,
          dishListId: id,
        },
      });

      toast.success("You have left this collaboration");

      // Force a complete cache reset for dish lists
      client.cache.evict({ fieldName: "getDishLists" });
      client.cache.evict({ fieldName: "getUserCollaboratedDishLists" });
      client.cache.gc();

      navigate("/dishlists");
    } catch (error) {
      toast.error("Failed to leave collaboration: " + error.message);
    }
  };

  // Handle inviting a collaborator
  const handleInviteCollaborator = async (targetUserId) => {
    try {
      await inviteCollaborator({
        variables: {
          dishListId: id,
          targetUserId,
          userId: currentUser?.uid,
        },
      });

      toast.success("Invitation sent successfully");
      setSearchModalOpen(false);
      refetchDishlist();
    } catch (error) {
      toast.error("Failed to send invitation: " + error.message);
    }
  };

  // Handle changing visibility
  const handleVisibilityChange = async (visibility) => {
    try {
      await updateVisibility({
        variables: {
          id,
          visibility,
          userId: currentUser?.uid,
        },
      });

      toast.success(`Dishlist is now ${visibility}`);
      refetchDishlist();
    } catch (error) {
      toast.error("Failed to update visibility: " + error.message);
    }
  };

  // Handle following a dishlist
  const handleFollow = async () => {
    try {
      await followDishList({
        variables: { dishListId: id, userId: currentUser?.uid },
      });
      
      toast.success(`You are now following this dishlist`);
      refetchDishlist();

      // Update cache to reflect the follow action
      client.cache.evict({ fieldName: "getDishLists" });
      client.cache.gc();
    } catch (error) {
      toast.error("Failed to follow dishlist: " + error.message);
    }
  };

  // Handle unfollowing a dishlist
  const handleUnfollow = async () => {
    try {
      await unfollowDishList({
        variables: { dishListId: id, userId: currentUser?.uid },
      });
      
      toast.success(`You have unfollowed this dishlist`);
      refetchDishlist();

      // Update cache to reflect the unfollow action
      client.cache.evict({ fieldName: "getDishLists" });
      client.cache.gc();
    } catch (error) {
      toast.error("Failed to unfollow dishlist: " + error.message);
    }
  };

  // Handle requesting to follow a dishlist
  const handleRequestFollow = async () => {
    try {
      await requestToFollow({
        variables: { dishListId: id, userId: currentUser?.uid },
      });
      
      toast.success(`Follow request sent!`);
      refetchDishlist();
    } catch (error) {
      toast.error("Failed to request follow: " + error.message);
    }
  };

  // Fetch collaborator details
  useEffect(() => {
    const fetchCollaboratorDetails = async () => {
      if (dishlistData?.getDishList?.collaborators?.length > 0) {
        const details = [];

        for (const uid of dishlistData.getDishList.collaborators) {
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
      }
    };

    if (dishlistData?.getDishList) {
      fetchCollaboratorDetails();
    }
  }, [dishlistData, client]);

  // Fetch creator details
  useEffect(() => {
    const fetchCreatorDetails = async () => {
      if (dishlistData?.getDishList?.userId) {
        try {
          const { data } = await getUserDetails({
            variables: { firebaseUid: dishlistData.getDishList.userId },
          });

          if (data?.getUserByFirebaseUid) {
            setCreatorDetails(data.getUserByFirebaseUid);
          }
        } catch (error) {
          console.error("Error fetching creator details:", error);
        }
      }
    };

    if (dishlistData?.getDishList) {
      fetchCreatorDetails();
    }
  }, [dishlistData, getUserDetails]);

  // Loading state
  if (dishlistLoading || recipesLoading) {
    return (
      <div className={styles.dishlistDetailContainer}>
        <TopNav />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading dishlist...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dishlistError || recipesError) {
    return (
      <div className={styles.dishlistDetailContainer}>
        <TopNav />
        <div className={styles.errorContainer}>
          <h2>Error</h2>
          <p>{dishlistError?.message || recipesError?.message}</p>
          <button
            className={styles.primaryButton}
            onClick={() => navigate("/dishlists")}
          >
            Back to DishLists
          </button>
        </div>
      </div>
    );
  }

  const dishlist = dishlistData?.getDishList;

  // If dishlist not found or no permissions
  if (!dishlist) {
    return (
      <div className={styles.dishlistDetailContainer}>
        <TopNav />
        <div className={styles.errorContainer}>
          <h2>Dishlist Not Found</h2>
          <p>
            The dishlist you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <button
            className={styles.primaryButton}
            onClick={() => navigate("/dishlists")}
          >
            Back to DishLists
          </button>
        </div>
      </div>
    );
  }

  // Determine user role
  const userIsOwner = dishlist.userId === currentUser?.uid;
  const userIsCollaborator = dishlist.collaborators.includes(currentUser?.uid);
  const userIsFollower = dishlist.followers.includes(currentUser?.uid);
  const userHasPendingRequest = hasPendingRequest ? hasPendingRequest(id) : false;

  const userRole = userIsOwner
    ? "owner"
    : userIsCollaborator
    ? "collaborator"
    : userIsFollower
    ? "follower"
    : "visitor";

  return (
    <div className={styles.dishlistDetailContainer}>
      <TopNav
        pageType="recipes"
        items={recipes}
        onSearch={(term) => setSearchTerm(term)}
      />

      <button
        className={styles.backButton}
        onClick={() => navigate("/dishlists")}
      >
        <ArrowLeft size={18} /> Back to DishLists
      </button>

      <div className={styles.dishlistHeader}>
        <div className={styles.dishlistTitleSection}>
          <h1 className={styles.dishlistTitle}>{dishlist.title}</h1>
          {dishlist.description && (
            <p className={styles.dishlistDescription}>{dishlist.description}</p>
          )}

          <div className={styles.dishlistMeta}>
            <span className={styles.dishlistVisibility}>
              <i
                className={`${styles.visibilityIcon} ${
                  styles[dishlist.visibility]
                }`}
              ></i>
              {dishlist.visibility === "public"
                ? "Public"
                : dishlist.visibility === "private"
                ? "Private"
                : "Shared"}
            </span>

            <span className={styles.recipeCount}>
              {filteredRecipes.length}{" "}
              {filteredRecipes.length === 1 ? "recipe" : "recipes"}
            </span>

            {dishlist.followers?.length > 0 && (
              <span className={styles.followersCount}>
                <Users size={14} className={styles.followersIcon} />
                {dishlist.followers.length}{" "}
                {dishlist.followers.length === 1 ? "follower" : "followers"}
              </span>
            )}
          </div>

          {creatorDetails && !userIsOwner && (
            <div className={styles.creatorInfo}>
              <UserCircle size={16} className={styles.creatorIcon} />
              <span>
                Created by{" "}
                <a 
                  href={`/profile/${dishlist.userId}`}
                  className={styles.creatorLink}
                >
                  {creatorDetails.username}
                </a>
              </span>
            </div>
          )}
        </div>

        <div className={styles.dishlistControls}>
          {/* Follow/Unfollow button for visitors */}
          {!userIsOwner && !userIsCollaborator && (
            <div className={styles.followActions}>
              {userIsFollower ? (
                <button
                  className={`${styles.actionButton} ${styles.unfollowButton}`}
                  onClick={handleUnfollow}
                >
                  Unfollow
                </button>
              ) : dishlist.visibility === "public" ? (
                <button
                  className={`${styles.actionButton} ${styles.followButton}`}
                  onClick={handleFollow}
                >
                  Follow
                </button>
              ) : !userHasPendingRequest && (
                <button
                  className={`${styles.actionButton} ${styles.requestFollowButton}`}
                  onClick={handleRequestFollow}
                >
                  Request to Follow
                </button>
              )}
            </div>
          )}

          {/* Show visibility selector only for owners */}
          {userIsOwner && (
            <VisibilitySelector
              currentVisibility={dishlist.visibility}
              onChange={handleVisibilityChange}
            />
          )}

          {/* Show leave collaboration button for collaborators */}
          {userIsCollaborator && !userIsOwner && (
            <button
              className={`${styles.actionButton} ${styles.leaveButton}`}
              onClick={handleLeaveCollaboration}
            >
              Leave Collaboration
            </button>
          )}

          {/* Actions dropdown menu for owners and collaborators with collaborators data */}
          {(userIsOwner || userIsCollaborator) && (
            <DishListActions
              dishListId={id}
              userIsOwner={userIsOwner}
              userIsCollaborator={userIsCollaborator}
              onOpenInviteModal={() => setSearchModalOpen(true)}
              collaborators={collaboratorDetails}
              currentUserId={currentUser?.uid}
            />
          )}
        </div>
      </div>

      {/* Recipes grid */}
      <RecipeList
        recipes={filteredRecipes}
        dishListId={id}
        userRole={userRole}
        currentUserId={currentUser?.uid}
        emptyStateContent={
          searchTerm ? (
            <div className={styles.emptyState}>
              <h3>No recipes found</h3>
              <p>No recipes match your search. Try a different term.</p>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3>No recipes found</h3>
              <p>This dishlist doesn't have any recipes yet.</p>
              {(userIsOwner || userIsCollaborator) && (
                <button
                  className={styles.primaryButton}
                  onClick={() => navigate(`/add-recipe?dishListId=${id}`)}
                >
                  Add First Recipe
                </button>
              )}
            </div>
          )
        }
      />

      {/* Search modal for inviting collaborators */}
      {searchModalOpen && (
        <SearchUserModal
          onClose={() => setSearchModalOpen(false)}
          onSelect={handleInviteCollaborator}
          currentCollaborators={dishlist.collaborators}
          ownerId={dishlist.userId}
        />
      )}
    </div>
  );
};

export default DishListDetailPage;