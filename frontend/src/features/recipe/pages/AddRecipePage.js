import React from "react";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthProvider";
import { CREATE_RECIPE } from "../../../graphql/mutations/recipe";
import TopNav from "../../../components/layout/TopNav/TopNav";
import PageTitle from "../../../components/common/PageTitle/PageTitle";
import AddRecipeForm from "../components/AddRecipeForm/AddRecipeForm";
import { RecipeFormProvider } from "../../../contexts/RecipeFormContext";
import "./AddRecipePage.css";

const AddRecipePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract dishListId from URL query if present
  const queryParams = new URLSearchParams(location.search);
  const dishListId = queryParams.get("dishListId");

  const [createRecipe, { loading }] = useMutation(CREATE_RECIPE, {
    onCompleted: (data) => {
      toast.success("Recipe created successfully!");
      
      // Navigate to the dishlist page that was specified in the URL query or default
      if (dishListId) {
        navigate(`/dishlist/${dishListId}`, { state: { refresh: true } });
      } else if (data.createRecipe.dishLists && data.createRecipe.dishLists.length > 0) {
        navigate(`/dishlist/${data.createRecipe.dishLists[0]}`);
      } else {
        navigate(`/dishlists`);
      }
    },
    onError: (error) => {
      toast.error(`Error creating recipe: ${error.message}`);
    }
  });

  if (!currentUser) {
    return (
      <div className="page-container">
        <TopNav />
        <div className="unauthorized-message">
          <h2>Please sign in to create recipes</h2>
          <button onClick={() => navigate("/signin")} className="primary-button">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <TopNav pageType="recipe-builder" />
      <div className="title-menu-container">
        <PageTitle title="Create New Recipe" />
      </div>
      <div className="add-recipe-container">
        <RecipeFormProvider>
          <AddRecipeForm 
            createRecipe={createRecipe} 
            loading={loading} 
            userId={currentUser.uid} 
            dishListParam={dishListId}
          />
        </RecipeFormProvider>
      </div>
    </div>
  );
};

export default AddRecipePage;