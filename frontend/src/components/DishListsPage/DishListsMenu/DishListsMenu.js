import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useAuth } from "../../../contexts/AuthProvider";
import menuIcon from "../../../assets/icons/icon-menu.png";
import "./DishListsMenu.css";

// GraphQL Mutations
const ADD_DISHLIST = gql`
  mutation AddDishList(
    $userId: String!
    $title: String!
    $isPinned: Boolean!
    $description: String
    $visibility: String!
  ) {
    addDishList(
      userId: $userId
      title: $title
      isPinned: $isPinned
      description: $description
      visibility: $visibility
    ) {
      id
      userId
      title
      isPinned
      description
      visibility
    }
  }
`;

const DELETE_DISHLIST = gql`
  mutation RemoveDishList($id: ID!, $userId: String!) {
    removeDishList(id: $id, userId: $userId) {
      id
    }
  }
`;

const EDIT_DISHLIST = gql`
  mutation EditDishList(
    $id: ID!
    $title: String!
    $userId: String!
    $description: String
  ) {
    editDishList(
      id: $id
      title: $title
      userId: $userId
      description: $description
    ) {
      id
      title
      userId
      description
    }
  }
`;

const PIN_DISHLIST = gql`
  mutation PinDishList($id: ID!, $userId: String!) {
    pinDishList(id: $id, userId: $userId) {
      id
      isPinned
    }
  }
`;

const UNPIN_DISHLIST = gql`
  mutation UnpinDishList($id: ID!, $userId: String!) {
    unpinDishList(id: $id, userId: $userId) {
      id
      isPinned
    }
  }
`;

const DishListsMenu = ({ dishLists, isOwner, refetch }) => {
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDishList, setSelectedDishList] = useState(null);

  // GraphQL Mutations
  const [addDishList] = useMutation(ADD_DISHLIST, {
    onCompleted: () => refetch(),
  });

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

  const handleAddDishList = () => {
    const title = prompt("Enter DishList title: ");
    if (!title) return;

    const description = prompt("Enter a description (optional): ");

    const visibilityOptions =
      "Select visibility:\n1. Public\n2. Private\n3. Shared";
    const visibilityChoice = prompt(visibilityOptions, "2");

    let visibility = "private"; // Default
    if (visibilityChoice === "1") visibility = "public";
    if (visibilityChoice === "3") visibility = "shared";

    addDishList({
      variables: {
        userId: currentUser.uid,
        title,
        isPinned: false,
        description: description || "",
        visibility,
      },
    });

    setMenuOpen(false);
  };

  const handleEditDishList = () => {
    if (!selectedDishList) return;

    // Check if user has permission
    const dishList = dishLists.find((dish) => dish.id === selectedDishList);
    if (!dishList || !isOwner(selectedDishList)) {
      alert("You can only edit dishlists you own");
      return;
    }

    const newTitle = prompt("Enter new title:", dishList.title);
    if (!newTitle) return;

    const currentDesc = dishList.description || "";
    const newDescription = prompt("Enter new description:", currentDesc);

    editDishList({
      variables: {
        id: selectedDishList,
        title: newTitle,
        description: newDescription,
        userId: currentUser.uid,
      },
    });

    setMenuOpen(false);
  };

  const handleDeleteDishList = async () => {
    if (!selectedDishList) return;

    // Check if user has permission
    if (!isOwner(selectedDishList)) {
      alert("You can only delete dishlists you own");
      return;
    }

    if (window.confirm("Are you sure you want to delete this DishList?")) {
      await deleteDishList({
        variables: {
          id: selectedDishList,
          userId: currentUser.uid,
        },
      });
    }

    setMenuOpen(false);
  };

  const handleTogglePinDishList = () => {
    if (!selectedDishList) return;

    // Check if user has permission
    if (!isOwner(selectedDishList)) {
      alert("You can only pin/unpin dishlists you own");
      return;
    }

    const dishList = dishLists.find((dish) => dish.id === selectedDishList);

    if (dishList?.isPinned) {
      unpinDishList({
        variables: {
          id: selectedDishList,
          userId: currentUser.uid,
        },
      });
    } else {
      pinDishList({
        variables: {
          id: selectedDishList,
          userId: currentUser.uid,
        },
      });
    }

    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  // Filter dishlists for the dropdown to only show those the user can modify
  const editableDishLists = dishLists.filter((dish) => isOwner(dish.id));

  return (
    <div className="menu-container">
      {/* Menu Icon */}
      <img
        src={menuIcon}
        alt="menu"
        className="header-menu"
        onClick={() => setMenuOpen(!menuOpen)}
      />

      {menuOpen && <div className="overlay" onClick={closeMenu}></div>}

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="menu-options">
          <button onClick={handleAddDishList}>➕ Add DishList</button>

          <select
            onChange={(e) => setSelectedDishList(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Select DishList
            </option>
            {editableDishLists.map((dish) => (
              <option key={dish.id} value={dish.id}>
                {dish.title}
              </option>
            ))}
          </select>

          <button onClick={handleEditDishList} disabled={!selectedDishList}>
            ✏️ Edit DishList
          </button>
          <button onClick={handleDeleteDishList} disabled={!selectedDishList}>
            🗑 Delete DishList
          </button>
          <button
            onClick={handleTogglePinDishList}
            disabled={!selectedDishList}
          >
            📌{" "}
            {dishLists.find((dish) => dish.id === selectedDishList)?.isPinned
              ? "Unpin"
              : "Pin"}{" "}
            DishList
          </button>
        </div>
      )}
    </div>
  );
};

export default DishListsMenu;
