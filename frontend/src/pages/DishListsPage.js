import React, { useEffect, useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useAuth } from "../contexts/AuthProvider";
import TopNav from "../components/TopNav/TopNav";
import PageTitle from "../components/PageTitle/PageTitle";
import DishListTile from "../components/DishListsPage/DishListTile/DishListTile";
import DishListsMenu from "../components/DishListsPage/DishListsMenu/DishListsMenu";
import DishListFooter from "../components/DishListsPage/DishListsFooter/DishListFooter";
import utensilDrawing from "../assets/images/utensils.svg";

// GraphQL Queries & Mutations
const FETCH_DISHLISTS = gql`
  query GetDishLists($userId: String!) {
    getDishLists(userId: $userId) {
      id
      title
      isPinned
    }
  }
`;

const ADD_DEFAULT_DISHLIST = gql`
  mutation AddDishList($userId: String!, $title: String!, $isPinned: Boolean!) {
    addDishList(userId: $userId, title: $title, isPinned: $isPinned) {
      id
      title
      isPinned
    }
  }
`;

const DishListsPage = () => {
  const { currentUser } = useAuth();
  const { loading, error, data, refetch } = useQuery(FETCH_DISHLISTS, {
    variables: { userId: currentUser?.uid },
    skip: !currentUser,
  });

  const [filteredDishLists, setFilteredDishLists] = useState([]);
  const [allDishLists, setAllDishLists] = useState([]);

  const [addDishList] = useMutation(ADD_DEFAULT_DISHLIST, {
    onCompleted: () => refetch(),
  });

  //update filteredDishLists when data is loaded
  useEffect(() => {
    if (data?.getDishLists) {
      setAllDishLists(data.getDishLists);
      setFilteredDishLists(data.getDishLists);
      
      //create default "User Recipes" DishList if none exist
      if (currentUser && data.getDishLists.length === 0) {
        addDishList({
          variables: {
            userId: currentUser.uid,
            title: "User Recipes",
            isPinned: true,
          },
        });
      }
    }
  }, [data, addDishList, currentUser]);

  if (!currentUser) return <p>Please log in to view your DishLists.</p>;
  if (loading) return <p>Loading DishLists...</p>;
  if (error) return <p>Error loading DishLists!</p>;

  return (
    <div className="page-container">
      <TopNav
        pageType="dishlists"
        items={allDishLists}
        onSearch={setFilteredDishLists}
      />

      <div className="title-menu-container">
        <img
          src={utensilDrawing}
          alt="utensil-heading"
          className="utensil-drawing"
        />
        <PageTitle title="DishLists" />
        <DishListsMenu dishLists={filteredDishLists} />
      </div>

      <DishListTile dishLists={filteredDishLists} />

      <DishListFooter />
    </div>
  );
};

export default DishListsPage;
