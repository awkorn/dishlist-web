import React from "react";
import styles from "./RecipeTags.module.css";

const RecipeTags = ({ tags }) => {
  if (!tags || tags.length === 0) {
    return null;
  }
  
  return (
    <div className={styles.tagsSection}>
      <h3 className={styles.tagsTitle}>Tags</h3>
      
      <div className={styles.tagsList}>
        {tags.map((tag, index) => (
          <span key={index} className={styles.tagPill}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RecipeTags;