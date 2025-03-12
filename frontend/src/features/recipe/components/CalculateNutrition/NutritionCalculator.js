import React, { useState } from "react";
import { useRecipeForm } from "../../../../contexts/RecipeFormContext";
import axios from "axios";
import styles from "./NutritionCalculator.module.css";

const NutritionCalculator = () => {
  const { ingredients, servings } = useRecipeForm();
  const [nutritionData, setNutritionData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  const calculateNutrition = async () => {
    setIsCalculating(true);
    setError(null);
    
    try {
      // Filter out empty ingredients
      const validIngredients = ingredients.filter(ing => ing.name.trim() !== "");
      
      if (validIngredients.length === 0) {
        setError("Please add ingredients to calculate nutrition");
        setIsCalculating(false);
        return;
      }
      
      // Format ingredients for OpenAI
      const formattedIngredients = validIngredients.map(ing => {
        return `${ing.amount || ""} ${ing.unit || ""} ${ing.name}`.trim();
      });
      
      // Call your backend endpoint that uses OpenAI
      const response = await axios.post('http://localhost:5000/api/nutrition', {
        ingredients: formattedIngredients,
        servingsCount: servings || 1
      });
      
      setNutritionData(response.data.result);
    } catch (err) {
      console.error("Error calculating nutrition:", err);
      setError("Failed to calculate nutrition. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className={styles.nutritionSection}>
      <h3>Nutrition Information</h3>
      
      <div className={styles.nutritionControls}>
        <button 
          type="button" 
          onClick={calculateNutrition}
          disabled={isCalculating}
          className={styles.calculateBtn}
        >
          {isCalculating ? "Calculating..." : "Calculate Nutrition"}
        </button>
        
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
      
      {nutritionData && (
        <div className={styles.nutritionFacts}>
          <h4>Nutrition Facts</h4>
          <p className={styles.servingInfo}>Per serving (serves {servings || 1})</p>
          
          <div className={styles.nutrientRow}>
            <span className={styles.nutrientName}>Calories</span>
            <span className={styles.nutrientValue}>{nutritionData.calories}</span>
          </div>
          
          <div className={styles.nutrientRow}>
            <span className={styles.nutrientName}>Protein</span>
            <span className={styles.nutrientValue}>{nutritionData.protein}g</span>
          </div>
          
          <div className={styles.nutrientRow}>
            <span className={styles.nutrientName}>Carbohydrates</span>
            <span className={styles.nutrientValue}>{nutritionData.carbs}g</span>
          </div>
          
          <div className={styles.nutrientRow}>
            <span className={styles.nutrientName}>Fat</span>
            <span className={styles.nutrientValue}>{nutritionData.fat}g</span>
          </div>
          
          <div className={styles.nutrientRow}>
            <span className={styles.nutrientName}>Fiber</span>
            <span className={styles.nutrientValue}>{nutritionData.fiber}g</span>
          </div>
          
          <div className={styles.nutrientRow}>
            <span className={styles.nutrientName}>Sugar</span>
            <span className={styles.nutrientValue}>{nutritionData.sugar}g</span>
          </div>
          
          <div className={styles.nutrientRow}>
            <span className={styles.nutrientName}>Sodium</span>
            <span className={styles.nutrientValue}>{nutritionData.sodium}mg</span>
          </div>
          
          <p className={styles.disclaimer}>
            * Nutrition values are estimates and may vary based on exact ingredients and preparation methods.
          </p>
        </div>
      )}
    </div>
  );
};

export default NutritionCalculator;