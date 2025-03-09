import React, { createContext, useContext, useState } from "react";

const RecipeFormContext = createContext();

// Custom hook for using context
export const useRecipeForm = () => useContext(RecipeFormContext);

// Provider component
export const RecipeFormProvider = ({ children }) => {
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

    if (!title.trim()) newErrors.title = "Title is required";
    if (ingredients.length === 0 || !ingredients[0].name)
      newErrors.ingredients = "At least one ingredient is required";
    if (instructions.length === 0 || !instructions[0])
      newErrors.instructions = "At least one instruction is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form sumbission handler
  const handleSubmit = async (event, createRecipeMutation) => {
    event.preventDefault();

    if (!validateForm()) return false;

    // Transform data for mutation 
    const recipeData = {
      title,
      servings: parseInt(servings) || null,
      prepTime: parseInt(prepTime) || null,
      cookTime: parseInt(cookTime) || null,
      ingredients,
      instructions,
      tags,
      image: image ? image.url : null,
      dishListId: selectedDishList,
    };

    try {
      await createRecipeMutation({ variables: recipeData });
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
    resetForm,
  };

  return (
    <RecipeFormContext.Provider value={value}>
      {children}
    </RecipeFormContext.Provider>
  );
};
