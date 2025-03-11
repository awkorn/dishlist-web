import React from "react";
import { useRecipeForm } from "../../../../contexts/RecipeFormContext";
import styles from "./IngredientInput.module.css";

const IngredientInput = () => {
  const { ingredients, setIngredients, errors } = useRecipeForm();

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index, field, value) => {
    const updateIngredients = [...ingredients];
    updateIngredients[index][field] = value;
    setIngredients(updateIngredients);
  };

  return (
    <div className={styles.ingredientsSection}>
      <h3>Ingredients</h3>
      {errors.ingredients && (
        <p className={styles.errorMessage}>{errors.ingredients}</p>
      )}

      {ingredients.map((ingredient, index) => (
        <div key={index} className={styles.ingredientRow}>
          <input
            type="text"
            placeholder="Amount"
            value={ingredient.amount}
            onChange={(e) => updateIngredient(index, "amount", e.target.value)}
            className={styles.amountInput}
          />

          <select
            value={ingredient.unit}
            onChange={(e) => updateIngredient(index, "unit", e.target.value)}
            className={styles.unitInput}
          >
            <option value="">Unit</option>
            <option value="cup">cup</option>
            <option value="tbsp">tbsp</option>
            <option value="tsp">tsp</option>
            <option value="oz">oz</option>
            <option value="g">g</option>
            <option value="lb">lb</option>
            <option value="ml">ml</option>
          </select>

          <input
            type="text"
            placeholder="Ingredient"
            value={ingredient.name}
            onChange={(e) => updateIngredient(index, "name", e.target.value)}
            className={styles.ingredientInput}
          />

          <button
            type="button"
            onClick={() => removeIngredient(index)}
            className={styles.removeIngredientBtn}
            aria-label="Remove ingredient"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addIngredient}
        className={styles.addIngredientBtn}
      >
        + Add Ingredient
      </button>
    </div>
  );
};

export default IngredientInput;