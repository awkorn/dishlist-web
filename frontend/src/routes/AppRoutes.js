import React from "react";
import { Routes, Route } from "react-router-dom";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import NotFound from "../components/NotFound/NotFound";
import DishListsPage from "../pages/DishListsPage";
import AddDishListPage from "../pages/AddDishListPage";
import ProtectedRoute from "./ProtectedRoute";

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
        path="/create-dishlist"
        element={
          <ProtectedRoute>
            <AddDishListPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
