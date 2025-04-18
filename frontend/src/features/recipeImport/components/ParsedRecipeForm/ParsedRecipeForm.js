import React from "react";
import TimeServingsInput from "../../../recipe/components/TimeServingsInput/TimeServingsInput";
import IngredientInput from "../../../recipe/components/IngredientInput/IngredientInput";
import InstructionSteps from "../../../recipe/components/InstructionSteps/InstructionSteps";
import TagInput from "../../../recipe/components/TagInput/TagInput";
import NutritionCalculator from "../../../recipe/components/CalculateNutrition/NutritionCalculator";
import {
  RecipeFormProvider,
  useRecipeForm,
} from "../../../../contexts/RecipeFormContext";
import styles from "./ParsedRecipeForm.module.css";

const ParsedRecipeForm = ({
  parsedRecipe,
  dishListId,
  onSave,
  onCancel,
  loading,
}) => {
  // Create the child component that will use the RecipeFormContext
  const ParsedRecipeFormContent = () => {
    const {
      title,
      setTitle,
      ingredients,
      setIngredients,
      instructions,
      setInstructions,
      prepTime,
      setPrepTime,
      cookTime,
      setCookTime,
      servings,
      setServings,
      tags,
      setTags,
      setSelectedDishList,
      errors,
      validateForm,
    } = useRecipeForm();

    // Log parsed recipe for debugging
    console.log("Parsed Recipe:", parsedRecipe);

    // Initialize form with parsed recipe data
    React.useEffect(() => {
      // Set basic fields
      setTitle(parsedRecipe?.title || "");
      setPrepTime(parsedRecipe?.prepTime || "");
      setCookTime(parsedRecipe?.cookTime || "");
      setServings(parsedRecipe?.servings || "");

      // Set selected dishlist
      if (dishListId) {
        setSelectedDishList(dishListId);
      }

      // Format and set ingredients
      if (parsedRecipe?.ingredients) {
        if (
          parsedRecipe.ingredients.length > 0 &&
          typeof parsedRecipe.ingredients[0] === "object" &&
          "name" in parsedRecipe.ingredients[0]
        ) {
          // Ensure all ingredients have the required fields
          const formattedIngredients = parsedRecipe.ingredients.map((ing) => ({
            name: ing.name || "",
            amount: ing.amount || "",
            unit: ing.unit || "",
          }));
          setIngredients(formattedIngredients);
        } else if (
          Array.isArray(parsedRecipe.ingredients) &&
          typeof parsedRecipe.ingredients[0] === "string"
        ) {
          // Convert string ingredients to objects
          const formattedIngredients = parsedRecipe.ingredients.map((ing) => ({
            name: ing,
            amount: "",
            unit: "",
          }));
          setIngredients(formattedIngredients);
        }
      } else {
        // Default empty ingredient
        setIngredients([{ name: "", amount: "", unit: "" }]);
      }

      // Set instructions
      if (parsedRecipe?.instructions && parsedRecipe.instructions.length > 0) {
        setInstructions(parsedRecipe.instructions);
      } else {
        // Default empty instruction
        setInstructions([""]);
      }

      // Set tags if available
      if (parsedRecipe?.tags && parsedRecipe.tags.length > 0) {
        setTags(parsedRecipe.tags);
      } else {
        setTags([]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle form submission
    const handleSubmit = (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      // Filter out empty ingredients and instructions
      const filteredIngredients = ingredients.filter(
        (ing) => ing.name.trim() !== ""
      );
      const filteredInstructions = instructions.filter(
        (inst) => inst.trim() !== ""
      );

      const recipeData = {
        title,
        ingredients: filteredIngredients,
        instructions: filteredInstructions,
        prepTime,
        cookTime,
        servings,
        tags,
        nutrition: parsedRecipe?.nutrition,
      };

      onSave(recipeData);
    };

    return (
      <form className={styles.parsedRecipeForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <h3>Recipe Title</h3>
          <input
            id="recipe-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter recipe title"
            className={errors.title ? styles.inputError : ""}
          />
          {errors.title && (
            <p className={styles.errorMessage}>{errors.title}</p>
          )}
        </div>

        <TimeServingsInput />
        <IngredientInput />
        <InstructionSteps />
        <TagInput />

        {parsedRecipe?.nutrition ? (
          <div className={styles.nutritionSection}>
            <h3 className={styles.sectionTitle}>Nutrition Information</h3>
            <div className={styles.nutritionFacts}>
              <div className={styles.nutritionRow}>
                <span className={styles.nutritionLabel}>Calories:</span>
                <span className={styles.nutritionValue}>
                  {parsedRecipe.nutrition.calories}
                </span>
              </div>
              {parsedRecipe.nutrition.protein && (
                <div className={styles.nutritionRow}>
                  <span className={styles.nutritionLabel}>Protein:</span>
                  <span className={styles.nutritionValue}>
                    {parsedRecipe.nutrition.protein}g
                  </span>
                </div>
              )}
              {parsedRecipe.nutrition.carbs && (
                <div className={styles.nutritionRow}>
                  <span className={styles.nutritionLabel}>Carbohydrates:</span>
                  <span className={styles.nutritionValue}>
                    {parsedRecipe.nutrition.carbs}g
                  </span>
                </div>
              )}
              {parsedRecipe.nutrition.fat && (
                <div className={styles.nutritionRow}>
                  <span className={styles.nutritionLabel}>Fat:</span>
                  <span className={styles.nutritionValue}>
                    {parsedRecipe.nutrition.fat}g
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <NutritionCalculator />
        )}

        <div className={styles.formAction}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelBtn}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? "Saving..." : "Save Recipe"}
          </button>
        </div>
      </form>
    );
  };

  return (
    <RecipeFormProvider>
      <ParsedRecipeFormContent />
    </RecipeFormProvider>
  );
};

export default ParsedRecipeForm;
