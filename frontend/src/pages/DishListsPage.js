import React from "react";
import { useQuery, gql } from "@apollo/client";
import { useAuth } from "../contexts/AuthProvider";
import TopNav from "../components/TopNav/TopNav";
import PageTitle from "../components/PageTitle/PageTitle";
import DishListTile from "../components/DishListsPage/DishListTile/DishListTile";
import DishListsMenu from "../components/DishListsPage/DishListsMenu/DishListsMenu";
import DishListFooter from "../components/DishListsPage/DishListsFooter/DishListFooter";
import utensilDrawing from "../assets/images/utensils.svg";

// GraphQL Query
const FETCH_DISHLISTS = gql`
  query GetDishLists($userId: String!) {
    getDishLists(userId: $userId) {
      id
      title
      isPinned
    }
  }
`;

const DishListsPage = () => {
  const { currentUser } = useAuth();

  //fetch DishLists from GraphQL
  const { loading, error, data } = useQuery(FETCH_DISHLISTS, {
    variables: { userId: currentUser?.uid },
  });

  if (!currentUser) return <p>Please log in to view your DishLists.</p>;
  if (loading) return <p>Loading DishLists...</p>;
  if (error) return <p>Error loading DishLists!</p>;

  return (
    <div className="page-container">
      <TopNav pageType="dishlists" />

      <div className="title-menu-container">
        <img
          src={utensilDrawing}
          alt="utensil-heading"
          className="utensil-drawing"
        />
        <PageTitle title="DishLists" />
        <DishListsMenu dishLists={data?.getDishLists || []} />
      </div>

      <DishListTile dishLists={data?.getDishLists || []} />

      <DishListFooter />
    </div>
  );
};

export default DishListsPage;
