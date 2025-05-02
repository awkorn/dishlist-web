import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./NutritionInfo.module.css";

const NutritionInfo = ({ ingredients, servings }) => {
  const [nutritionData, setNutritionData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState(null);

  // Generate a unique key for this recipe's nutrition data
  const getNutritionStorageKey = () => {
    const ingredientsKey = ingredients
      .filter(ing => ing.name.trim() !== "")
      .map(ing => `${ing.amount || ""}|${ing.unit || ""}|${ing.name}`)
      .join("_");
    
    // Combine with servings to create a unique key
    return `nutrition_view_${ingredientsKey}_servings_${servings || 1}`;
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
          localStorage.removeItem(storageKey);
        }
      }
    };

    // Only try to load data if we have ingredients
    if (ingredients && ingredients.some(ing => ing.name.trim() !== "")) {
      loadSavedNutritionData();
    }
  }, [ingredients, servings]);

  // Calculate nutrition facts
  const calculateNutrition = async () => {
    setIsCalculating(true);
    setError(null);

    try {
      const validIngredients = ingredients.filter(
        (ing) => ing.name.trim() !== ""
      );

      if (validIngredients.length === 0) {
        setError("No ingredients to analyze");
        setIsCalculating(false);
        return;
      }

      const formattedIngredients = validIngredients.map((ing) => {
        return `${ing.amount || ""} ${ing.unit || ""} ${ing.name}`.trim();
      });

      const response = await axios.post("http://localhost:5000/api/nutrition", {
        ingredients: formattedIngredients,
        servingsCount: servings || 1,
      });

      const data = response.data.result;
      setNutritionData(data);
      setIsExpanded(true);
      
      // Save to localStorage
      const storageKey = getNutritionStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (err) {
      console.error("Error calculating nutrition:", err);
      setError("Failed to calculate nutrition. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
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
          <div className={styles.nutritionHeader} onClick={toggleExpanded}>
            <h4 className={styles.nutritionFactsTitle}>Nutrition Facts</h4>
            <span
              className={`${styles.expandIcon} ${
                isExpanded ? styles.expanded : ""
              }`}
            >
              ▼
            </span>
          </div>

          <p className={styles.servingInfo}>
            Per serving (serves {servings || 1})
          </p>

          {isExpanded && (
            <>
              <div className={styles.nutrientRow}>
                <span className={styles.nutrientName}>Calories</span>
                <span className={styles.nutrientValue}>
                  {nutritionData.calories}
                </span>
              </div>

              {/* Macronutrient Bar */} 
              <div className={styles.calorieBar}>
                <div className={styles.macroBar}>
                  {(() => {
                    // Calculate calories for each macro
                    const proteinCal = nutritionData.protein * 4;
                    const carbsCal = nutritionData.carbs * 4;
                    const fatCal = nutritionData.fat * 9;
                    const totalCal = nutritionData.calories;

                    // Raw percentages
                    const proteinRaw = (proteinCal / totalCal) * 100;
                    const carbsRaw = (carbsCal / totalCal) * 100;
                    const fatRaw = (fatCal / totalCal) * 100;

                    // Normalize to 100%
                    const totalRaw = proteinRaw + carbsRaw + fatRaw;
                    const proteinWidth = totalRaw ? (proteinRaw / totalRaw) * 100 : 0;
                    const carbsWidth = totalRaw ? (carbsRaw / totalRaw) * 100 : 0;
                    const fatWidth = totalRaw ? (fatRaw / totalRaw) * 100 : 0;

                    // Minimum width for visibility
                    const minWidth = 5;

                    return (
                      <>
                        {nutritionData.protein > 0 && (
                          <div
                            className={`${styles.macroFill} ${styles.proteinFill}`}
                            style={{
                              width: `${Math.max(proteinWidth.toFixed(1), minWidth)}%`,
                            }}
                          >
                            {proteinWidth > 10 && "Protein"}
                          </div>
                        )}
                        {nutritionData.carbs > 0 && (
                          <div
                            className={`${styles.macroFill} ${styles.carbsFill}`}
                            style={{
                              width: `${Math.max(carbsWidth.toFixed(1), minWidth)}%`,
                            }}
                          >
                            {carbsWidth > 10 && "Carbs"}
                          </div>
                        )}
                        {nutritionData.fat > 0 && (
                          <div
                            className={`${styles.macroFill} ${styles.fatFill}`}
                            style={{
                              width: `${Math.max(fatWidth.toFixed(1), minWidth)}%`,
                            }}
                          >
                            {fatWidth > 10 && "Fat"}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className={styles.nutrientRow}>
                <span className={styles.nutrientName}>Protein</span>
                <span className={styles.nutrientValue}>
                  {nutritionData.protein}g
                </span>
              </div>

              <div className={styles.nutrientRow}>
                <span className={styles.nutrientName}>Carbohydrates</span>
                <span className={styles.nutrientValue}>
                  {nutritionData.carbs}g
                </span>
              </div>

              <div className={styles.nutrientRow}>
                <span className={styles.nutrientName}>Fat</span>
                <span className={styles.nutrientValue}>
                  {nutritionData.fat}g
                </span>
              </div>

              <div className={styles.nutrientRow}>
                <span className={styles.nutrientName}>Fiber</span>
                <span className={styles.nutrientValue}>
                  {nutritionData.fiber}g
                </span>
              </div>

              <div className={styles.nutrientRow}>
                <span className={styles.nutrientName}>Sugar</span>
                <span className={styles.nutrientValue}>
                  {nutritionData.sugar}g
                </span>
              </div>

              <div className={styles.nutrientRow}>
                <span className={styles.nutrientName}>Sodium</span>
                <span className={styles.nutrientValue}>
                  {nutritionData.sodium}mg
                </span>
              </div>
              
              <button
                className={styles.recalculateButton}
                onClick={calculateNutrition}
                disabled={isCalculating}
              >
                {isCalculating ? "Calculating..." : "Recalculate"}
              </button>
            </>
          )}

          <p className={styles.disclaimer}>
            * Nutrition values are estimates and may vary based on exact
            ingredients and preparation methods.
          </p>
        </div>
      )}
    </div>
  );
};

export default NutritionInfo;