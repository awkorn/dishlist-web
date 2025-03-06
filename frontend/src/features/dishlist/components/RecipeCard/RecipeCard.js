import React from "react";
import "./RecipeCard.css";

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
  const recipeImage = image || "/api/placeholder/400/300";
  
  return (
    <div className={`recipe-card ${isExpanded ? "expanded" : ""}`}>
      <div className="recipe-card-header" onClick={onClick}>
        <div className="recipe-image-container">
          <img src={recipeImage} alt={title} className="recipe-image" />
        </div>
        <div className="recipe-card-info">
          <h3 className="recipe-title">{title}</h3>
          <div className="recipe-meta">
            {prepTime && <span className="prep-time">Prep: {formatTime(prepTime)}</span>}
            {cookTime && <span className="cook-time">Cook: {formatTime(cookTime)}</span>}
            {servings && <span className="servings">Serves: {servings}</span>}
          </div>
          {tags && tags.length > 0 && (
            <div className="recipe-tags">
              {tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
        {onRemove && (
          <button 
            className="remove-recipe-btn" 
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
        <div className="recipe-details">
          {ingredients && ingredients.length > 0 && (
            <div className="ingredients-section">
              <h4>Ingredients</h4>
              <ul className="ingredients-list">
                {ingredients.map((ingredient, index) => (
                  <li key={index} className="ingredient-item">
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
            <div className="instructions-section">
              <h4>Instructions</h4>
              <ol className="instructions-list">
                {instructions.map((instruction, index) => (
                  <li key={index} className="instruction-item">{instruction}</li>
                ))}
              </ol>
            </div>
          )}
          
          <div className="recipe-actions">
            <button className="view-full-recipe">View Full Recipe</button>
            {isUserCreator && (
              <button className="edit-recipe">Edit Recipe</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCard;