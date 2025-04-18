import React, { useEffect } from "react";
import { useRecipeForm } from "../../../../contexts/RecipeFormContext";
import styles from "./InstructionSteps.module.css";

const InstructionSteps = () => {
  const { instructions, setInstructions, errors } = useRecipeForm();

  // Add instruction
  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  // Remove instruction
  const removeInstruction = (index) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  // Update instruction
  const updateInstruction = (index, value) => {
    const updateInstructions = [...instructions];
    updateInstructions[index] = value;
    setInstructions(updateInstructions);
  };

  // Resize input on first render
  useEffect(() => {
    const textareas = document.querySelectorAll("textarea");
    textareas.forEach((el) => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    });
  }, [instructions]);

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className={styles.instructionsSection}>
      <h3>Instructions</h3>
      {errors.instructions && (
        <p className={styles.errorMessage}>{errors.instructions}</p>
      )}

      {instructions.map((instruction, index) => (
        <div key={index} className={styles.instructionRow}>
          <textarea
            placeholder={`Step ${index + 1}`}
            value={instruction}
            onChange={(e) => updateInstruction(index, e.target.value)}
            className={styles.instructionInput}
            onInput={autoResize}
          />

          <button
            type="button"
            onClick={() => removeInstruction(index)}
            className={styles.removeInstructionBtn}
            aria-label="Remove step"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addInstruction}
        className={styles.addInstructionBtn}
      >
        + Add Instruction
      </button>
    </div>
  );
};

export default InstructionSteps;
