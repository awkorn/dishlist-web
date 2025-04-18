import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { CREATE_RECIPE } from "../../../graphql/mutations/recipe";
import { GET_DISHLIST_RECIPES } from "../../../graphql/queries/dishListDetail";
import { useAuth } from "../../../contexts/AuthProvider"; 
import TopNav from "../../../components/layout/TopNav/TopNav";
import ParsedRecipeForm from "../components/ParsedRecipeForm/ParsedRecipeForm";
import styles from "./ReviewImportedRecipePage.module.css";

const ReviewImportedRecipePage = () => {
  const { id: dishListId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth(); 
  const [parsedRecipe, setParsedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get the parsed recipe from the location state
  useEffect(() => {
    if (location.state?.parsedRecipe) {
      setParsedRecipe(location.state.parsedRecipe);
    } else {
      // If there's no parsed recipe, redirect back to import page
      toast.error("No recipe data found. Please try importing again.");
      navigate(`/import-recipe/${dishListId}`);
    }
  }, [location.state, dishListId, navigate]);

  // Create recipe mutation
  const [createRecipe] = useMutation(CREATE_RECIPE, {
    onCompleted: (data) => {
      toast.success("Recipe imported successfully!");
      navigate(`/dishlist/${dishListId}`);
    },
    onError: (error) => {
      toast.error(`Error importing recipe: ${error.message}`);
    },
    update: (cache, { data: { createRecipe } }) => {
      try {
        // Try to read existing recipes from cache
        const existingData = cache.readQuery({
          query: GET_DISHLIST_RECIPES,
          variables: {
            dishListId,
            userId: currentUser?.uid,
          },
        });

        // If we have existing data, update the cache with the new recipe
        if (existingData) {
          cache.writeQuery({
            query: GET_DISHLIST_RECIPES,
            variables: {
              dishListId,
              userId: currentUser?.uid,
            },
            data: {
              getDishListRecipes: [
                createRecipe,
                ...existingData.getDishListRecipes,
              ],
            },
          });
        }
      } catch (e) {
        console.log("Cache update error or first recipe in this DishList:", e);
      }
    },
  });

  const handleSaveRecipe = (recipeData) => {
    setLoading(true);

    // Make sure currentUser exists before proceeding
    if (!currentUser?.uid) {
      toast.error("You must be logged in to save recipes");
      setLoading(false);
      return;
    }

    try {
      // Process ingredients format
      const formattedIngredients = recipeData.ingredients.map((ing) => ({
        name: ing.name,
        amount: ing.amount || "",
        unit: ing.unit || "",
      }));

      // Create the recipe
      createRecipe({
        variables: {
          creatorId: currentUser.uid, 
          title: recipeData.title,
          ingredients: formattedIngredients,
          instructions: recipeData.instructions,
          cookTime: parseInt(recipeData.cookTime) || 0,
          prepTime: parseInt(recipeData.prepTime) || 0,
          servings: parseInt(recipeData.servings) || 0,
          tags: recipeData.tags || [],
          image: recipeData.image || null,
          dishListId: dishListId,
        },
      });
    } catch (error) {
      console.error("Error creating recipe:", error);
      toast.error("Failed to save recipe. Please try again.");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/dishlist/${dishListId}`);
  };

  // Ensure user is logged in
  if (!currentUser) {
    return (
      <div className={styles.pageContainer}>
        <TopNav />
        <div className={styles.unauthorizedMessage}>
          <h2>Please sign in to import recipes</h2>
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

  if (!parsedRecipe) {
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

  return (
    <div className={styles.pageContainer}>
      <TopNav />
      <div className={styles.reviewContainer}>
        <h1 className={styles.pageTitle}>Review Imported Recipe</h1>

        <ParsedRecipeForm
          parsedRecipe={parsedRecipe}
          dishListId={dishListId}
          onSave={handleSaveRecipe}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ReviewImportedRecipePage;
