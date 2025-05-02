import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CirclePlus, 
  Import, 
  UserPlus, 
  FilePenLine, 
  Ellipsis,
  Users
} from "lucide-react";
import styles from "./DishListActions.module.css";

const DishListActions = ({ 
  dishListId, 
  userIsOwner, 
  userIsCollaborator, 
  onOpenInviteModal,
  collaborators = []
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Handle outside clicks to close the menu and collaborators
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setShowCollaborators(false);
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
    // Close collaborators panel when menu is opened
    if (!menuOpen) {
      setShowCollaborators(false);
    }
  };

  const toggleCollaborators = (e) => {
    e.stopPropagation();
    setShowCollaborators(!showCollaborators);
    // Close menu when collaborators is opened
    if (!showCollaborators) {
      setMenuOpen(false);
    }
  };

  return (
    <div className={styles.actionsContainer} ref={menuRef}>
      {/* Collaborators link/button */}
      {collaborators.length > 0 && (
        <div className={styles.collaboratorsLink} onClick={toggleCollaborators}>
          <Users size={16} className={styles.collaboratorsIcon} />
          <span className={styles.collaboratorsText}>
            {collaborators.length} {collaborators.length === 1 ? 'Collaborator' : 'Collaborators'}
          </span>
          
          {showCollaborators && (
            <div className={styles.collaboratorsPopup}>
              <h4 className={styles.collaboratorsTitle}>Collaborators</h4>
              <ul className={styles.collaboratorsList}>
                {collaborators.map((collaborator, index) => (
                  <li key={index} className={styles.collaboratorItem}>
                    <div className={styles.collaboratorAvatar}>
                      {collaborator.username ? collaborator.username.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className={styles.collaboratorName}>
                      {collaborator.username || `Collaborator ${index + 1}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Actions menu button */}
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