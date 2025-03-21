import React, { useState } from "react";
import styles from "./RecipeInstructions.module.css";

const RecipeInstructions = ({ instructions }) => {
  const [completedSteps, setCompletedSteps] = useState([]);

  // Toggle step completion
  const toggleStepCompletion = (index) => {
    setCompletedSteps((prev) => {
      if (prev.includes(index)) {
        return prev.filter((step) => step !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Mark all steps as complete/incomplete
  const toggleAllSteps = () => {
    if (completedSteps.length === instructions.length) {
      setCompletedSteps([]);
    } else {
      setCompletedSteps(instructions.map((_, index) => index));
    }
  };

  // Check if all steps are completed
  const allStepsCompleted = completedSteps.length === instructions.length;

  return (
    <div className={styles.instructionsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Instructions</h2>

        <button className={styles.toggleAllButton} onClick={toggleAllSteps}>
          {allStepsCompleted
            ? "Mark all as incomplete"
            : "Mark all as complete"}
        </button>
      </div>

      <div className={styles.stepsList}>
        {instructions.map((instruction, index) => (
          <div
            key={index}
            className={`${styles.stepItem} ${
              completedSteps.includes(index) ? styles.completed : ""
            }`}
            onClick={() => toggleStepCompletion(index)}
          >
            <div className={styles.stepNumber}>
              <span>{index + 1}</span>
            </div>
            <div className={styles.stepContent}>
              <p className={styles.stepText}>{instruction}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeInstructions;
