import React, { useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useAuth } from "../../contexts/AuthProvider";
import "./DishListsMenu.css";

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

const DishListsMenu = ({}) => {
  //refresh dishlists after adding new one
  const [addDishList] = useMutation(ADD_DISHLIST, {
    refetchQueries: ["GetDishLists"],
  });

  return <></>;
};

export default DishListsMenu;
