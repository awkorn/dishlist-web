import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TopNav from "../../../components/layout/TopNav/TopNav";
import styles from "./ImportRecipePage.module.css";
import { Info, ArrowLeft } from "lucide-react";
import { AI_ENDPOINTS } from "../../../config/api";

const ImportRecipePage = () => {
  const { id: dishListId } = useParams();
  const navigate = useNavigate();
  const [recipeText, setRecipeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleRecipeAnalysis = async () => {
    if (!recipeText.trim()) {
      toast.error("Please paste a recipe before analyzing");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await axios.post(AI_ENDPOINTS.PARSE_RECIPE, {
        recipeText,
      });

      if (!response.data) {
        throw new Error("Failed to analyze recipe");
      }

      // Navigate to review page with the parsed recipe data
      navigate(`/review-recipe/${dishListId}`, {
        state: { parsedRecipe: response.data.recipe },
      });
    } catch (err) {
      console.error("Error analyzing recipe:", err);
      setError(
        "Failed to analyze recipe. Please try again or enter the recipe manually."
      );
      toast.error("Error analyzing recipe");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/dishlist/${dishListId}`);
  };

  return (
    <div className={styles.pageContainer}>
      <TopNav />

      <div className={styles.importContainer}>
        <div className={styles.importHeader}>
          <button
            className={styles.backButton}
            onClick={handleGoBack}
            disabled={isAnalyzing}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <h1 className={styles.pageTitle}>Import Recipe</h1>
        </div>

        <div className={styles.descriptionWithIcon}>
          <p className={styles.pageDescription}>
            Paste a recipe from the web to import it into your DishList.
          </p>

          <div className={styles.infoContainer}>
            <div className={styles.infoIcon}>
              <Info size={20} />
              <div className={styles.infoTooltip}>
                For best results, view the recipe online, click "Print Recipe"
                (if available), and copy the content from the print view. This
                typically includes the most relevant information without ads and
                extra content.
              </div>
            </div>
          </div>
        </div>

        <div className={styles.recipeInputContainer}>
          <div
            contentEditable
            className={styles.recipeTextArea}
            onInput={(e) => setRecipeText(e.currentTarget.innerText)}
            data-placeholder="Paste recipe here..."
            role="textbox"
            aria-label="Recipe text"
          />
        </div>

        <div className={styles.analyzeButtonContainer}>
          <button
            className={styles.analyzeButton}
            onClick={handleRecipeAnalysis}
            disabled={isAnalyzing || !recipeText.trim()}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Recipe"}
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    </div>
  );
};

export default ImportRecipePage;
