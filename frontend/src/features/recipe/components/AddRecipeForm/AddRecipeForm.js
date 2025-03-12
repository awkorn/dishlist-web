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

const AddRecipeForm = ({ createRecipe, loading, userId }) => {
  const { title, setTitle, handleSubmit, resetForm, errors } = useRecipeForm();

  const location = useLocation();
  const [dishListParam, setDishListParam] = useState(null);

  // Extract dishListId from URL query parameters if present
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const dishListId = queryParams.get("dishListId");
    if (dishListId) {
      setDishListParam(dishListId);
    }
  }, [location]);

  const onSubmit = (e) => {
    handleSubmit(e, (variables) => {
      createRecipe({ variables: { ...variables, creatorId: userId } });
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

        <DishListSelector
          currentUserId={userId}
          dishListParam={dishListParam}
        />

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
            {loading ? "Saving..." : "Save Recipe"}
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