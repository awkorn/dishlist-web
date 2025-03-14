import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../TopNav.module.css";

const NavButtons = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="nav-buttons">
      <button
        className={`${styles.navBtn} ${
          location.pathname === "/dishlists" ? styles.active : ""
        }`}
        onClick={() => navigate("/dishlists")}
      >
        DishLists
      </button>
      <button
        className={`${styles.navBtn} ${
          location.pathname === "/recipe-builder" ? styles.active : ""
        }`}
        onClick={() => navigate("/recipe-builder")}
      >
        Recipe Builder
      </button>
      <button
        className={`${styles.navBtn} ${location.pathname === "/about" ? styles.active : ""}`}
        onClick={() => navigate("/about")}
      >
        About
      </button>
    </div>
  );
};

export default NavButtons;