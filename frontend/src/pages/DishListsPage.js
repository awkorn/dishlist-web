import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth } from "../contexts/AuthProvider";
import TopNav from "../components/TopNav/TopNav";
import PageTitle from "../components/PageTitle/PageTitle";
import DishListTile from "../components/DishListsPage/DishListTile/DishListTile";
import DishListsMenu from "../components/DishListsPage/DishListsMenu/DishListsMenu";
import DishListFooter from "../components/DishListsPage/DishListsFooter/DishListFooter";
import { FETCH_DISHLISTS, ADD_DEFAULT_DISHLIST } from "../graphql";

const DishListsPage = () => {
  const { currentUser, isOwner, isCollaborator, isFollowing } = useAuth();
  const { loading, error, data, refetch } = useQuery(FETCH_DISHLISTS, {
    variables: { userId: currentUser?.uid },
    skip: !currentUser,
  });

  const [filteredDishLists, setFilteredDishLists] = useState([]);
  const [allDishLists, setAllDishLists] = useState([]);
  const [viewMode, setViewMode] = useState("all"); // "all", "owned", "collaborated", "followed"
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDishList, setSelectedDishList] = useState(null);

  const [addDishList] = useMutation(ADD_DEFAULT_DISHLIST, {
    onCompleted: (data) => {
      // Add the new DishList to the allDishLists array
      const updatedAllDishLists = [...allDishLists, data.addDishList];
      setAllDishLists(updatedAllDishLists);

      // Update the filtered DishLists with the new data
      filterDishListsByMode(updatedAllDishLists, viewMode);
    },
  });

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

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    filterDishListsByMode(allDishLists, mode);
  };

  const handleSelectionModeChange = (isActive) => {
    setSelectionMode(isActive);
    // Clear selection when exiting selection mode
    if (!isActive) {
      setSelectedDishList(null);
    }
  };

  const handleSelectDishList = (dishListId) => {
    setSelectedDishList(dishListId);
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
          onSelectionModeChange={handleSelectionModeChange}
          selectedDishList={selectedDishList}
        />

        {selectionMode && (
          <div className="selection-mode-indicator">
            <p>Select a DishList to edit, delete, or pin</p>
          </div>
        )}
      </div>

      <DishListTile
        dishLists={filteredDishLists}
        currentUserId={currentUser?.uid}
        isOwner={isOwner}
        isCollaborator={isCollaborator}
        isFollowing={isFollowing}
        refetch={refetch}
        selectionMode={selectionMode}
        selectedDishList={selectedDishList}
        onSelectDishList={handleSelectDishList}
      />

      <DishListFooter />
    </div>
  );
};

export default DishListsPage;
