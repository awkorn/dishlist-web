import React, { useState, useEffect } from "react";
import { useRecipeForm } from "../../../../contexts/RecipeFormContext";
import axios from "axios";
import styles from "./NutritionCalculator.module.css";

const NutritionCalculator = () => {
  const { ingredients, servings } = useRecipeForm();
  const [nutritionData, setNutritionData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  // Generate a unique key for this recipe's nutrition data
  const getNutritionStorageKey = () => {
    const ingredientsKey = ingredients
      .filter(ing => ing.name.trim() !== "")
      .map(ing => `${ing.amount || ""}|${ing.unit || ""}|${ing.name}`)
      .join("_");
    
    // Combine with servings to create a unique key
    return `nutrition_${ingredientsKey}_servings_${servings || 1}`;
  };

  // Load saved nutrition data on component mount
  useEffect(() => {
    const loadSavedNutritionData = () => {
      const storageKey = getNutritionStorageKey();
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        try {
          setNutritionData(JSON.parse(savedData));
        } catch (err) {
          console.error("Error parsing saved nutrition data:", err);
          // If there's an error parsing, clear the corrupted data
          localStorage.removeItem(storageKey);
        }
      }
    };

    // Only try to load data if we have ingredients
    if (ingredients.some(ing => ing.name.trim() !== "")) {
      loadSavedNutritionData();
    }
  }, [ingredients, servings]);

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
      
      const result = response.data.result;
      setNutritionData(result);
      
      // Save nutrition data to localStorage
      const storageKey = getNutritionStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(result));
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
        {!nutritionData && (
          <button 
            type="button" 
            onClick={calculateNutrition}
            disabled={isCalculating}
            className={styles.calculateBtn}
          >
            {isCalculating ? "Calculating..." : "Calculate Nutrition"}
          </button>
        )}
        
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
          
          <button 
            type="button" 
            onClick={calculateNutrition}
            disabled={isCalculating}
            className={styles.recalculateBtn}
          >
            {isCalculating ? "Calculating..." : "Recalculate"}
          </button>
        </div>
      )}
    </div>
  );
};

export default NutritionCalculator;