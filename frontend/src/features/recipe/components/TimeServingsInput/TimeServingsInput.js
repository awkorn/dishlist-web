import React from "react";
import { useRecipeForm } from "../../../../contexts/RecipeFormContext";
import styles from "./TimeServingsInput.module.css";

const TimeServingsInput = () => {
  const {
    prepTime,
    setPrepTime,
    cookTime,
    setCookTime,
    servings,
    setServings,
    errors,
  } = useRecipeForm();

  const handlePrepTimeChange = (e) => {
    const value = e.target.value;

    if (value === "" || /^\d+$/.test(value)) {
      const numericValue = value === "" ? "" : parseInt(value, 10);
      setPrepTime(numericValue);
    }
  };

  const increasePrepTime = () => {
    const currentValue = parseInt(prepTime, 10) || 0;
    const newValue = currentValue + 5;
    setPrepTime(newValue);
  };

  const decreasePrepTime = () => {
    const currentValue = parseInt(prepTime, 10) || 0;
    const newValue = Math.max(0, currentValue - 5);
    setPrepTime(newValue);
  };

  const handleCookTimeChange = (e) => {
    const value = e.target.value;

    if (value === "" || /^\d+$/.test(value)) {
      const numericValue = value === "" ? "" : parseInt(value, 10);
      setCookTime(numericValue);
    }
  };

  const increaseCookTime = () => {
    const currentValue = parseInt(cookTime, 10) || 0;
    const newValue = currentValue + 5;
    setCookTime(newValue);
  };

  const decreaseCookTime = () => {
    const currentValue = parseInt(cookTime, 10) || 0;
    const newValue = Math.max(0, currentValue - 5);
    setCookTime(newValue);
  };

  const handleServingsChange = (e) => {
    const value = e.target.value;

    if (value === "" || /^\d+$/.test(value)) {
      const numericValue = value === "" ? "" : parseInt(value, 10);
      setServings(numericValue);
    }
  };

  const increaseServings = () => {
    const currentValue = parseInt(servings, 10) || 0;
    const newValue = currentValue + 1;
    setServings(newValue);
  };

  const decreaseServings = () => {
    const currentValue = parseInt(servings, 10) || 0;
    const newValue = Math.max(1, currentValue - 1);
    setServings(newValue);
  };

  const calculateTotalTime = () => {
    const prepMinutes = parseInt(prepTime, 10) || 0;
    const cookMinutes = parseInt(cookTime, 10) || 0;
    return prepMinutes + cookMinutes;
  };

  const formatTime = (minutes) => {
    if (!minutes) return "0 min";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    let formattedTime = "";
    if (hours > 0) {
      formattedTime += `${hours} hr `;
    }
    if (remainingMinutes > 0 || hours === 0) {
      formattedTime += `${remainingMinutes} min`;
    }

    return formattedTime.trim();
  };

  return (
    <div className={styles.timeServingsSection}>
      <h3>Time & Servings</h3>

      <div className={styles.timeServingsGrid}>
        {/* Prep Time */}
        <div className={styles.timeServeInputGroup}>
          <label htmlFor="prep-time">Prep Time</label>
          <div className={styles.quantityInput}>
            <button
              type="button"
              className={styles.decrementBtn}
              onClick={decreasePrepTime}
              aria-label="Decrease prep time"
            >
              -
            </button>
            <input
              type="text"
              id="prep-time"
              value={prepTime}
              onChange={handlePrepTimeChange}
              placeholder="0"
              className={errors.prepTime ? styles.inputError : ""}
            />
            <button
              type="button"
              className={styles.incrementBtn}
              onClick={increasePrepTime}
              aria-label="Increase prep time"
            >
              +
            </button>
            <span className={styles.unitLabel}>min</span>
          </div>
        </div>

        {/* Cook Time */}
        <div className={styles.timeServeInputGroup}>
          <label htmlFor="cook-time">Cook Time</label>
          <div className={styles.quantityInput}>
            <button
              type="button"
              className={styles.decrementBtn}
              onClick={decreaseCookTime}
              aria-label="Decrease cook time"
            >
              -
            </button>
            <input
              type="text"
              id="cook-time"
              value={cookTime}
              onChange={handleCookTimeChange}
              placeholder="0"
              className={errors.cookTime ? styles.inputError : ""}
            />
            <button
              type="button"
              className={styles.incrementBtn}
              onClick={increaseCookTime}
              aria-label="Increase cook time"
            >
              +
            </button>
            <span className={styles.unitLabel}>min</span>
          </div>
        </div>

        {/* Servings */}
        <div className={styles.timeServeInputGroup}>
          <label htmlFor="servings">Servings</label>
          <div className={styles.quantityInput}>
            <button
              type="button"
              className={styles.decrementBtn}
              onClick={decreaseServings}
              aria-label="Decrease servings"
            >
              -
            </button>
            <input
              type="text"
              id="servings"
              value={servings}
              onChange={handleServingsChange}
              placeholder="0"
              className={errors.servings ? styles.inputError : ""}
            />
            <button
              type="button"
              className={styles.incrementBtn}
              onClick={increaseServings}
              aria-label="Increase servings"
            >
              +
            </button>
          </div>
        </div>

        <div className={styles.totalTime}>
          <span className={styles.totalTimeLabel}>Total Time:</span>
          <span className={styles.totalTimeValue}>
            {formatTime(calculateTotalTime())}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimeServingsInput;
