import React from "react";
import { useRecipeForm } from "../../../../contexts/RecipeFormContext";
import "./InstructionSteps.css";

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

  return (
    <div className="instructions-section">
      <h3>Instructions</h3>
      {errors.instructions && (
        <p className="error-message">{errors.instructions}</p>
      )}

      {instructions.map((instruction, index) => (
        <div key={index} className="instruction-row">
          <input
            type="text"
            placeholder={`Step ${index + 1}`}
            value={instruction}
            onChange={(e) => updateInstruction(index, e.target.value)}
            className="instruction-input"
          />

          <button
            type="button"
            onClick={() => removeInstruction(index)}
            className="remove-instruction-btn"
            aria-label="Remove step"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addInstruction}
        className="add-instruction-btn"
      >
        + Add Instruction
      </button>
    </div>
  );
};

export default InstructionSteps;
