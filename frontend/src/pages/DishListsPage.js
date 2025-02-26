import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useLazyQuery, gql } from "@apollo/client";
import { useAuth } from "../contexts/AuthProvider";
import TopNav from "../components/TopNav/TopNav";
import PageTitle from "../components/PageTitle/PageTitle";
import DishListTile from "../components/DishListsPage/DishListTile/DishListTile";
import DishListsMenu from "../components/DishListsPage/DishListsMenu/DishListsMenu";
import DishListFooter from "../components/DishListsPage/DishListsFooter/DishListFooter";

// Updated GraphQL Queries & Mutations
const FETCH_DISHLISTS = gql`
  query GetDishLists($userId: String!) {
    getDishLists(userId: $userId) {
      id
      title
      isPinned
      collaborators
      followers
      userId
      visibility
      sharedWith
      followRequests
      description
    }
  }
`;

const ADD_DEFAULT_DISHLIST = gql`
  mutation AddDishList(
    $userId: String!
    $title: String!
    $isPinned: Boolean!
    $visibility: String!
  ) {
    addDishList(
      userId: $userId
      title: $title
      isPinned: $isPinned
      visibility: $visibility
    ) {
      id
      title
      isPinned
      visibility
    }
  }
`;

const INVITE_COLLABORATOR = gql`
  mutation InviteCollaborator(
    $dishListId: ID!
    $targetUserId: String!
    $userId: String!
  ) {
    inviteCollaborator(
      dishListId: $dishListId
      targetUserId: $targetUserId
      userId: $userId
    ) {
      id
      collaborators
    }
  }
`;

const SEARCH_USERS = gql`
  query SearchUsers($searchTerm: String!, $limit: Int) {
    searchUsers(searchTerm: $searchTerm, limit: $limit) {
      id
      firebaseUid
      username
      email
      profilePicture
    }
  }
`;

const SHARE_DISHLIST = gql`
  mutation ShareDishList(
    $dishListId: ID!
    $userIds: [String!]!
    $userId: String!
  ) {
    shareDishList(dishListId: $dishListId, userIds: $userIds, userId: $userId) {
      id
      visibility
      sharedWith
    }
  }
`;

const DishListsPage = () => {
  const { currentUser, isOwner, isCollaborator, isFollowing } = useAuth();
  const { loading, error, data, refetch } = useQuery(FETCH_DISHLISTS, {
    variables: { userId: currentUser?.uid },
    skip: !currentUser,
  });

  const [filteredDishLists, setFilteredDishLists] = useState([]);
  const [allDishLists, setAllDishLists] = useState([]);
  const [viewMode, setViewMode] = useState("all"); // "all", "owned", "collaborated", "followed"

  const [addDishList] = useMutation(ADD_DEFAULT_DISHLIST, {
    onCompleted: () => refetch(),
  });

  const [inviteCollaborator] = useMutation(INVITE_COLLABORATOR);

  const [shareDishList] = useMutation(SHARE_DISHLIST);

  const [searchUsers] = useLazyQuery(SEARCH_USERS);

  useEffect(() => {
    if (data?.getDishLists) {
      console.log("All dishlists: ", data.getDishLists);
      setAllDishLists(data.getDishLists);
      filterDishListsByMode(data.getDishLists, viewMode);

      // Check if user has default "My Recipes" dishlist
      const userHasDefaultDishList = data.getDishLists.some(
        (list) =>
          list.userId === currentUser?.uid && list.title === "My Recipes"
      );

      if (currentUser && !userHasDefaultDishList) {
        console.log("Creating 'My Recipes' DishList for", currentUser.uid);
        addDishList({
          variables: {
            userId: currentUser.uid,
            title: "My Recipes",
            isPinned: true,
            visibility: "private",
          },
        });
      }
    }
  }, [data, currentUser, addDishList, viewMode]);

  const filterDishListsByMode = (dishLists, mode) => {
    if (!dishLists || !currentUser) return;

    let filtered;
    switch (mode) {
      case "owned":
        filtered = dishLists.filter((list) => list.userId === currentUser.uid);
        break;
      case "collaborated":
        filtered = dishLists.filter(
          (list) =>
            list.userId !== currentUser.uid &&
            list.collaborators.includes(currentUser.uid)
        );
        break;
      case "followed":
        filtered = dishLists.filter(
          (list) =>
            list.userId !== currentUser.uid &&
            !list.collaborators.includes(currentUser.uid) &&
            list.followers.includes(currentUser.uid)
        );
        break;
      default: // "all"
        filtered = dishLists;
    }
    setFilteredDishLists(filtered);
  };

  const handleInviteCollaborator = async (dishListId) => {
    // First check if user is the owner
    const dishList = allDishLists.find((list) => list.id === dishListId);
    if (!dishList || dishList.userId !== currentUser.uid) {
      alert("Only the owner can invite collaborators");
      return;
    }

    // Prompt for collaborator search
    const searchTerm = prompt("Search for users by email or username:");
    if (!searchTerm) return;

    try {
      // Search for users
      const { data } = await searchUsers({
        variables: { searchTerm, limit: 5 },
      });

      if (!data?.searchUsers?.length) {
        alert("No users found with that email or username");
        return;
      }

      // Create a list of users to choose from
      const userOptions = data.searchUsers.map(
        (user) => `${user.username} (${user.email})`
      );

      // Add option numbers
      const numberedOptions = userOptions.map(
        (option, index) => `${index + 1}. ${option}`
      );

      // Create a prompt message
      const promptMessage =
        "Select a user to invite (enter number):\n" +
        numberedOptions.join("\n");

      // Show prompt with options
      const selectedIndex = parseInt(prompt(promptMessage)) - 1;

      // Validate selection
      if (
        isNaN(selectedIndex) ||
        selectedIndex < 0 ||
        selectedIndex >= data.searchUsers.length
      ) {
        alert("Invalid selection");
        return;
      }

      const targetUser = data.searchUsers[selectedIndex];

      // Send invitation
      await inviteCollaborator({
        variables: {
          dishListId,
          targetUserId: targetUser.firebaseUid,
          userId: currentUser.uid,
        },
        onCompleted: () => {
          alert(`Invitation sent to ${targetUser.username}`);
          refetch();
        },
      });
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      alert("An error occurred while inviting the collaborator.");
    }
  };

  const handleShareDishList = async (dishListId) => {
    // First check if user is the owner
    const dishList = allDishLists.find((list) => list.id === dishListId);
    if (!dishList || dishList.userId !== currentUser.uid) {
      alert("Only the owner can share this dishlist");
      return;
    }

    // Prompt for user search
    const searchTerm = prompt(
      "Search for users by email or username to share with:"
    );
    if (!searchTerm) return;

    try {
      // Search for users
      const { data } = await searchUsers({
        variables: { searchTerm, limit: 5 },
      });

      if (!data?.searchUsers?.length) {
        alert("No users found with that email or username");
        return;
      }

      // Create a list of users to choose from
      const userOptions = data.searchUsers.map(
        (user) => `${user.username} (${user.email})`
      );

      // Add option numbers
      const numberedOptions = userOptions.map(
        (option, index) => `${index + 1}. ${option}`
      );

      // Create a prompt message
      const promptMessage =
        "Select a user to share with (enter number):\n" +
        numberedOptions.join("\n");

      // Show prompt with options
      const selectedIndex = parseInt(prompt(promptMessage)) - 1;

      // Validate selection
      if (
        isNaN(selectedIndex) ||
        selectedIndex < 0 ||
        selectedIndex >= data.searchUsers.length
      ) {
        alert("Invalid selection");
        return;
      }

      const targetUser = data.searchUsers[selectedIndex];

      // Share the dishlist
      await shareDishList({
        variables: {
          dishListId,
          userIds: [targetUser.firebaseUid],
          userId: currentUser.uid,
        },
        onCompleted: () => {
          alert(`DishList shared with ${targetUser.username}`);
          refetch();
        },
      });
    } catch (error) {
      console.error("Error sharing dishlist:", error);
      alert("An error occurred while sharing the dishlist.");
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    filterDishListsByMode(allDishLists, mode);
  };

  if (!currentUser) return <p>Please log in to view your DishLists.</p>;
  if (loading) return <p>Loading DishLists...</p>;
  if (error) return <p>Error loading DishLists!</p>;

  return (
    <div className="page-container">
      <TopNav
        pageType="dishlists"
        items={allDishLists}
        onSearch={(items) => filterDishListsByMode(items, viewMode)}
      />

      <div className="title-menu-container">
        <PageTitle title="DishLists" />
        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === "all" ? "active" : ""}`}
            onClick={() => handleViewModeChange("all")}
          >
            All
          </button>
          <button
            className={`view-btn ${viewMode === "owned" ? "active" : ""}`}
            onClick={() => handleViewModeChange("owned")}
          >
            My DishLists
          </button>
          <button
            className={`view-btn ${
              viewMode === "collaborated" ? "active" : ""
            }`}
            onClick={() => handleViewModeChange("collaborated")}
          >
            Collaborations
          </button>
          <button
            className={`view-btn ${viewMode === "followed" ? "active" : ""}`}
            onClick={() => handleViewModeChange("followed")}
          >
            Following
          </button>
        </div>
        <DishListsMenu
          dishLists={filteredDishLists}
          currentUserId={currentUser?.uid}
          isOwner={isOwner}
          refetch={refetch}
        />
      </div>

      <DishListTile
        dishLists={filteredDishLists}
        currentUserId={currentUser?.uid}
        onInviteCollaborator={handleInviteCollaborator}
        onShareDishList={handleShareDishList}
        isOwner={isOwner}
        isCollaborator={isCollaborator}
        isFollowing={isFollowing}
        refetch={refetch}
      />

      <DishListFooter />
    </div>
  );
};

export default DishListsPage;
