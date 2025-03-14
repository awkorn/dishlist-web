import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { useAuth } from "../../../../contexts/AuthProvider";
import menuIcon from "../../../../assets/icons/icon-menu.png";
import { useNavigate } from "react-router-dom";
import styles from "./DishListsMenu.module.css";
import {
  DELETE_DISHLIST,
  EDIT_DISHLIST,
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

  // Update local state when prop changes
  useEffect(() => {
    setLocalSelectedDishList(selectedDishList);
  }, [selectedDishList]);

  // GraphQL Mutations
  const [deleteDishList] = useMutation(DELETE_DISHLIST, {
    onCompleted: () => refetch(),
  });

  const [editDishList] = useMutation(EDIT_DISHLIST, {
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

    const newTitle = prompt("Enter new title:", dishList.title);
    if (!newTitle) return;

    const currentDesc = dishList.description || "";
    const newDescription = prompt("Enter new description:", currentDesc);

    editDishList({
      variables: {
        id: localSelectedDishList,
        title: newTitle,
        description: newDescription,
        userId: currentUser.uid,
      },
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
    // Notify the parent component about selection mode change
    if (onSelectionModeChange) {
      onSelectionModeChange(value);
    }
    // Keep menu open when entering selection mode
    if (value) {
      setMenuOpen(true);
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    toggleSelectionMode(false);
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
    <div className={styles.menuContainer}>
      {/* Menu Icon */}
      <img
        src={menuIcon}
        alt="menu"
        className={styles.headerMenu}
        onClick={() => setMenuOpen(!menuOpen)}
      />

      {menuOpen && <div className="overlay" onClick={closeMenu}></div>}

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className={styles.menuOptions}>
          <button onClick={() => navigate("/create-dishlist")}>
            ➕ Add DishList
          </button>

          <button
            onClick={() => toggleSelectionMode(!selectionMode)}
            className={selectionMode ? styles.activeOption : ""}
          >
            {selectionMode ? "✓ Select Mode (On)" : "⬚ Select DishList"}
          </button>

          <button
            onClick={handleEditDishList}
            disabled={!selectedDishListOwned}
            className={!selectedDishListOwned ? styles.disabledOption : ""}
          >
            ✏️ Edit DishList
          </button>

          <button
            onClick={handleDeleteDishList}
            disabled={!selectedDishListOwned}
            className={!selectedDishListOwned ? styles.disabledOption : ""}
          >
            🗑 Delete DishList
          </button>

          <button
            onClick={handleTogglePinDishList}
            disabled={!selectedDishListOwned}
            className={!selectedDishListOwned ? styles.disabledOption : ""}
          >
            📌 {selectedDishListData?.isPinned ? "Unpin" : "Pin"} DishList
          </button>

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