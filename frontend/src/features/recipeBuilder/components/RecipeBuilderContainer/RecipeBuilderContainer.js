import React, { useState } from 'react';
import RecipeGenerationForm from '../RecipeGenerationForm/RecipeGenerationForm'
import GeneratedRecipeView from '../GeneratedRecipeView/GeneratedRecipeView';
import styles from './RecipeBuilderContainer.module.css';

const RecipeBuilderContainer = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerateRecipe = async (formData) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipe');
      }

      const data = await response.json();
      setGeneratedRecipe(data.recipe);
    } catch (err) {
      console.error('Error generating recipe:', err);
      setError('Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateRecipe = () => {
    setGeneratedRecipe(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.builderPanel}>
        <h1 className={styles.title}>Recipe Builder</h1>
        <p className={styles.subtitle}>Generate custom recipes based on ingredients, dietary preferences, and special requirements</p>
      
        {!generatedRecipe ? (
          <RecipeGenerationForm 
            onSubmit={handleGenerateRecipe} 
            isGenerating={isGenerating}
          />
        ) : (
          <GeneratedRecipeView 
            recipe={generatedRecipe}
            onRegenerate={handleRegenerateRecipe}
          />
        )}

        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    </div>
  );
};

export default RecipeBuilderContainer;