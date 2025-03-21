import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { GET_RECIPE } from "../../../graphql/queries/recipe";
import { SAVE_RECIPE, UNSAVE_RECIPE } from "../../../graphql/mutations/recipe";
import { useAuth } from "../../../contexts/AuthProvider";
import { ArrowLeft } from "lucide-react";
import TopNav from "../../../components/layout/TopNav/TopNav";
import RecipeHeader from "../components/RecipeHeader/RecipeHeader";
import RecipeIngredients from "../components/RecipeIngredients/RecipeIngredients";
import RecipeInstructions from "../components/RecipeInstructions/RecipeInstructions";
import RecipeActions from "../components/RecipeActions/RecipeActions";
import RecipeTags from "../components/RecipeTags/RecipeTags";
import NutritionInfo from "../components/NutritionInfo/NutritionInfo";
import AddToDishListButton from "../components/AddToDishListButton/AddToDishListButton";
import RecipeGallery from "../components/RecipeGallery/RecipeGallery";
import styles from "./RecipeDetailPage.module.css";

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, hasSavedRecipe, refreshUserData } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  const [referringDishListId, setReferringDishListId] = useState(null);

  useEffect(() => {
    // Extract dishListId from query parameters
    const queryParams = new URLSearchParams(location.search);
    const dishListId = queryParams.get("from");
    if (dishListId) {
      setReferringDishListId(dishListId);
    }
  }, [location]);

  // Fetch recipe details
  const { loading, error, data } = useQuery(GET_RECIPE, {
    variables: { id, userId: currentUser?.uid },
    skip: !currentUser?.uid,
    fetchPolicy: "cache-and-network",
  });

  // Save/unsave mutations
  const [saveRecipe] = useMutation(SAVE_RECIPE, {
    onCompleted: () => {
      toast.success("Recipe saved to your favorites");
      refreshUserData();
      setIsSaved(true);
    },
    onError: (error) => {
      toast.error(`Error saving recipe: ${error.message}`);
    },
  });

  const [unsaveRecipe] = useMutation(UNSAVE_RECIPE, {
    onCompleted: () => {
      toast.success("Recipe removed from your favorites");
      refreshUserData();
      setIsSaved(false);
    },
    onError: (error) => {
      toast.error(`Error removing recipe: ${error.message}`);
    },
  });

  // Check if recipe is saved
  useEffect(() => {
    if (currentUser && id) {
      setIsSaved(hasSavedRecipe(id));
    }
  }, [currentUser, id, hasSavedRecipe]);

  // Handle saving/unsaving recipe
  const handleSaveToggle = () => {
    if (isSaved) {
      unsaveRecipe({
        variables: {
          userId: currentUser.uid,
          recipeId: id,
        },
      });
    } else {
      saveRecipe({
        variables: {
          userId: currentUser.uid,
          recipeId: id,
        },
      });
    }
  };

  const handleBackClick = () => {
    if (referringDishListId) {
      navigate(`/dishlist/${referringDishListId}`);
    } else {
      // If no referring dishlist, check if the recipe exists in any dishlists
      if (data?.getRecipe?.dishLists?.length > 0) {
        navigate(`/dishlist/${data.getRecipe.dishLists[0]}`);
      } else {
        navigate("/dishlists");
      }
    }
  };

  if (!currentUser) {
    return (
      <div className={styles.pageContainer}>
        <TopNav />
        <div className={styles.unauthorizedMessage}>
          <h2>Please sign in to view recipes</h2>
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

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <TopNav />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading recipe...</p>
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

  const recipe = data?.getRecipe;

  if (!recipe) {
    return (
      <div className={styles.pageContainer}>
        <TopNav />
        <div className={styles.errorContainer}>
          <h2>Recipe Not Found</h2>
          <p>
            The recipe you're looking for doesn't exist or you don't have
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

  const isCreator = recipe.creatorId === currentUser.uid;

  return (
    <div className={styles.pageContainer}>
      <TopNav />

      <div className={styles.recipeContainer}>
        <button className={styles.backButton} onClick={handleBackClick}>
          <ArrowLeft size={18} /> Back to DishList
        </button>

        <RecipeHeader
          title={recipe.title}
          image={recipe.image}
          cookTime={recipe.cookTime}
          prepTime={recipe.prepTime}
          servings={recipe.servings}
          createdAt={recipe.createdAt}
        />

        <div className={styles.recipeActionsBar}>
          <RecipeActions
            isCreator={isCreator}
            isSaved={isSaved}
            onSaveToggle={handleSaveToggle}
            onEdit={() => navigate(`/add-recipe?edit=true&recipeId=${id}`)}
          />

          <AddToDishListButton recipeId={id} currentUserId={currentUser.uid} />
        </div>

        <div className={styles.recipeContent}>
          <div className={styles.mainContent}>
            <RecipeIngredients
              ingredients={recipe.ingredients}
              servings={recipe.servings}
            />
            <RecipeInstructions instructions={recipe.instructions} />
            <RecipeGallery images={recipe.image ? [recipe.image] : []} />
          </div>

          <div className={styles.sideContent}>
            {recipe.tags && recipe.tags.length > 0 && (
              <RecipeTags tags={recipe.tags} />
            )}

            <NutritionInfo
              ingredients={recipe.ingredients}
              servings={recipe.servings}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
