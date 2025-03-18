// frontend/src/features/recipe/pages/AddRecipePage.js
import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthProvider";
import { CREATE_RECIPE, UPDATE_RECIPE } from "../../../graphql/mutations/recipe";
import { GET_RECIPE } from "../../../graphql/queries/recipe"; 
import { GET_DISHLIST_RECIPES } from "../../../graphql/queries/dishListDetail";
import TopNav from "../../../components/layout/TopNav/TopNav";
import AddRecipeForm from "../components/AddRecipeForm/AddRecipeForm";
import { RecipeFormProvider } from "../../../contexts/RecipeFormContext";
import styles from "./AddRecipePage.module.css";

const AddRecipePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query parameters to check if we're in edit mode
  const queryParams = new URLSearchParams(location.search);
  const isEditMode = queryParams.get("edit") === "true";
  const recipeId = queryParams.get("recipeId");
  const dishListId = queryParams.get("dishListId");

  // Fetch existing recipe data if in edit mode
  const { loading: recipeLoading, error: recipeError, data: recipeData } = useQuery(GET_RECIPE, {
    variables: { id: recipeId, userId: currentUser?.uid },
    skip: !isEditMode || !recipeId || !currentUser,
    fetchPolicy: "network-only"
  });

  const [createRecipe, { loading: createLoading }] = useMutation(CREATE_RECIPE, {
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

  // Add the update recipe mutation
  const [updateRecipe, { loading: updateLoading }] = useMutation(UPDATE_RECIPE, {
    onCompleted: () => {
      toast.success("Recipe updated successfully!");
      navigate(`/recipe/${recipeId}`);
    },
    onError: (error) => {
      toast.error(`Error updating recipe: ${error.message}`);
    }
  });

  const loading = createLoading || updateLoading || recipeLoading;

  if (!currentUser) {
    return (
      <div className={styles.pageContainer}>
        <TopNav />
        <div className={styles.unauthorizedMessage}>
          <h2>Please sign in to {isEditMode ? "edit" : "create"} recipes</h2>
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

  if (isEditMode && recipeLoading) {
    return (
      <div className={styles.pageContainer}>
        <TopNav />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading recipe data...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && recipeError) {
    return (
      <div className={styles.pageContainer}>
        <TopNav />
        <div className={styles.errorContainer}>
          <h2>Error</h2>
          <p>{recipeError.message}</p>
          <button 
            onClick={() => navigate("/dishlists")} 
            className={styles.primaryButton}
          >
            Back to DishLists
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
          <AddRecipeFormWrapper
            isEditMode={isEditMode}
            recipeData={recipeData?.getRecipe}
            dishListId={dishListId}
            recipeId={recipeId}
            createRecipe={createRecipe}
            updateRecipe={updateRecipe}
            loading={loading}
            userId={currentUser.uid}
          />
        </RecipeFormProvider>
      </div>
    </div>
  );
};

// Wrapper component to handle the recipe form context
const AddRecipeFormWrapper = ({
  isEditMode,
  recipeData,
  dishListId,
  recipeId,
  createRecipe,
  updateRecipe,
  loading,
  userId
}) => {
  // Pass the proper mutation based on mode
  const handleMutation = (variables) => {
    if (isEditMode) {
      return updateRecipe({
        variables: {
          id: recipeId,
          userId,
          ...variables
        }
      });
    } else {
      return createRecipe({
        variables: {
          creatorId: userId,
          ...variables
        }
      });
    }
  };

  return (
    <AddRecipeForm
      createRecipe={handleMutation}
      isEditMode={isEditMode}
      recipeData={recipeData}
      loading={loading}
      userId={userId}
      dishListParam={dishListId}
    />
  );
};

export default AddRecipePage;