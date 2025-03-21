import React from "react";
import styles from "./RecipeHeader.module.css";
import { CookingPot, ChefHat, Timer, Users } from 'lucide-react';

const RecipeHeader = ({ title, cookTime, prepTime, servings, createdAt }) => {
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
  
  // Format creation date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    try {
      // Convert string timestamp to number before creating Date object
      const timestamp = parseInt(dateString, 10);
      const date = new Date(timestamp);
      
      // Check if date is valid before formatting
      if (isNaN(date.getTime())) {
        console.error("Invalid date from timestamp:", dateString);
        return ""; 
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return ""; 
    }
  };
  
  // Calculate total time
  const totalTime = (cookTime || 0) + (prepTime || 0);
  
  return (
    <div className={styles.recipeHeader}>
      
      <div className={styles.recipeInfo}>
        <h1 className={styles.recipeTitle}>{title}</h1>
        
        <div className={styles.recipeMetaInfo}>
          <div className={styles.metaItem}>
            <div className={styles.metaIcon}>
            <ChefHat size={20} />
            </div>
            <div className={styles.metaText}>
              <span className={styles.metaLabel}>Prep Time</span>
              <span className={styles.metaValue}>{formatTime(prepTime)}</span>
            </div>
          </div>
          
          <div className={styles.metaItem}>
            <div className={styles.metaIcon}>
            <CookingPot size={20} />
            </div>
            <div className={styles.metaText}>
              <span className={styles.metaLabel}>Cook Time</span>
              <span className={styles.metaValue}>{formatTime(cookTime)}</span>
            </div>
          </div>
          
          <div className={styles.metaItem}>
            <div className={styles.metaIcon}>
            <Timer size={20} />
            </div>
            <div className={styles.metaText}>
              <span className={styles.metaLabel}>Total Time</span>
              <span className={styles.metaValue}>{formatTime(totalTime)}</span>
            </div>
          </div>
          
          <div className={styles.metaItem}>
            <div className={styles.metaIcon}>
            <Users size={20} />
            </div>
            <div className={styles.metaText}>
              <span className={styles.metaLabel}>Servings</span>
              <span className={styles.metaValue}>{servings || "N/A"}</span>
            </div>
          </div>
        </div>
        
        {createdAt && (
          <div className={styles.creationDate}>
            <span>Created on {formatDate(createdAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeHeader;