import React, { useState } from "react";
import styles from "./RecipeIngredients.module.css";

const RecipeIngredients = ({ ingredients, servings }) => {
  const [adjustedServings, setAdjustedServings] = useState(servings || 1);
  
  // Function to format ingredient text
  const formatIngredient = (ingredient, scaleFactor) => {
    let amount = ingredient.amount;
    
    // Scale the amount if it's a number
    if (amount && !isNaN(parseFloat(amount))) {
      amount = (parseFloat(amount) * scaleFactor).toFixed(2);
      // Remove trailing zeros after decimal point
      amount = amount.replace(/\.?0+$/, '');
    }
    
    // Build the ingredient text
    let text = '';
    if (amount) text += amount + ' ';
    if (ingredient.unit) text += ingredient.unit + ' ';
    text += ingredient.name;
    
    return text;
  };
  
  // Increase servings
  const increaseServings = () => {
    setAdjustedServings(prev => prev + 1);
  };
  
  // Decrease servings (minimum 1)
  const decreaseServings = () => {
    setAdjustedServings(prev => Math.max(1, prev - 1));
  };
  
  // Calculate the scale factor for ingredient amounts
  const scaleFactor = servings ? adjustedServings / servings : 1;
  
  return (
    <div className={styles.ingredientsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Ingredients</h2>
        
        {servings && (
          <div className={styles.servingsAdjuster}>
            <span className={styles.servingsLabel}>Adjust servings:</span>
            <div className={styles.servingsControls}>
              <button 
                className={styles.servingsButton}
                onClick={decreaseServings}
                disabled={adjustedServings <= 1}
                aria-label="Decrease servings"
              >
                -
              </button>
              <span className={styles.servingsValue}>{adjustedServings}</span>
              <button 
                className={styles.servingsButton}
                onClick={increaseServings}
                aria-label="Increase servings"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.ingredientsList}>
        {ingredients.map((ingredient, index) => (
          <div key={index} className={styles.ingredientItem}>
            <div className={styles.checkboxContainer}>
              <input 
                type="checkbox" 
                id={`ingredient-${index}`} 
                className={styles.checkbox}
              />
              <label 
                htmlFor={`ingredient-${index}`} 
                className={styles.ingredientText}
              >
                {formatIngredient(ingredient, scaleFactor)}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeIngredients;