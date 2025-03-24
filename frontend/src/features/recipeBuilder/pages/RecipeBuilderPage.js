import React from "react";
import { useAuth } from "../../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import TopNav from "../../../components/layout/TopNav/TopNav";
import RecipeBuilderContainer from "../components/RecipeBuilderContainer/RecipeBuilderContainer";
import styles from "./RecipeBuilderPage.module.css";

const RecipeBuilderPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className={styles.pageContainer}>
        <TopNav />
        <div className={styles.unauthorizedMessage}>
          <h2>Please sign in to use the Recipe Builder</h2>
          <p>
            Create an account or sign in to generate and save custom recipes.
          </p>
          <button
            className={styles.signInButton}
            onClick={() => navigate("/signin")}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <TopNav pageType="recipe-builder" />
      <RecipeBuilderContainer />
    </div>
  );
};

export default RecipeBuilderPage;
