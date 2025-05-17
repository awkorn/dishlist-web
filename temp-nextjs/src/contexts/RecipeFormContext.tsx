'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Define TypeScript types for your context
type RecipeFormContextType = {
  title: string;
  setTitle: (title: string) => void;
  servings: string;
  setServings: (servings: string) => void;
  prepTime: string;
  setPrepTime: (prepTime: string) => void;
  cookTime: string;
  setCookTime: (cookTime: string) => void;
  image: any | null;
  setImage: (image: any | null) => void;
  ingredients: Array<{ name: string; amount: string; unit: string }>;
  setIngredients: (ingredients: Array<{ name: string; amount: string; unit: string }>) => void;
  instructions: string[];
  setInstructions: (instructions: string[]) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  selectedDishList: string;
  setSelectedDishList: (dishListId: string) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  validateForm: () => boolean;
  resetForm: () => void;
};

const RecipeFormContext = createContext<RecipeFormContextType | null>(null);

// Custom hook for using context
export const useRecipeForm = () => {
  const context = useContext(RecipeFormContext);
  if (context === null) {
    throw new Error('useRecipeForm must be used within a RecipeFormProvider');
  }
  return context;
};

// Provider component
export const RecipeFormProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dishListId, setDishListId] = useState<string | null>(null);

  // Parse query parameters to check if we're in edit mode
  const isEditMode = searchParams.get("edit") === "true";
  const recipeId = searchParams.get("recipeId");

  // Form state
  const [title, setTitle] = useState("");
  const [servings, setServings] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [image, setImage] = useState<any | null>(null);
  const [ingredients, setIngredients] = useState([
    { name: "", amount: "", unit: "" },
  ]);
  const [instructions, setInstructions] = useState([""]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedDishList, setSelectedDishList] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Extract dishListId from URL params when component mounts
  useEffect(() => {
    const dishListIdParam = searchParams.get("dishListId");
    if (dishListIdParam) {
      setDishListId(dishListIdParam);
      setSelectedDishList(dishListIdParam);
    }
  }, [searchParams]);

  // Form validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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
    if (isEditMode && recipeId) {
      router.push(`/recipe/${recipeId}`);
    } else {
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
        router.push(`/dishlist/${dishListId}`);
      } else {
        router.push("/dishlists");
      }
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