import React from "react";

const IngredientInput = ({ ingredientList, setIngredientList }) => {
  const addIngredient = () => {
    setIngredientList([...ingredientList, { name: "", amount: "", unit: "" }]);
  };

  const removeIngredient = (index) => {
    const updateIngredients = [...ingredientList];
    updateIngredients.splice(index, 1);
    setIngredientList(updateIngredients);
  };

  const updateIngredient = (index, field, value) => {
    const updateIngredients = [...ingredientList];
    updateIngredients[index][field] = value;
    setIngredientList(updateIngredients);
  };

  return (
    <div className="ingredients-section">
      <h3>Ingredients</h3>

      {ingredientList.map((ingredient, index) => (
        <div key={index} className="ingredient-row">
          <input
            type="text"
            placeholder="Amount"
            value={ingredient.amount}
            onChange={(e) => updateIngredient(index, "amount", e.target.value)}
            className="amount-input"
          />

          <select
            value={ingredient.unit}
            onChange={(e) => updateIngredient(index, "unit", e.target.value)}
            className="unit-input"
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
            className="ingredient-input"
          />

          <button
            type="button"
            onClick={() => removeIngredient(index)}
            className="remove-ingredient-btn"
            aria-label="Remove ingredient"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addIngredient}
        className="add-ingredient-btn"
      >
        + Add Ingredient
      </button>
    </div>
  );
};

export default IngredientInput;