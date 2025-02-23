import React, { useState } from "react";
import { useMutation, useApolloClient, gql } from "@apollo/client";
import { useAuth } from "../../../contexts/AuthProvider";
import menuIcon from "../../../assets/icons/icon-menu.png";
import "./DishListsMenu.css";

const FETCH_DISHLISTS = gql`
  query GetDishLists($userId: String!) {
    getDishLists(userId: $userId) {
      id
      title
      isPinned
    }
  }
`;

//GraphQL Mutations
const ADD_DISHLIST = gql`
  mutation AddDishList($userId: String!, $title: String!, $isPinned: Boolean!) {
    addDishList(userId: $userId, title: $title, isPinned: $isPinned) {
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
const UNPIN_DISHLIST = gql`
  mutation UnpinDishList($id: ID!) {
    unpinDishList(id: $id) {
      id
      isPinned
    }
  }
`;

const DishListsMenu = ({ dishLists }) => {
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDishList, setSelectedDishList] = useState(null);
  const client = useApolloClient();

  //GraphQL Mutations
  const [addDishList] = useMutation(ADD_DISHLIST, {
    refetchQueries: ["GetDishLists"],
  });

  const [deleteDishList] = useMutation(DELETE_DISHLIST, {
    refetchQueries: [{ query: FETCH_DISHLISTS }],
  });

  const [editDishList] = useMutation(EDIT_DISHLIST, {
    refetchQueries: ["GetDishLists"],
  });

  const [pinDishList] = useMutation(PIN_DISHLIST, {
    refetchQueries: ["GetDishLists"],
  });

  const [unpinDishList] = useMutation(UNPIN_DISHLIST, {
    refetchQueries: ["GetDishLists"],
  });

  const handleAddDishList = () => {
    const title = prompt("Enter DishList title: ");
    if (title) {
      addDishList({
        variables: { userId: currentUser.uid, title, isPinned: false },
      });
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

  const handleDeleteDishList = async () => {
    if (!selectedDishList) return;
    if (window.confirm("Are you sure you want to delete DishList?")) {
      await deleteDishList({
        variables: { id: selectedDishList },
        refetchQueries: [
          { query: FETCH_DISHLISTS, variables: { userId: currentUser.uid } }
        ],
      });
    }
    setMenuOpen(false);
  };

  const handleTogglePinDishList = () => {
    if(!selectedDishList) return;

    const dishList = dishLists.find(dish => dish.id === selectedDishList)

    if (dishList?.isPinned) {
      unpinDishList({ variables: { id: selectedDishList } });
    } else {
      pinDishList({ variables: { id: selectedDishList } });
    }

    setMenuOpen(false);
  }

  const closeMenu = () => setMenuOpen(false);

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
          <button onClick={handleTogglePinDishList} disabled={!selectedDishList}>
            📌 {dishLists.find(dish => dish.id === selectedDishList)?.isPinned ? "Unpin" : "Pin"} DishList
          </button>
        </div>
      )}
    </div>
  );
};

export default DishListsMenu;
