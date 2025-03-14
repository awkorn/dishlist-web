import React from "react";
import styles from "./RecipeCard.module.css";
import placeholderImage from '../../../../assets/images/placeholder.png';

const RecipeCard = ({ recipe, isExpanded, onClick, onRemove, isUserCreator }) => {
  const { title, cookTime, prepTime, servings, image, ingredients, instructions, tags, creatorId } = recipe;
  
  // Format time (convert minutes to hours and minutes if needed)
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
  
  // Get placeholder image if no image is provided
  const recipeImage = image || placeholderImage;
  
  return (
    <div className={`${styles.recipeCard} ${isExpanded ? styles.expanded : ""}`}>
      <div className={styles.recipeCardHeader} onClick={onClick}>
        <div className={styles.recipeImageContainer}>
          <img src={recipeImage} alt={title} className={styles.recipeImage} />
        </div>
        <div className={styles.recipeCardInfo}>
          <h3 className={styles.recipeTitle}>{title}</h3>
          <div className={styles.recipeMeta}>
            {prepTime && <span className={styles.prepTime}>Prep: {formatTime(prepTime)}</span>}
            {cookTime && <span className={styles.cookTime}>Cook: {formatTime(cookTime)}</span>}
            {servings && <span className={styles.servings}>Serves: {servings}</span>}
          </div>
          {tags && tags.length > 0 && (
            <div className={styles.recipeTags}>
              {tags.map((tag, index) => (
                <span key={index} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
        {onRemove && (
          <button 
            className={styles.removeRecipeBtn} 
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            title="Remove from DishList"
          >
            ✕
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className={styles.recipeDetails}>
          {ingredients && ingredients.length > 0 && (
            <div className={styles.ingredientsSection}>
              <h4>Ingredients</h4>
              <ul className={styles.ingredientsList}>
                {ingredients.map((ingredient, index) => (
                  <li key={index} className={styles.ingredientItem}>
                    {ingredient.amount && ingredient.unit 
                      ? `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`
                      : ingredient.amount 
                        ? `${ingredient.amount} ${ingredient.name}`
                        : ingredient.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {instructions && instructions.length > 0 && (
            <div className={styles.instructionsSection}>
              <h4>Instructions</h4>
              <ol className={styles.instructionsList}>
                {instructions.map((instruction, index) => (
                  <li key={index} className={styles.instructionItem}>{instruction}</li>
                ))}
              </ol>
            </div>
          )}
          
          <div className={styles.recipeActions}>
            <button className={styles.viewFullRecipe}>View Full Recipe</button>
            {isUserCreator && (
              <button className={styles.editRecipe}>Edit Recipe</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCard;