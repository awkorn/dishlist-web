import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_DISHLIST_DETAIL,
  GET_DISHLIST_RECIPES,
} from "../../../graphql/queries/dishListDetail";
import {
  REMOVE_RECIPE_FROM_DISHLIST,
  LEAVE_COLLABORATION,
  INVITE_COLLABORATOR,
  UPDATE_VISIBILITY,
} from "../../../graphql/mutations/dishListDetail";
import { useAuth } from "../../../contexts/AuthProvider";
import TopNav from "../../../components/layout/TopNav/TopNav";
import RecipeCard from "../components/RecipeCard/RecipeCard";
import { toast } from "react-toastify";
import SearchUserModal from "../components/SearchUserModal/SearchUserModal";
import VisibilitySelector from "../components/VisibilitySelector/VisibilitySelector";
import CollaboratorsList from "../components/CollaboratorList/CollaboratorList";
import "./DishListDetailPage.css";

const DishListDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch dishlist details
  const {
    loading: dishlistLoading,
    error: dishlistError,
    data: dishlistData,
    refetch: refetchDishlist,
  } = useQuery(GET_DISHLIST_DETAIL, {
    variables: { id, userId: currentUser?.uid },
    skip: !currentUser?.uid,
  });

  // Fetch recipes in this dishlist
  const {
    loading: recipesLoading,
    error: recipesError,
    data: recipesData,
    refetch: refetchRecipes,
  } = useQuery(GET_DISHLIST_RECIPES, {
    variables: { dishListId: id, userId: currentUser?.uid },
    skip: !currentUser?.uid,
  });

  // Mutations
  const [removeRecipe] = useMutation(REMOVE_RECIPE_FROM_DISHLIST);
  const [leaveCollaboration] = useMutation(LEAVE_COLLABORATION);
  const [inviteCollaborator] = useMutation(INVITE_COLLABORATOR);
  const [updateVisibility] = useMutation(UPDATE_VISIBILITY);

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
      const filtered = recipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(recipes);
    }
  }, [searchTerm, recipes]);

  // Handle removing a recipe from the dishlist
  const handleRemoveRecipe = async (recipeId) => {
    try {
      await removeRecipe({
        variables: {
          recipeId,
          dishListId: id,
          userId: currentUser?.uid,
        },
      });

      // Update local state to remove the recipe
      setRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));
      toast.success("Recipe removed from dishlist");
    } catch (error) {
      toast.error("Failed to remove recipe: " + error.message);
    }
  };

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

  // Loading state
  if (dishlistLoading || recipesLoading) {
    return (
      <div className="dishlist-detail-container">
        <TopNav />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dishlist...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dishlistError || recipesError) {
    return (
      <div className="dishlist-detail-container">
        <TopNav />
        <div className="error-container">
          <h2>Error</h2>
          <p>{dishlistError?.message || recipesError?.message}</p>
          <button
            className="primary-button"
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
      <div className="dishlist-detail-container">
        <TopNav />
        <div className="error-container">
          <h2>Dishlist Not Found</h2>
          <p>
            The dishlist you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <button
            className="primary-button"
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

  return (
    <div className="dishlist-detail-container">
      <TopNav
        pageType="recipes"
        items={recipes}
        onSearch={(term) => setSearchTerm(term)}
      />

      <div className="dishlist-header">
        <div className="dishlist-title-section">
          <h1 className="dishlist-title">{dishlist.title}</h1>
          {dishlist.description && (
            <p className="dishlist-description">{dishlist.description}</p>
          )}

          <div className="dishlist-meta">
            <span className="dishlist-visibility">
              <i className={`visibility-icon ${dishlist.visibility}`}></i>
              {dishlist.visibility === "public"
                ? "Public"
                : dishlist.visibility === "private"
                ? "Private"
                : "Shared"}
            </span>

            <span className="recipe-count">
              {filteredRecipes.length}{" "}
              {filteredRecipes.length === 1 ? "recipe" : "recipes"}
            </span>
          </div>
        </div>

        <div className="dishlist-actions">
          {/* Owner-only actions */}
          {userIsOwner && (
            <>
              <VisibilitySelector
                currentVisibility={dishlist.visibility}
                onChange={handleVisibilityChange}
              />

              <button
                className="action-button invite-button"
                onClick={() => setSearchModalOpen(true)}
              >
                Invite Collaborator
              </button>

              <button
                className="action-button edit-button"
                onClick={() => navigate(`/edit-dishlist/${id}`)}
              >
                Edit DishList
              </button>
            </>
          )}

          {/* Collaborator-only actions */}
          {userIsCollaborator && !userIsOwner && (
            <button
              className="action-button leave-button"
              onClick={handleLeaveCollaboration}
            >
              Leave Collaboration
            </button>
          )}

          {/* Add recipe button (for owners and collaborators) */}
          {(userIsOwner || userIsCollaborator) && (
            <button
              className="action-button add-recipe-button"
              onClick={() => navigate(`/add-recipe?dishListId=${id}`)}
            >
              Add Recipe
            </button>
          )}
        </div>
      </div>

      {/* Collaborators section (visible to owner only) */}
      {userIsOwner && dishlist.collaborators.length > 0 && (
        <CollaboratorsList
          collaborators={dishlist.collaborators}
          dishListId={id}
          onRefetch={refetchDishlist}
        />
      )}

      {/* Recipes grid */}
      <div className="recipes-container">
        {filteredRecipes.length > 0 ? (
          <div className="recipes-grid">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                canRemove={
                  userIsOwner ||
                  (userIsCollaborator && recipe.creatorId === currentUser?.uid)
                }
                onRemove={() => handleRemoveRecipe(recipe.id)}
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No recipes found</h3>
            {searchTerm ? (
              <p>No recipes match your search. Try a different term.</p>
            ) : (
              <p>This dishlist doesn't have any recipes yet.</p>
            )}
            {(userIsOwner || userIsCollaborator) && (
              <button
                className="primary-button"
                onClick={() => navigate(`/add-recipe?dishListId=${id}`)}
              >
                Add First Recipe
              </button>
            )}
          </div>
        )}
      </div>

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
