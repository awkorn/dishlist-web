import React from "react";
import { useRecipeForm } from "../../../contexts/RecipeFormContext";
import IngredientInput from "../IngredientInput/IngredientInput";
import InstructionSteps from "../InstructionSteps/InstructionSteps"
import TagInput from "../TagInput/TagInput"
import "./AddRecipeForm.css";

const AddRecipeForm = ({ createRecipe, loading, userId }) => {
  const {
    title,
    setTitle,
    servings,
    setServings,
    prepTime,
    setPrepTime,
    cookTime,
    setCookTime,
    ingredients,
    handleSubmit,
    resetForm,
    errors,
  } = useRecipeForm();

  const onSubmit = (e) => {
    const success = handleSubmit(e, (variables) => {
      createRecipe({ variables: { ...variables, creatorId: userId } });
    });
  };

  return (
    <form className="add-recipe-form" onSubmit={onSubmit}>
      {/* Title Section */}
      <div className="title-section">
        <div className="form-group">
          <label htmlFor="recipe-title">Recipe Title</label>
          <input
            id="recipe-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter recipe title"
            className={errors.title ? "input-error" : ""}
          />
        </div>

        {/* Time and Serving Inputs */}

        {/* Image Upload Component */}

        {/* Ingredient Input Component */}
        <IngredientInput />

        {/* Calculate Nutrition Component */}

        {/* Instruction Steps Component */}
        <InstructionSteps />

        {/* Tag Input Component */}
        <TagInput />

        {/* DishList Selector Component */}

        {/* Form Submission */}
        <div className="form-action">
          <button type="button" onClick={resetForm} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Saving..." : "Save Recipe"}
          </button>
        </div>

        {errors.submit && (
          <div className="submit-error">
            <p>{errors.submit}</p>
          </div>
        )}
      </div>
    </form>
  );
};

export default AddRecipeForm;
