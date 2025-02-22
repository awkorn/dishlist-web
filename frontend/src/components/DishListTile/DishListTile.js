import React, { useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useAuth } from "../../contexts/AuthProvider";
import "./DishListTile.css";
import pinIcon from "../../assets/icons/pin-drawing.png";


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

const DishListTile = () => {
  const { currentUser } = useAuth();

  const { loading, error, data } = useQuery(FETCH_DISHLISTS, {
    skip: !currentUser,
    variables: { userId: currentUser.uid },
  });

  const [addDishList] = useMutation(ADD_DEFAULT_DISHLIST, {
    refetchQueries: [
      { query: FETCH_DISHLISTS, variables: { userId: currentUser?.uid } },
    ],
  });

  useEffect(() => {
    if (currentUser && data?.getDishLists?.length === 0) {
      //if user has no DishLists, create "User Recipes" as default
      addDishList({
        variables: {
          userId: currentUser.uid,
          title: "User Recipes",
          isPinned: true,
        },
      });
    }
  }, [currentUser, data, addDishList]);

  if (!currentUser) return <p>Please log in to view your DishLists.</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching Dishlists!</p>;

  return (
    <div className="dish-tiles">
      {data.getDishLists.map((dishlist) => (
        <div key={dishlist.id} className="dish-tile">
          <h3 className="list-title">{dishlist.title}</h3>
          {dishlist.isPinned && <img src={pinIcon} alt="pin" className="pin"/>}
        </div>
      ))}
    </div>
  );
};

export default DishListTile;
