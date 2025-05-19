import React, { useState } from 'react';
import styles from './RecipeGenerationForm.module.css';

const RecipeGenerationForm = ({ onSubmit, isGenerating }) => {
  const [ingredients, setIngredients] = useState(['']);
  const [dietaryRestrictions, setDietaryRestrictions] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    nutFree: false,
    keto: false,
    paleo: false,
  });
  const [macros, setMacros] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle ingredient field changes
  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = value;
    setIngredients(updatedIngredients);
  };

  // Add a new ingredient field
  const addIngredientField = () => {
    setIngredients([...ingredients, '']);
  };

  // Remove an ingredient field
  const removeIngredientField = (index) => {
    if (ingredients.length > 1) {
      const updatedIngredients = [...ingredients];
      updatedIngredients.splice(index, 1);
      setIngredients(updatedIngredients);
    }
  };

  // Toggle dietary restriction
  const toggleDietaryRestriction = (restriction) => {
    setDietaryRestrictions({
      ...dietaryRestrictions,
      [restriction]: !dietaryRestrictions[restriction],
    });
  };

  // Handle macro input changes
  const handleMacroChange = (macro, value) => {
    if (value === '' || /^\d+$/.test(value)) {
      setMacros({
        ...macros,
        [macro]: value,
      });
    }
  };

  // Handle special instructions changes
  const handleSpecialInstructionsChange = (e) => {
    setSpecialInstructions(e.target.value);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    const hasIngredients = ingredients.some(ing => ing.trim() !== '');
    if (!hasIngredients) {
      newErrors.ingredients = 'Please enter at least one ingredient';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Filter out empty ingredients
    const filteredIngredients = ingredients.filter(ing => ing.trim() !== '');

    // Prepare form data
    const formData = {
      ingredients: filteredIngredients,
      dietaryRestrictions: Object.keys(dietaryRestrictions).filter(
        key => dietaryRestrictions[key]
      ),
      specialInstructions: specialInstructions.trim(),
    };

    // Add macros if they are provided
    if (macros.calories || macros.protein || macros.carbs || macros.fat) {
      formData.macros = {
        calories: macros.calories ? parseInt(macros.calories) : undefined,
        protein: macros.protein ? parseInt(macros.protein) : undefined,
        carbs: macros.carbs ? parseInt(macros.carbs) : undefined,
        fat: macros.fat ? parseInt(macros.fat) : undefined,
      };
    }

    onSubmit(formData);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Ingredients Section */}
      <div className={styles.sectionContainer}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Ingredients</h2>
          <p className={styles.sectionDescription}>
            Enter ingredients you'd like to use in your recipe
          </p>

          <div className={styles.ingredientsList}>
            {ingredients.map((ingredient, index) => (
              <div key={index} className={styles.ingredientRow}>
                <input
                  type="text"
                  className={styles.ingredientInput}
                  placeholder={`Ingredient ${index + 1}`}
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeIngredientBtn}
                    onClick={() => removeIngredientField(index)}
                    aria-label="Remove ingredient"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            className={styles.addIngredientBtn}
            onClick={addIngredientField}
          >
            + Add Another Ingredient
          </button>

          {errors.ingredients && (
            <div className={styles.errorMessage}>{errors.ingredients}</div>
          )}
        </div>
      </div>

      {/* Special Instructions Section */}
      <div className={styles.sectionContainer}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Special Instructions</h2>
          <p className={styles.sectionDescription}>
            Add any specific preferences, cooking methods, or requirements for your recipe
          </p>
          
          <textarea
            className={styles.specialInstructionsInput}
            placeholder="Examples: 'Make it a slow cooker recipe', 'Suitable for picnic', 'Quick weeknight dinner', 'Spicy Thai-inspired dish'"
            value={specialInstructions}
            onChange={handleSpecialInstructionsChange}
            rows={3}
          />
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <div className={styles.advancedToggle}>
        <button
          type="button"
          className={styles.advancedToggleBtn}
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        >
          {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
          <span className={`${styles.toggleArrow} ${showAdvancedOptions ? styles.expanded : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {/* Advanced Options (conditional) */}
      {showAdvancedOptions && (
        <div className={styles.advancedOptionsContainer}>
          {/* Dietary Restrictions Section */}
          <div className={styles.sectionContainer}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Dietary Preferences</h2>
              <p className={styles.sectionDescription}>
                Select any dietary restrictions or preferences
              </p>

              <div className={styles.dietaryOptions}>
                {Object.keys(dietaryRestrictions).map((restriction) => (
                  <div key={restriction} className={styles.dietaryOption}>
                    <input
                      type="checkbox"
                      id={restriction}
                      checked={dietaryRestrictions[restriction]}
                      onChange={() => toggleDietaryRestriction(restriction)}
                      className={styles.dietaryCheckbox}
                    />
                    <label htmlFor={restriction} className={styles.dietaryLabel}>
                      {restriction === 'glutenFree' 
                        ? 'Gluten-Free' 
                        : restriction === 'dairyFree' 
                        ? 'Dairy-Free'
                        : restriction === 'nutFree'
                        ? 'Nut-Free'
                        : restriction.charAt(0).toUpperCase() + restriction.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Macros Section */}
          <div className={styles.sectionContainer}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Target Macros (per serving)</h2>
              <p className={styles.sectionDescription}>
                Optionally specify target macro values for your recipe
              </p>

              <div className={styles.macrosGrid}>
                <div className={styles.macroInput}>
                  <label htmlFor="calories">Calories</label>
                  <input
                    type="text"
                    id="calories"
                    placeholder="e.g., 500"
                    value={macros.calories}
                    onChange={(e) => handleMacroChange('calories', e.target.value)}
                  />
                </div>

                <div className={styles.macroInput}>
                  <label htmlFor="protein">Protein (g)</label>
                  <input
                    type="text"
                    id="protein"
                    placeholder="e.g., 30"
                    value={macros.protein}
                    onChange={(e) => handleMacroChange('protein', e.target.value)}
                  />
                </div>

                <div className={styles.macroInput}>
                  <label htmlFor="carbs">Carbs (g)</label>
                  <input
                    type="text"
                    id="carbs"
                    placeholder="e.g., 50"
                    value={macros.carbs}
                    onChange={(e) => handleMacroChange('carbs', e.target.value)}
                  />
                </div>

                <div className={styles.macroInput}>
                  <label htmlFor="fat">Fat (g)</label>
                  <input
                    type="text"
                    id="fat"
                    placeholder="e.g., 20"
                    value={macros.fat}
                    onChange={(e) => handleMacroChange('fat', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className={styles.formActions}>
        <button
          type="submit"
          className={styles.generateBtn}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating Recipe...' : 'Generate Recipe'}
        </button>
      </div>
    </form>
  );
};

export default RecipeGenerationForm;