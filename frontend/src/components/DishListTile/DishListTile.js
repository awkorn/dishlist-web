import React from "react";
import { useQuery, gql } from "@apollo/client";
import "./DishListTile.css";
import { useAuth } from "../../contexts/AuthProvider";

const FETCH_DISHLISTS = gql`
  query GetDishLists($userId: String!) {
    getDishLists(userId: $userId) {
      id
      title
      isPinned
    }
  }
`;

const DishListTile = () => {
  const { currentUser } = useAuth();

  const { loading, error, data } = useQuery(FETCH_DISHLISTS, {
    skip: !currentUser,
    variables: { userId: currentUser.uid },
  });

  if (!currentUser) return <p>Please log in to view your DishLists.</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching Dishlists!</p>;

  return (
    <div>
      {data.getDishLists.map((dishlist) => (
        <div key={dishlist.id}>
          <h3>{dishlist.title}</h3>
          {dishlist.isPinned && <span>📌 Pinned</span>}
        </div>
      ))}
    </div>
  );
};

export default DishListTile;
