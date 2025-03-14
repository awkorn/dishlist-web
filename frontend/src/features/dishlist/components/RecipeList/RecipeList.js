import React from "react";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { REMOVE_RECIPE_FROM_DISHLIST } from "../../../../graphql/mutations/dishListDetail";
import { GET_DISHLIST_RECIPES } from "../../../../graphql/queries/dishListDetail";
import RecipeCard from "../RecipeCard/RecipeCard";
import "./RecipeList.css";

const RecipeList = ({ 
  recipes, 
  dishListId, 
  userRole, 
  currentUserId, 
  onRecipeClick,
  emptyStateContent 
}) => {
  const [removeRecipe, { loading: removeLoading }] = useMutation(REMOVE_RECIPE_FROM_DISHLIST, {
    onCompleted: () => {
      toast.success("Recipe removed from DishList");
    },
    onError: (error) => {
      toast.error(`Error removing recipe: ${error.message}`);
    },
    update: (cache, { data: { removeRecipeFromDishList } }) => {
      try {
        const existingData = cache.readQuery({
          query: GET_DISHLIST_RECIPES,
          variables: { dishListId, userId: currentUserId }
        });
        
        if (existingData) {
          cache.writeQuery({
            query: GET_DISHLIST_RECIPES,
            variables: { dishListId, userId: currentUserId },
            data: {
              getDishListRecipes: existingData.getDishListRecipes.filter(
                recipe => recipe.id !== removeRecipeFromDishList.id
              )
            }
          });
        }
      } catch (e) {
        console.log("Cache update error:", e);
      }
    }
  });
  
  const handleRemoveRecipe = (recipeId) => {
    if (removeLoading) return;
    
    if (window.confirm("Are you sure you want to remove this recipe from the DishList?")) {
      removeRecipe({
        variables: {
          recipeId,
          dishListId,
          userId: currentUserId
        }
      });
    }
  };
  
  if (!recipes || recipes.length === 0) {
    return (
      <div className="recipes-container">
        {emptyStateContent || (
          <div className="empty-state">
            <h3>No recipes found</h3>
            <p>This dishlist doesn't have any recipes yet.</p>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="recipes-container">
      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            canRemove={
              userRole === "owner" ||
              (userRole === "collaborator" && recipe.creatorId === currentUserId)
            }
            onRemove={() => handleRemoveRecipe(recipe.id)}
            onClick={() => onRecipeClick && onRecipeClick(recipe.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default RecipeList;