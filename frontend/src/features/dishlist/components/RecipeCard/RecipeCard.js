import React from "react";
import styles from "./RecipeCard.module.css";
import placeholderImage from "../../../../assets/images/placeholder.png";

const RecipeCard = ({
  recipe,
  onClick,
  onRemove,
  isUserCreator,
  dishListId,
}) => {
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

  // Get image source, handling both string URLs and object format
  const getImageSrc = () => {
    if (!image) return placeholderImage;
    if (typeof image === "string") return image;
    return image.url || placeholderImage;
  };

  // Get image rotation style
  const getImageStyle = () => {
    if (image && typeof image === "object" && image.rotation) {
      return {
        transform: `rotate(${image.rotation}deg)`,
        transformOrigin: "center center",
      };
    }
    return {};
  };

  const handleCardClick = () => {
    if (onClick) {
      // Call the original onClick handler with optional dishListId parameter
      onClick(dishListId);
    }
  };

  return (
    <div className={styles.recipeCard}>
      <div className={styles.recipeCardHeader} onClick={handleCardClick}>
        <div className={styles.recipeImageContainer}>
          <img
            src={getImageSrc()}
            alt={title}
            className={styles.recipeImage}
            style={getImageStyle()}
          />
        </div>
        <div className={styles.recipeCardInfo}>
          <h3 className={styles.recipeTitle}>{title}</h3>
          <div className={styles.recipeMeta}>
            {prepTime && (
              <span className={styles.prepTime}>
                Prep: {formatTime(prepTime)}
              </span>
            )}
            {cookTime && (
              <span className={styles.cookTime}>
                Cook: {formatTime(cookTime)}
              </span>
            )}
            {servings && (
              <span className={styles.servings}>Serves: {servings}</span>
            )}
          </div>
          {tags && tags.length > 0 && (
            <div className={styles.recipeTags}>
              {tags.slice(0, 3).map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className={styles.tag}>+{tags.length - 3}</span>
              )}
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
