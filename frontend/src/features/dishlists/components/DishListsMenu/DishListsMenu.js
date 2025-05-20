import React, { useState, useEffect, useRef } from "react";
import { useMutation } from "@apollo/client";
import { useAuth } from "../../../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import styles from "./DishListsMenu.module.css";
import {
  CirclePlus,
  SquareMousePointer,
  Check,
  FilePenLine,
  BookX,
  Pin,
  Ellipsis,
} from "lucide-react";
import {
  DELETE_DISHLIST,
  PIN_DISHLIST,
  UNPIN_DISHLIST,
} from "../../../../graphql";

const DishListsMenu = ({
  dishLists,
  isOwner,
  refetch,
  onSelectionModeChange,
  selectedDishList,
}) => {
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [localSelectedDishList, setLocalSelectedDishList] = useState(null);
  const navigate = useNavigate();
  const menuRef = useRef(null); 

  // Update local state when prop changes
  useEffect(() => {
    setLocalSelectedDishList(selectedDishList);
  }, [selectedDishList]);

  // We'll use a special class to mark elements that shouldn't close selection mode
  const SELECTION_CLASS = "dish-list-selectable";

  useEffect(() => {
    function handleClickOutside(event) {
      // Don't close the menu or exit selection mode if clicking on a selectable tile
      const clickedSelectableTile = event.target.closest(`.${SELECTION_CLASS}`);
      if (clickedSelectableTile) {
        return;
      }

      // Only close menu if clicking outside of menu
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        
        // Only exit selection mode if:
        // - We're in selection mode AND
        // - We didn't click on a selectable item AND 
        // - We haven't already selected an item
        if (selectionMode && !localSelectedDishList) {
          toggleSelectionMode(false);
        }
      }
    }

    // Add the event listener for the entire document
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen, selectionMode, localSelectedDishList]);

  // GraphQL Mutations
  const [deleteDishList] = useMutation(DELETE_DISHLIST, {
    onCompleted: () => refetch(),
  });

  const [pinDishList] = useMutation(PIN_DISHLIST, {
    onCompleted: () => refetch(),
  });

  const [unpinDishList] = useMutation(UNPIN_DISHLIST, {
    onCompleted: () => refetch(),
  });

  const handleEditDishList = () => {
    if (!localSelectedDishList) {
      alert("Please select a DishList first");
      toggleSelectionMode(true);
      return;
    }

    // Check if user has permission
    const dishList = dishLists.find(
      (dish) => dish.id === localSelectedDishList
    );
    if (!dishList || !isOwner(localSelectedDishList)) {
      alert("You can only edit dishlists you own");
      return;
    }

    navigate(`/edit-dishlist/${localSelectedDishList}`, {
      state: { dishListId: localSelectedDishList, returnTo: "/dishlists" },
    });

    setMenuOpen(false);
    toggleSelectionMode(false);
  };

  const handleDeleteDishList = async () => {
    if (!localSelectedDishList) {
      alert("Please select a DishList first");
      toggleSelectionMode(true);
      return;
    }

    // Check if user has permission
    if (!isOwner(localSelectedDishList)) {
      alert("You can only delete dishlists you own");
      return;
    }

    // Check if it's my recipes dishlist
    const dishList = dishLists.find(
      (dish) => dish.id === localSelectedDishList
    );
    if (dishList && dishList.title === "My Recipes") {
      alert("The 'My Recipes' dishlist cannot be deleted");
      return;
    }

    if (window.confirm("Are you sure you want to delete this DishList?")) {
      await deleteDishList({
        variables: {
          id: localSelectedDishList,
          userId: currentUser.uid,
        },
      });
    }

    setMenuOpen(false);
    toggleSelectionMode(false);
  };

  const handleTogglePinDishList = () => {
    if (!localSelectedDishList) {
      alert("Please select a DishList first");
      toggleSelectionMode(true);
      return;
    }

    // Check if user has permission
    if (!isOwner(localSelectedDishList)) {
      alert("You can only pin/unpin dishlists you own");
      return;
    }

    const dishList = dishLists.find(
      (dish) => dish.id === localSelectedDishList
    );

    if (dishList && dishList.title === "My Recipes") {
      alert("The 'My Recipes' dishlist cannot be deleted");
      return;
    }

    if (dishList?.isPinned) {
      unpinDishList({
        variables: {
          id: localSelectedDishList,
          userId: currentUser.uid,
        },
      });
    } else {
      pinDishList({
        variables: {
          id: localSelectedDishList,
          userId: currentUser.uid,
        },
      });
    }

    setMenuOpen(false);
    toggleSelectionMode(false);
  };

  const toggleSelectionMode = (value) => {
    setSelectionMode(value);
    
    // Clear selected dishlist when exiting selection mode
    if (!value) {
      setLocalSelectedDishList(null);
    }
    
    // Notify the parent component about selection mode change
    if (onSelectionModeChange) {
      onSelectionModeChange(value);
    }
    
    // Keep menu open when entering selection mode
    if (value) {
      setMenuOpen(true);
    }
  };

  // Check if selected dishlist is owned by current user
  const selectedDishListOwned =
    localSelectedDishList &&
    dishLists.some(
      (dish) =>
        dish.id === localSelectedDishList && dish.userId === currentUser?.uid
    );

  // Find the selected dishlist
  const selectedDishListData = dishLists.find(
    (dish) => dish.id === localSelectedDishList
  );

  return (
    <div className={styles.menuContainer} ref={menuRef}>
      {/* Menu Icon */}
      <Ellipsis
        size={28}
        className={styles.headerMenu}
        onClick={() => setMenuOpen(!menuOpen)}
      />

      {/* Dropdown Menu - Always show when in selection mode */}
      {(menuOpen || (selectionMode && localSelectedDishList)) && (
        <div className={styles.menuOptions}>
          <button onClick={() => navigate("/create-dishlist")}>
            <CirclePlus size={18} className={styles.buttonIcon} /> Add DishList
          </button>

          <button
            onClick={() => toggleSelectionMode(!selectionMode)}
            className={selectionMode ? styles.activeOption : ""}
          >
            {selectionMode ? (
              <>
                <Check size={18} className={styles.buttonIcon} /> Select Mode
                (On)
              </>
            ) : (
              <>
                <SquareMousePointer size={18} className={styles.buttonIcon} />{" "}
                Select DishList
              </>
            )}
          </button>

          {selectionMode && (
            <div>
              <button
                onClick={handleEditDishList}
                disabled={!selectedDishListOwned}
                className={!selectedDishListOwned ? styles.disabledOption : ""}
              >
                <FilePenLine size={18} className={styles.buttonIcon} /> Edit
                DishList
              </button>

              <button
                onClick={handleDeleteDishList}
                disabled={!selectedDishListOwned}
                className={!selectedDishListOwned ? styles.disabledOption : ""}
              >
                <BookX size={18} className={styles.buttonIcon} /> Delete
                DishList
              </button>

              <button
                onClick={handleTogglePinDishList}
                disabled={!selectedDishListOwned}
                className={!selectedDishListOwned ? styles.disabledOption : ""}
              >
                <Pin size={18} className={styles.buttonIcon} />{" "}
                {selectedDishListData?.isPinned ? "Unpin" : "Pin"} DishList
              </button>
            </div>
          )}

          {localSelectedDishList && (
            <div className={styles.selectedDishInfo}>
              <p>
                Selected: <strong>{selectedDishListData?.title}</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DishListsMenu;