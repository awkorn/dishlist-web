import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NavButtons = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="nav-buttons">
      <button
        className={`nav-btn ${
          location.pathname === "/dishlists" ? "active" : ""
        }`}
        onClick={() => navigate("/dishlists")}
      >
        DishLists
      </button>
      <button
        className={`nav-btn ${
          location.pathname === "/recipe-builder" ? "active" : ""
        }`}
        onClick={() => navigate("/recipe-builder")}
      >
        Recipe Builder
      </button>
      <button
        className={`nav-btn ${location.pathname === "/about" ? "active" : ""}`}
        onClick={() => navigate("/about")}
      >
        About
      </button>
    </div>
  );
};

export default NavButtons;
