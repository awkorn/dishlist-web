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

  return <></>;
};

export default InstructionSteps;
