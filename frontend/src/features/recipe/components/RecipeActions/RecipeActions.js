import React from "react";
import styles from "./RecipeActions.module.css";
import { Pencil, Printer, Heart } from "lucide-react";

const RecipeActions = ({ isCreator, isSaved, onSaveToggle, onEdit, onPrint }) => {
  // Function to handle printing
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };
  
  return (
    <div className={styles.actionsContainer}>
      <button 
        className={`${styles.actionButton} ${isSaved ? styles.savedButton : styles.saveButton}`}
        onClick={onSaveToggle}
        aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
      >
        <span className={styles.actionIcon}>
          {isSaved ? <Heart size={18} fill="red" stroke="none"/> : <Heart size={18} />}
        </span>
        <span className={styles.actionText}>
          {isSaved ? "Saved" : "Save"}
        </span>
      </button>

      <button 
        className={`${styles.actionButton} ${styles.printButton}`}
        onClick={handlePrint}
        aria-label="Print recipe"
      >
        <span className={styles.actionIcon}>
          <Printer size={18} />
        </span>
        <span className={styles.actionText}>
          Print
        </span>
      </button>
      
      {isCreator && (
        <button 
          className={`${styles.actionButton} ${styles.editButton}`}
          onClick={onEdit}
          aria-label="Edit recipe"
        >
          <span className={styles.actionIcon}>
            <Pencil size={18} />
          </span>
          <span className={styles.actionText}>
            Edit
          </span>
        </button>
      )}
    </div>
  );
};

export default RecipeActions;