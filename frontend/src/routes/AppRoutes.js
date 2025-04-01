import React from "react";
import { Routes, Route } from "react-router-dom";
import SignInPage from "../features/auth/pages/SignInPage";
import SignUpPage from "../features/auth/pages/SignUpPage";
import NotFound from "../components/common/NotFound/NotFound";
import DishListsPage from "../features/dishlists/pages/DishListsPage";
import AddDishListPage from "../features/dishlists/pages/AddDishListPage";
import DishListDetailPage from "../features/dishlist/pages/DishListDetailPage";
import AddRecipePage from "../features/recipe/pages/AddRecipePage";
import RecipeDetailPage from "../features/recipe/pages/RecipeDetailPage";
import RecipeBuilderPage from "../features/recipeBuilder/pages/RecipeBuilderPage";
import EditDishListPage from "../features/dishlists/pages/EditDishListPage";
import ProtectedRoute from "./ProtectedRoute";
import ProfilePage from "../features/profile/pages/ProfilePage"

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<SignInPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route
        path="/dishlists"
        element={
          <ProtectedRoute>
            <DishListsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dishlist/:id"
        element={
          <ProtectedRoute>
            <DishListDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-dishlist"
        element={
          <ProtectedRoute>
            <AddDishListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-recipe"
        element={
          <ProtectedRoute>
            <AddRecipePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipe/:id"
        element={
          <ProtectedRoute>
            <RecipeDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipe-builder"
        element={
          <ProtectedRoute>
            <RecipeBuilderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-dishlist/:id"
        element={
          <ProtectedRoute>
            <EditDishListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
