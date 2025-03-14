import React from "react";
import styles from "./RecipeCard.module.css";
import placeholderImage from '../../../../assets/images/placeholder.png';

const RecipeCard = ({ recipe, onClick, onRemove, isUserCreator }) => {
  const { title, cookTime, prepTime, servings, image, tags } = recipe;
  
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
    <div className={styles.recipeCard}>
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
              {tags.slice(0, 3).map((tag, index) => (
                <span key={index} className={styles.tag}>{tag}</span>
              ))}
              {tags.length > 3 && <span className={styles.tag}>+{tags.length - 3}</span>}
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
    </div>
  );
};

export default RecipeCard;