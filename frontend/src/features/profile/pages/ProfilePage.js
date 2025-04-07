import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_USER_PROFILE } from "../../../graphql/queries/userProfile";
import { useAuth } from "../../../contexts/AuthProvider";
import TopNav from "../../../components/layout/TopNav/TopNav";
import ProfileHeader from "../components/ProfileHeader/ProfileHeader";
import ProfileTabs from "../components/ProfileTabs/ProfileTabs";
import ProfileDishListGrid from "../components/ProfileDishListGrid/ProfileDishListGrid";
import RecipeList from "../../dishlist/components/RecipeList/RecipeList";
import styles from "./ProfilePage.module.css";

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("dishlists");

  // Fetch user profile data with the viewer's ID for proper visibility filtering
  const { loading, error, data, refetch } = useQuery(GET_USER_PROFILE, {
    variables: {
      userId,
      viewerId: currentUser?.uid || "",
    },
    skip: !userId || !currentUser?.uid,
    fetchPolicy: "cache-and-network",
  });

  // Redirect if trying to access profile without being logged in
  useEffect(() => {
    if (!currentUser) {
      navigate("/signin");
    }
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <TopNav />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <TopNav />
        <div className={styles.errorContainer}>
          <h2>Error</h2>
          <p>{error.message}</p>
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

  if (!data?.getUserProfile) {
    return (
      <div className={styles.pageContainer}>
        <TopNav />
        <div className={styles.errorContainer}>
          <h2>User Not Found</h2>
          <p>The user profile you're looking for doesn't exist.</p>
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

  const user = data.getUserProfile;
  const isCurrentUser = currentUser?.uid === user.firebaseUid;

  return (
    <div className={styles.pageContainer}>
      <TopNav />

      <div className={styles.profileContainer}>
        <ProfileHeader
          user={user}
          isCurrentUser={isCurrentUser}
          dishListsCount={user.dishListCount}
          recipesCount={user.recipeCount}
          refetchProfile={refetch}
        />

        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className={styles.contentContainer}>
          {activeTab === "dishlists" ? (
            <div className={styles.dishListsContainer}>
              {user.visibleDishLists && user.visibleDishLists.length > 0 ? (
                <ProfileDishListGrid
                  dishLists={user.visibleDishLists}
                  currentUserId={currentUser?.uid}
                />
              ) : (
                <div className={styles.emptyState}>
                  <h3>No DishLists to display</h3>
                  <p>
                    {isCurrentUser
                      ? "You haven't created any visible DishLists yet."
                      : "This user hasn't shared any DishLists you can access."}
                  </p>
                  {isCurrentUser && (
                    <button
                      className={styles.createButton}
                      onClick={() => navigate("/create-dishlist")}
                    >
                      Create a DishList
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.recipesContainer}>
              {user.visibleRecipes && user.visibleRecipes.length > 0 ? (
                <div className={styles.recipeGridWrapper}>
                  <RecipeList
                    recipes={user.visibleRecipes}
                    currentUserId={currentUser?.uid}
                    dishListId={null} 
                    emptyStateContent={null}
                  />
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <h3>No Recipes to display</h3>
                  <p>
                    {isCurrentUser
                      ? "You haven't created any recipes yet."
                      : "This user hasn't shared any recipes you can access."}
                  </p>
                  {isCurrentUser && (
                    <button
                      className={styles.createButton}
                      onClick={() => navigate("/add-recipe")}
                    >
                      Create a Recipe
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;