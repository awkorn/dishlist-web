import React from "react";
import styles from "./ProfileTabs.module.css";

const ProfileTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "dishlists" ? styles.activeTab : ""
          }`}
          onClick={() => onTabChange("dishlists")}
        >
          DishLists
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "recipes" ? styles.activeTab : ""
          }`}
          onClick={() => onTabChange("recipes")}
        >
          Recipes
        </button>
      </div>
    </div>
  );
};

export default ProfileTabs;
