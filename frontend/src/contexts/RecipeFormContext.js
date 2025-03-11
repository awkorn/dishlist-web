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

    // Validate that a dishlist is selected
    if (!selectedDishList) {
      newErrors.dishList = "Please select a DishList";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission handler
  const handleSubmit = (event, createRecipeMutation) => {
    event.preventDefault();

    if (!validateForm()) return false;

    // Filter out empty ingredients
    const filteredIngredients = ingredients.filter(
      (item) => item.name.trim() !== ""
    );

    // Filter out empty instructions
    const filteredInstructions = instructions.filter(
      (item) => item.trim() !== ""
    );

    // Transform data for mutation 
    const recipeData = {
      title,
      servings: servings ? parseInt(servings) : null,
      prepTime: prepTime ? parseInt(prepTime) : null,
      cookTime: cookTime ? parseInt(cookTime) : null,
      ingredients: filteredIngredients,
      instructions: filteredInstructions,
      tags,
      image: image ? image.url : null,
    };

    try {
      createRecipeMutation(recipeData);
      return true;
    } catch (error) {
      setErrors({ submit: error.message });
      return false;
    }
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

  // Add recipe to another DishList (without creating a new recipe)
  const addToDishList = async (recipeId, dishListId, addRecipeMutation) => {
    try {
      await addRecipeMutation({
        variables: {
          recipeId,
          dishListId,
        }
      });
      return true;
    } catch (error) {
      setErrors({ submit: error.message });
      return false;
    }
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
    handleSubmit,
    addToDishList,
    resetForm,
  };

  return (
    <RecipeFormContext.Provider value={value}>
      {children}
    </RecipeFormContext.Provider>
  );
};

export default RecipeFormContext;