import React from "react";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthProvider";
import { CREATE_RECIPE } from "../../../graphql/mutations/recipe";
import { GET_DISHLIST_RECIPES } from "../../../graphql/queries/dishListDetail";
import TopNav from "../../../components/layout/TopNav/TopNav";
import AddRecipeForm from "../components/AddRecipeForm/AddRecipeForm";
import { RecipeFormProvider } from "../../../contexts/RecipeFormContext";
import styles from "./AddRecipePage.module.css";

const AddRecipePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract dishListId from URL query if present
  const queryParams = new URLSearchParams(location.search);
  const dishListId = queryParams.get("dishListId");

  const [createRecipe, { loading }] = useMutation(CREATE_RECIPE, {
    onCompleted: (data) => {
      toast.success("Recipe created successfully!");
      
      // Navigate to the dishlist page that was specified in the URL query or default
      if (dishListId) {
        navigate(`/dishlist/${dishListId}`);
      } else if (data.createRecipe.dishLists && data.createRecipe.dishLists.length > 0) {
        navigate(`/dishlist/${data.createRecipe.dishLists[0]}`);
      } else {
        navigate(`/dishlists`);
      }
    },
    onError: (error) => {
      toast.error(`Error creating recipe: ${error.message}`);
    },
    update: (cache, { data: { createRecipe } }) => {
      // Only update cache if we have a dishListId
      if (dishListId) {
        try {
          // Try to read existing recipes from cache
          const existingData = cache.readQuery({
            query: GET_DISHLIST_RECIPES,
            variables: { 
              dishListId, 
              userId: currentUser?.uid 
            }
          });

          // If we have existing data, update the cache with the new recipe
          if (existingData) {
            cache.writeQuery({
              query: GET_DISHLIST_RECIPES,
              variables: { 
                dishListId, 
                userId: currentUser?.uid 
              },
              data: {
                getDishListRecipes: [
                  createRecipe,
                  ...existingData.getDishListRecipes
                ]
              }
            });
          }
        } catch (e) {
          console.log("Cache update error or first recipe in this DishList:", e);
        }
      }
    }
  });

  if (!currentUser) {
    return (
      <div className={styles.pageContainer}>
        <TopNav />
        <div className={styles.unauthorizedMessage}>
          <h2>Please sign in to create recipes</h2>
          <button 
            onClick={() => navigate("/signin")} 
            className={styles.primaryButton}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <TopNav pageType="recipe-builder" />
      <div className={styles.addRecipeContainer}>
        <RecipeFormProvider>
          <AddRecipeForm 
            createRecipe={createRecipe} 
            loading={loading} 
            userId={currentUser.uid} 
            dishListParam={dishListId}
          />
        </RecipeFormProvider>
      </div>
    </div>
  );
};

export default AddRecipePage;