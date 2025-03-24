import React, { useState } from 'react';
import SaveToDishListPanel from '../SaveToDishListPanel/SaveToDishListPanel';
import styles from './GeneratedRecipeView.module.css';

const GeneratedRecipeView = ({ recipe, onRegenerate }) => {
  const [isSavePanelOpen, setIsSavePanelOpen] = useState(false);
  const [editableRecipe, setEditableRecipe] = useState(recipe);
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditMode = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...editableRecipe.ingredients];
    updatedIngredients[index] = value;
    
    setEditableRecipe({
      ...editableRecipe,
      ingredients: updatedIngredients
    });
  };

  const handleInstructionChange = (index, value) => {
    const updatedInstructions = [...editableRecipe.instructions];
    updatedInstructions[index] = value;
    
    setEditableRecipe({
      ...editableRecipe,
      instructions: updatedInstructions
    });
  };

  // Format cooking time (convert minutes to hours and minutes if needed)
  const formatTime = (timeInMinutes) => {
    if (!timeInMinutes) return "N/A";
    
    if (timeInMinutes < 60) {
      return `${timeInMinutes} min`;
    }
    
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    
    if (minutes === 0) {
      return `${hours} hr`;
    }
    
    return `${hours} hr ${minutes} min`;
  };

  return (
    <div className={styles.recipeContainer}>
      <div className={styles.recipeHeader}>
        <h2 className={styles.recipeTitle}>{editableRecipe.title}</h2>
        
        <div className={styles.recipeMeta}>
          {editableRecipe.prepTime && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Prep</span>
              <span className={styles.metaValue}>{formatTime(editableRecipe.prepTime)}</span>
            </div>
          )}
          
          {editableRecipe.cookTime && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Cook</span>
              <span className={styles.metaValue}>{formatTime(editableRecipe.cookTime)}</span>
            </div>
          )}
          
          {editableRecipe.servings && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Serves</span>
              <span className={styles.metaValue}>{editableRecipe.servings}</span>
            </div>
          )}
        </div>

        <div className={styles.recipeActions}>
          <button 
            className={styles.regenerateBtn}
            onClick={onRegenerate}
          >
            Generate New Recipe
          </button>
          
          <button 
            className={styles.editBtn}
            onClick={toggleEditMode}
          >
            {isEditing ? 'Save Changes' : 'Edit Recipe'}
          </button>
          
          <button 
            className={styles.saveBtn}
            onClick={() => setIsSavePanelOpen(true)}
          >
            Save to DishList
          </button>
        </div>
      </div>

      <div className={styles.recipeContent}>
        {/* Ingredients Section */}
        <div className={styles.ingredientsSection}>
          <h3 className={styles.sectionTitle}>Ingredients</h3>
          
          <ul className={styles.ingredientsList}>
            {editableRecipe.ingredients.map((ingredient, index) => (
              <li key={index} className={styles.ingredientItem}>
                {isEditing ? (
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    className={styles.editInput}
                  />
                ) : (
                  ingredient
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions Section */}
        <div className={styles.instructionsSection}>
          <h3 className={styles.sectionTitle}>Instructions</h3>
          
          <ol className={styles.instructionsList}>
            {editableRecipe.instructions.map((instruction, index) => (
              <li key={index} className={styles.instructionItem}>
                {isEditing ? (
                  <textarea
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    className={styles.editTextarea}
                    rows={3}
                  />
                ) : (
                  instruction
                )}
              </li>
            ))}
          </ol>
        </div>
        
        {/* Nutrition Section (if available) */}
        {editableRecipe.nutrition && (
          <div className={styles.nutritionSection}>
            <h3 className={styles.sectionTitle}>Nutrition Information</h3>
            <div className={styles.nutritionTable}>
              <div className={styles.nutritionRow}>
                <span className={styles.nutritionLabel}>Calories:</span>
                <span className={styles.nutritionValue}>{editableRecipe.nutrition.calories}</span>
              </div>
              <div className={styles.nutritionRow}>
                <span className={styles.nutritionLabel}>Protein:</span>
                <span className={styles.nutritionValue}>{editableRecipe.nutrition.protein}g</span>
              </div>
              <div className={styles.nutritionRow}>
                <span className={styles.nutritionLabel}>Carbohydrates:</span>
                <span className={styles.nutritionValue}>{editableRecipe.nutrition.carbs}g</span>
              </div>
              <div className={styles.nutritionRow}>
                <span className={styles.nutritionLabel}>Fat:</span>
                <span className={styles.nutritionValue}>{editableRecipe.nutrition.fat}g</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save to DishList Panel */}
      {isSavePanelOpen && (
        <SaveToDishListPanel 
          recipe={editableRecipe}
          onClose={() => setIsSavePanelOpen(false)}
        />
      )}
    </div>
  );
};

export default GeneratedRecipeView;