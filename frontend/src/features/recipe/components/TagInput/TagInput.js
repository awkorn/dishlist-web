import React, { useState } from "react";
import { useRecipeForm } from "../../../../contexts/RecipeFormContext";
import "./TagInput.css";

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
    if (tag && !tag.includes(tag)) {
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
    <div className="tags-section">
      <h3>Tags</h3>
      {errors.tags && <p className="error-message">{errors.tags}</p>}

      <div className="tags-input-container">
        <div className="tags-display">
          {tags.map((tag, index) => (
            <span key={index} className="tag-pill">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="remove-tag-btn"
                aria-label="Remove tag"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="tag-input-row">
          <input
            type="text"
            placeholder="Add a tag (e.g., vegetarian, dessert, quick)"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={handleKeyDown}
            className="tag-input"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="add-tag-btn"
            disabled={!currentTag.trim()}
          >
            Add
          </button>
        </div>
      </div>

      <p className="tag-hint">Press Enter to add a tag</p>
    </div>
  );
};

export default TagInput;
