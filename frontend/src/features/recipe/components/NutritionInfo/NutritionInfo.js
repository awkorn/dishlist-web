import React, { useState } from "react";
import axios from "axios";
import styles from "./NutritionInfo.module.css";

const NutritionInfo = ({ ingredients, servings }) => {
  const [nutritionData, setNutritionData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState(null);
  
  // Calculate nutrition facts
  const calculateNutrition = async () => {
    setIsCalculating(true);
    setError(null);
    
    try {
      // Filter out empty ingredients
      const validIngredients = ingredients.filter(ing => ing.name.trim() !== "");
      
      if (validIngredients.length === 0) {
        setError("No ingredients to analyze");
        setIsCalculating(false);
        return;
      }
      
      // Format ingredients for API
      const formattedIngredients = validIngredients.map(ing => {
        return `${ing.amount || ""} ${ing.unit || ""} ${ing.name}`.trim();
      });
      
      // Call nutrition API
      const response = await axios.post('http://localhost:5000/api/nutrition', {
        ingredients: formattedIngredients,
        servingsCount: servings || 1
      });
      
      setNutritionData(response.data.result);
      setIsExpanded(true);
    } catch (err) {
      console.error("Error calculating nutrition:", err);
      setError("Failed to calculate nutrition. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };
  
  return (
    <div className={styles.nutritionSection}>
      <h3 className={styles.nutritionTitle}>Nutrition Information</h3>
      
      {!nutritionData ? (
        <div className={styles.calculateContainer}>
          <p className={styles.nutritionDescription}>
            Get estimated nutrition facts for this recipe based on ingredients.
          </p>
          
          <button
            className={styles.calculateButton}
            onClick={calculateNutrition}
            disabled={isCalculating}
          >
            {isCalculating ? "Calculating..." : "Calculate Nutrition"}
          </button>
          
          {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
      ) : (
        <div className={styles.nutritionFacts}>
          <div 
            className={styles.nutritionHeader}
            onClick={toggleExpanded}
          >
            <h4 className={styles.nutritionFactsTitle}>Nutrition Facts</h4>
            <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>
              ▼
            </span>
          </div>
          
          <p className={styles.servingInfo}>Per serving (serves {servings || 1})</p>
          
          {isExpanded && (
            <>
              <div className={styles.nutrientRow}>
                <span className={styles.nutrientName}>Calories</span>
                <span className={styles.nutrientValue}>{nutritionData.calories}</span>
              </div>
              
              <div className={styles.calorieBar}>
                <div className={styles.macroBar}>
                  <div 
                    className={`${styles.macroFill} ${styles.proteinFill}`}
                    style={{ width: `${nutritionData.proteinCaloriePercentage || 25}%` }}
                  >
                    Protein
                  </div>
                  <div 
                    className={`${styles.macroFill} ${styles.carbsFill}`}
                    style={{ width: `${nutritionData.carbsCaloriePercentage || 45}%` }}
                  >
                    Carbs
                  </div>
                  <div 
                    className={`${styles.macroFill} ${styles.fatFill}`}
                    style={{ width: `${nutritionData.fatCaloriePercentage || 30}%` }}
                  >
                    Fat
                  </div>
                </div>
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
            </>
          )}
          
          <p className={styles.disclaimer}>
            * Nutrition values are estimates and may vary based on exact ingredients and preparation methods.
          </p>
        </div>
      )}
    </div>
  );
};

export default NutritionInfo;