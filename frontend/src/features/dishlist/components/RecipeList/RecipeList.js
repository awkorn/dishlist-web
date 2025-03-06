import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { REMOVE_RECIPE_FROM_DISHLIST } from "../../../../graphql/mutations/dishListDetail";
import RecipeCard from "../RecipeCard/RecipeCard";
import "./RecipeList.css";

const RecipeList = ({ recipes, dishListId, userRole, currentUserId }) => {
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);
  
  const [removeRecipe, { loading: removeLoading }] = useMutation(REMOVE_RECIPE_FROM_DISHLIST, {
    onCompleted: () => {
      toast.success("Recipe removed from DishList");
    },
    onError: (error) => {
      toast.error(`Error removing recipe: ${error.message}`);
    },
    update: (cache, { data }) => {
      // Update the cache to remove the recipe from the list
      const removedRecipeId = data.removeRecipeFromDishList.id;
      cache.modify({
        fields: {
          getDishListRecipes: (existingRecipes = [], { readField }) => {
            return existingRecipes.filter(
              recipeRef => readField('id', recipeRef) !== removedRecipeId
            );
          }
        }
      });
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
  
  const handleRecipeClick = (recipeId) => {
    if (expandedRecipeId === recipeId) {
      setExpandedRecipeId(null); // Collapse if already expanded
    } else {
      setExpandedRecipeId(recipeId); // Expand the clicked recipe
    }
  };
  
  const canRemoveRecipes = userRole === "owner" || userRole === "collaborator";
  
  if (!recipes || recipes.length === 0) {
    return (
      <div className="recipe-list-container">
        <div className="recipe-list-header">
          <h2>Recipes</h2>
        </div>
        <div className="no-recipes">
          <p>No recipes found in this DishList.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="recipe-list-container">
      <div className="recipe-list-header">
        <h2>Recipes ({recipes.length})</h2>
      </div>
      
      <div className="recipe-list">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isExpanded={expandedRecipeId === recipe.id}
            onClick={() => handleRecipeClick(recipe.id)}
            onRemove={canRemoveRecipes ? () => handleRemoveRecipe(recipe.id) : null}
            isUserCreator={recipe.creatorId === currentUserId}
          />
        ))}
      </div>
    </div>
  );
};

export default RecipeList;