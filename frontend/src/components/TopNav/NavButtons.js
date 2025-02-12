import React from "react";
import { useNavigate } from "react-router-dom";

const NavButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="nav-buttons">
      <button className="nav-btn" onClick={() => navigate("/dishlists")}>
        DishLists
      </button>
      <button className="nav-btn" onClick={() => navigate("/recipe-builder")}>
        Recipe Builder
      </button>
      <button className="nav-btn" onClick={() => navigate("/about")}>
        About
      </button>
    </div>
  );
};

export default NavButtons;
