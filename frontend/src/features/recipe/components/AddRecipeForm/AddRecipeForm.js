import React, { useState, useEffect } from "react";
import { useRecipeForm } from "../../../../contexts/RecipeFormContext";
import { useLocation } from "react-router-dom";
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
  dishListParam 
}) => {
  const { 
    title, 
    setTitle, 
    handleSubmit, 
    resetForm, 
    errors, 
    selectedDishList,
    setIngredients,
    setInstructions,
    setTags,
    setCookTime,
    setPrepTime,
    setServings,
    setImage,
    setSelectedDishList
  } = useRecipeForm();

  const location = useLocation();
  const [dishListFromUrl, setDishListFromUrl] = useState(null);

  // Extract dishListId from URL query parameters if present
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const dishListId = queryParams.get("dishListId");
    if (dishListId) {
      setDishListFromUrl(dishListId);
    }
  }, [location]);

  // Populate form with existing recipe data if in edit mode
  useEffect(() => {
    if (isEditMode && recipeData) {
      setTitle(recipeData.title);
      setIngredients(recipeData.ingredients);
      setInstructions(recipeData.instructions);
      setTags(recipeData.tags || []);
      setCookTime(recipeData.cookTime);
      setPrepTime(recipeData.prepTime);
      setServings(recipeData.servings);
      
      if (recipeData.image) {
        setImage({ url: recipeData.image });
      }
      
      // If the recipe is in any dishlists, use the first one as the selected dishlist
      if (recipeData.dishLists && recipeData.dishLists.length > 0) {
        setSelectedDishList(recipeData.dishLists[0]);
      }
    }
  }, [isEditMode, recipeData, setTitle, setIngredients, setInstructions, setTags, 
      setCookTime, setPrepTime, setServings, setImage, setSelectedDishList]);

  const onSubmit = (e) => {
    handleSubmit(e, (formData) => {
      createRecipe({
        variables: isEditMode 
          ? { 
              id: recipeData.id,
              userId: userId,
              ...formData
            }
          : { 
              creatorId: userId,
              ...formData
            }
      });
    });
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
            className={errors.title ? styles.inputError : ""}
          />
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
            {loading ? "Saving..." : isEditMode ? "Update Recipe" : "Save Recipe"}
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