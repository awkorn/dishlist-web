import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const RecipeFormContext = createContext();

// Custom hook for using context
export const useRecipeForm = () => useContext(RecipeFormContext);

// Provider component
export const RecipeFormProvider = ({ children }) => {
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState("");
  const [servings, setServings] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [image, setImage] = useState(null);
  const [ingredients, setIngredients] = useState([
    { name: "", amount: "", unit: "" },
  ]);
  const [instructions, setInstructions] = useState([""]);
  const [tags, setTags] = useState([]);
  const [selectedDishList, setSelectedDishList] = useState("");
  const [errors, setErrors] = useState({});

  // Form validation function
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = "Recipe title is required";
    
    // Check if at least one ingredient has a name
    const hasValidIngredient = ingredients.some(ing => ing.name.trim() !== "");
    if (!hasValidIngredient) {
      newErrors.ingredients = "At least one ingredient is required";
    }
    
    // Check if at least one instruction is provided
    const hasValidInstruction = instructions.some(inst => inst.trim() !== "");
    if (!hasValidInstruction) {
      newErrors.instructions = "At least one instruction is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form function
  const resetForm = () => {
    setTitle("");
    setServings("");
    setPrepTime("");
    setCookTime("");
    setImage(null);
    setIngredients([{ name: "", amount: "", unit: "" }]);
    setInstructions([""]);
    setTags([]);
    setSelectedDishList("");
    setErrors({});
    
    // Navigate back to dishlists page
    navigate("/dishlists");
  };

  // Value to be provided to consumers
  const value = {
    // Form state
    title,
    setTitle,
    servings,
    setServings,
    prepTime,
    setPrepTime,
    cookTime,
    setCookTime,
    image,
    setImage,
    ingredients,
    setIngredients,
    instructions,
    setInstructions,
    tags,
    setTags,
    selectedDishList,
    setSelectedDishList,
    errors,
    setErrors,

    // Functions
    validateForm,
    resetForm,
  };

  return (
    <RecipeFormContext.Provider value={value}>
      {children}
    </RecipeFormContext.Provider>
  );
};

export default RecipeFormContext;