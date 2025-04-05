import React, { useState, useEffect } from "react";
import { useRecipeForm } from "../../../../contexts/RecipeFormContext";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import IngredientInput from "../IngredientInput/IngredientInput";
import InstructionSteps from "../InstructionSteps/InstructionSteps";
import TimeServingsInput from "../TimeServingsInput/TimeServingsInput";
import DishListSelector from "../DishListSelector/DishListSelector";
import NutritionCalculator from "../CalculateNutrition/NutritionCalculator";
import TagInput from "../TagInput/TagInput";
import ImageUpload from "../ImageUpload/ImageUpload";
import styles from "./AddRecipeForm.module.css";

const AddRecipeForm = ({
  createRecipe,
  loading,
  userId,
  isEditMode = false,
  recipeData,
  dishListParam,
}) => {
  const {
    title,
    setTitle,
    ingredients,
    instructions,
    servings,
    cookTime,
    prepTime,
    tags,
    image,
    resetForm,
    errors,
    setIngredients,
    setInstructions,
    setTags,
    setCookTime,
    setPrepTime,
    setServings,
    setImage,
    setSelectedDishList,
    validateForm,
  } = useRecipeForm();

  const location = useLocation();
  const [dishListFromUrl, setDishListFromUrl] = useState(null);

  // Extract dishListId from URL query parameters if present
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const dishListId = queryParams.get("dishListId");
    if (dishListId) {
      setDishListFromUrl(dishListId);
      setSelectedDishList(dishListId);
    }
  }, [location, setSelectedDishList]);

  // Populate form with existing recipe data if in edit mode
  useEffect(() => {
    if (isEditMode && recipeData) {
      setTitle(recipeData.title || "");
      setIngredients(
        recipeData.ingredients || [{ name: "", amount: "", unit: "" }]
      );
      setInstructions(recipeData.instructions || [""]);
      setTags(recipeData.tags || []);
      setCookTime(recipeData.cookTime || "");
      setPrepTime(recipeData.prepTime || "");
      setServings(recipeData.servings || "");

      if (recipeData.image) {
        setImage(recipeData.image);
      }

      // If the recipe is in any dishlists, use the first one as the selected dishlist
      if (recipeData.dishLists && recipeData.dishLists.length > 0) {
        setSelectedDishList(recipeData.dishLists[0]);
      }
    }
  }, [
    isEditMode,
    recipeData,
    setTitle,
    setIngredients,
    setInstructions,
    setTags,
    setCookTime,
    setPrepTime,
    setServings,
    setImage,
    setSelectedDishList,
  ]);

  const onSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Filter out empty ingredients and instructions
    const filteredIngredients = ingredients
      .filter((ing) => ing.name.trim() !== "")
      .map((ing) => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
      }));

    const filteredInstructions = instructions.filter(
      (inst) => inst.trim() !== ""
    );

    // Format image data for GraphQL mutation
    let imageInput = null;
    if (image) {
      if (typeof image === "object" && image.url) {
        imageInput = {
          url: image.url,
          rotation: image.rotation || 0,
        };
      } else if (typeof image === "string") {
        //handle legacy format
        imageInput = {
          url: image,
          rotation: 0,
        };
      }
    }

    try {
      if (isEditMode) {
        // Update existing recipe
        createRecipe({
          variables: {
            id: recipeData.id,
            userId: userId,
            title,
            ingredients: filteredIngredients,
            instructions: filteredInstructions,
            cookTime: cookTime ? parseInt(cookTime) : null,
            prepTime: prepTime ? parseInt(prepTime) : null,
            servings: servings ? parseInt(servings) : null,
            tags,
            image: imageInput,
          },
        });
      } else {
        // Create new recipe
        const variables = {
          creatorId: userId,
          title,
          ingredients: filteredIngredients,
          instructions: filteredInstructions,
          cookTime: cookTime ? parseInt(cookTime) : null,
          prepTime: prepTime ? parseInt(prepTime) : null,
          servings: servings ? parseInt(servings) : null,
          tags,
          image: imageInput,
        };

        // If dishListParam exists from URL, use that
        if (dishListParam) {
          variables.dishListId = dishListParam;
        }

        createRecipe({ variables });
      }
    } catch (error) {
      toast.error(
        `Error ${isEditMode ? "updating" : "creating"} recipe: ${error.message}`
      );
    }
  };

  return (
    <form className={styles.addRecipeForm} onSubmit={onSubmit}>
      <div className={styles.titleSection}>
        <div className={styles.formGroup}>
          <label htmlFor="recipe-title">Recipe Title</label>
          <input
            id="recipe-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter recipe title"
            maxLength={50}
            className={errors.title ? styles.inputError : ""}
          />
          {errors.title && (
            <p className={styles.errorMessage}>{errors.title}</p>
          )}
        </div>

        <TimeServingsInput />

        <ImageUpload />

        <IngredientInput />

        <NutritionCalculator />

        <InstructionSteps />

        <TagInput />

        {!isEditMode && (
          <DishListSelector
            currentUserId={userId}
            dishListParam={dishListFromUrl || dishListParam}
          />
        )}

        {/* Form Submission */}
        <div className={styles.formAction}>
          <button
            type="button"
            onClick={resetForm}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading
              ? "Saving..."
              : isEditMode
              ? "Update Recipe"
              : "Save Recipe"}
          </button>
        </div>

        {errors.submit && (
          <div className={styles.submitError}>
            <p>{errors.submit}</p>
          </div>
        )}
      </div>
    </form>
  );
};

export default AddRecipeForm;
