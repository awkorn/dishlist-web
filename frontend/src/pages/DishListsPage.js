import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useLazyQuery, gql } from "@apollo/client";
import { useAuth } from "../contexts/AuthProvider";
import TopNav from "../components/TopNav/TopNav";
import PageTitle from "../components/PageTitle/PageTitle";
import DishListTile from "../components/DishListsPage/DishListTile/DishListTile";
import DishListsMenu from "../components/DishListsPage/DishListsMenu/DishListsMenu";
import DishListFooter from "../components/DishListsPage/DishListsFooter/DishListFooter";
import branchDrawing from "../assets/images/one-line-branch.svg";

// GraphQL Queries & Mutations
const FETCH_DISHLISTS = gql`
  query GetDishLists($userId: String!) {
    getDishLists(userId: $userId) {
      id
      title
      isPinned
      collaborators
      userId
    }
  }
`;

const ADD_DEFAULT_DISHLIST = gql`
  mutation AddDishList(
    $userId: String!
    $title: String!
    $isPinned: Boolean!
    $collaborators: [String]
  ) {
    addDishList(
      userId: $userId
      title: $title
      isPinned: $isPinned
      collaborators: $collaborators
    ) {
      id
      title
      isPinned
      collaborators
    }
  }
`;

const INVITE_COLLABORATOR = gql`
  mutation InviteCollaborator($dishListId: ID!, $userId: String!) {
    inviteCollaborator(dishListId: $dishListId, userId: $userId) {
      id
      collaborators
    }
  }
`;

const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      id
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

  const [inviteCollaborator] = useMutation(INVITE_COLLABORATOR, {
    onCompleted: () => refetch(),
  });

  const [getUserByEmail] = useLazyQuery(GET_USER_BY_EMAIL);

  useEffect(() => {
    if (data?.getDishLists) {
      console.log("All dishlists: ", data.getDishLists);
  
      const userDishLists = data.getDishLists.filter(
        (list) =>
          list.userId === currentUser?.uid ||
          list.collaborators.includes(currentUser?.uid)
      );
  
      console.log("User's DishLists:", userDishLists);
  
      setAllDishLists(data.getDishLists);
      setFilteredDishLists(userDishLists);
  
      const userHasDefaultDishList = data.getDishLists.some(
        (list) => list.userId === currentUser?.uid && list.title === "User Recipes"
      );
  
      console.log("Does user have 'User Recipes'?", userHasDefaultDishList);
  
      if (currentUser && !userHasDefaultDishList) {
        console.log("Creating 'User Recipes' DishList for", currentUser.uid);
        addDishList({
          variables: {
            userId: currentUser.uid,
            title: "User Recipes",
            isPinned: true,
            collaborators: [],
          },
        });
      }
    }
  }, [data, currentUser]);
  

  const handleInviteCollaborator = (dishListId) => {
    const collaboratorEmail = prompt("Enter collaborator's email:");

    if (!collaboratorEmail) return;
    const collaboratorId = getUserByEmail(collaboratorEmail);

    if (collaboratorId) {
      inviteCollaborator({
        variables: { dishListId, userId: collaboratorId },
      });
    } else {
      alert("User not found.");
    }
  };

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
          src={branchDrawing}
          alt="branch-heading"
          className="branch-drawing"
        />
        <PageTitle title="DishLists" />
        <DishListsMenu dishLists={filteredDishLists} />
      </div>

      <DishListTile
        dishLists={filteredDishLists}
        onInviteCollaborator={handleInviteCollaborator}
      />

      <DishListFooter />
    </div>
  );
};

export default DishListsPage;
