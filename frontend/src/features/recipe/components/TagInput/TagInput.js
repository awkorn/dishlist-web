import React, { useState } from "react";
import { useRecipeForm } from "../../../../contexts/RecipeFormContext";
import styles from "./TagInput.module.css";

const TagInput = () => {
  const { tags, setTags, errors } = useRecipeForm();
  const [currentTag, setCurrentTag] = useState("");

  // Add tag when Enter is pressed
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      addTag(currentTag.trim());
      setCurrentTag("");
    }
  };

  // Add tag
  const addTag = (tag) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  // Remove tag
  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Handle form submission for adding tag
  const handleAddTag = (e) => {
    e.preventDefault();
    if (currentTag.trim()) {
      addTag(currentTag.trim());
      setCurrentTag("");
    }
  };

  return (
    <div className={styles.tagsSection}>
      <h3>Tags</h3>
      {errors.tags && <p className={styles.errorMessage}>{errors.tags}</p>}

      <div className={styles.tagsInputContainer}>
        <div className={styles.tagsDisplay}>
          {tags.map((tag, index) => (
            <span key={index} className={styles.tagPill}>
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className={styles.removeTagBtn}
                aria-label="Remove tag"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className={styles.tagInputRow}>
          <input
            type="text"
            placeholder="Add a tag (e.g., vegetarian, dessert, quick)"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.tagInput}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className={styles.addTagBtn}
            disabled={!currentTag.trim()}
          >
            Add
          </button>
        </div>
      </div>

      <p className={styles.tagHint}>Press Enter to add a tag</p>
    </div>
  );
};

export default TagInput;