import React from "react";
import { useQuery, gql } from "@apollo/client";
import TopNav from "../components/TopNav/TopNav";
import PageTitle from "../components/PageTitle/PageTitle";
import DishListTile from "../components/DishListTile/DishListTile";
import DishListsMenu from "../components/DishListsMenu/DishListsMenu";
import { useAuth } from "../contexts/AuthProvider";


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
    skip: !currentUser,
    variables: currentUser ? { userId: currentUser.uid } : {},
  });

  if (!currentUser) return <p>Please log in to view your DishLists.</p>;
  if (loading) return <p>Loading DishLists...</p>;
  if (error) return <p>Error loading DishLists!</p>;

  return (
    <>
      <TopNav pageType="dishlists" />

      <div className="title-menu-container">
        <PageTitle title="DishLists" />
        <DishListsMenu dishLists={data?.getDishLists || []} />
      </div>

      <DishListTile dishLists={data?.getDishLists || []} />
    </>
  );
};

export default DishListsPage;
