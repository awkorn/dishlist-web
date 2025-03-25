import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const RecipeFormContext = createContext();

// Custom hook for using context
export const useRecipeForm = () => useContext(RecipeFormContext);

// Provider component
export const RecipeFormProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dishListId, setDishListId] = useState(null);

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

  // Extract dishListId from URL params when component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const dishListId = queryParams.get("dishListId");
    if (dishListId) {
      setDishListId(dishListId);
      setSelectedDishList(dishListId);
    }
  }, [location]);

  // Form validation function
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = "Recipe title is required";

    const hasValidIngredient = ingredients.some(
      (ing) => ing.name.trim() !== ""
    );
    if (!hasValidIngredient) {
      newErrors.ingredients = "At least one ingredient is required";
    }

    const hasValidInstruction = instructions.some((inst) => inst.trim() !== "");
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

    if (dishListId) {
      navigate(`/dishlist/${dishListId}`);
    } else {
      navigate("/dishlists");
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
    resetForm,
  };

  return (
    <RecipeFormContext.Provider value={value}>
      {children}
    </RecipeFormContext.Provider>
  );
};

export default RecipeFormContext;
