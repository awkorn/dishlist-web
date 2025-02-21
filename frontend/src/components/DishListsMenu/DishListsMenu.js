import React, { useEffect, useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useAuth } from "../../contexts/AuthProvider";
import menuIcon from "../../assets/icons/icon-menu.png";
import "./DishListsMenu.css";

//GraphQL Mutations
const ADD_DISHLIST = gql`
  mutation AddDishList($userId: String!, $title: String!) {
    addDishList(userId: $userId, title: $title) {
      id
      userId
      title
      isPinned
    }
  }
`;
const DELETE_DISHLIST = gql`
  mutation RemoveDishList($id: ID!) {
    removeDishList(id: $id) {
      id
    }
  }
`;
const EDIT_DISHLIST = gql`
  mutation EditDishList($id: ID!, $title: String!) {
    editDishList(id: $id, title: $title) {
      id
      title
    }
  }
`;
const PIN_DISHLIST = gql`
  mutation PinDishList($id: ID!) {
    pinDishList(id: $id) {
      id
      isPinned
    }
  }
`;

const DishListsMenu = ({ dishLists }) => {
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDishList, setSelectedDishList] = useState(null);

  //GraphQL Mutations
  const [addDishList] = useMutation(ADD_DISHLIST, {
    refetchQueries: ["GetDishLists"],
  });

  const [deleteDishList] = useMutation(DELETE_DISHLIST, {
    refetchQueries: ["GetDishLists"],
  });

  const [editDishList] = useMutation(EDIT_DISHLIST, {
    refetchQueries: ["GetDishLists"],
  });

  const [pinDishList] = useMutation(PIN_DISHLIST, {
    refetchQueries: ["GetDishLists"],
  });

  const handleAddDishList = () => {
    const title = prompt("Enter DishList title: ");
    if (title) {
      addDishList({ variables: { userId: currentUser.uid, title } });
    }
    setMenuOpen(false);
  };

  const handleEditDishList = () => {
    if (!selectedDishList) return;
    const newTitle = prompt("Enter new title: ");
    if (newTitle) {
      editDishList({ variables: { id: selectedDishList, title: newTitle } });
    }
    setMenuOpen(false);
  };

  const handleDeleteDishList = () => {
    if (!selectedDishList) return;
    if (window.confirm("Are you sure you want to delete DishList?")) {
      deleteDishList({ variables: { id: selectedDishList } });
    }
    setMenuOpen(false);
  };

  const handlePinDishList = () => {
    if (!selectedDishList) return;
    pinDishList({ variables: { id: selectedDishList } });
    setMenuOpen(false);
  };

  return (
    <div className="menu-container">
      {/* Menu Icon */}
      <img
        src={menuIcon}
        alt="menu"
        className="menu-icon"
        onClick={() => setMenuOpen(!menuOpen)}
      />

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
            {dishLists.map((dish) => (
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
          <button onClick={handlePinDishList} disabled={!selectedDishList}>
            📌 Pin DishList
          </button>
        </div>
      )}
    </div>
  );
};

export default DishListsMenu;
