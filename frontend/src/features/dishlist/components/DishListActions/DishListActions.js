import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CirclePlus, 
  Import, 
  UserPlus, 
  FilePenLine, 
  Ellipsis 
} from "lucide-react";
import styles from "./DishListActions.module.css";

const DishListActions = ({ 
  dishListId, 
  userIsOwner, 
  userIsCollaborator, 
  onOpenInviteModal 
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Handle outside clicks to close the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEditDishList = () => {
    navigate(`/edit-dishlist/${dishListId}`);
    setMenuOpen(false);
  };

  const handleAddRecipe = () => {
    navigate(`/add-recipe?dishListId=${dishListId}`);
    setMenuOpen(false);
  };

  const handleImportRecipe = () => {
    navigate(`/import-recipe/${dishListId}`);
    setMenuOpen(false);
  };

  const handleInviteCollaborator = () => {
    onOpenInviteModal();
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className={styles.actionMenuContainer} ref={menuRef}>
      <button 
        className={styles.menuToggleButton}
        onClick={toggleMenu}
        aria-label="Open actions menu"
      >
        <Ellipsis size={24} />
      </button>

      {menuOpen && (
        <div className={styles.menuOptions}>
          {userIsOwner && (
            <button onClick={handleInviteCollaborator}>
              <UserPlus size={18} className={styles.buttonIcon} /> 
              Invite Collaborator
            </button>
          )}

          {userIsOwner && (
            <button onClick={handleEditDishList}>
              <FilePenLine size={18} className={styles.buttonIcon} /> 
              Edit DishList
            </button>
          )}

          {(userIsOwner || userIsCollaborator) && (
            <button onClick={handleAddRecipe}>
              <CirclePlus size={18} className={styles.buttonIcon} /> 
              Add Recipe
            </button>
          )}

          {(userIsOwner || userIsCollaborator) && (
            <button onClick={handleImportRecipe}>
              <Import size={18} className={styles.buttonIcon} /> 
              Import Recipe
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DishListActions;