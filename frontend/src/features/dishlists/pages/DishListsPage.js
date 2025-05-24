import React, { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth } from "../../../contexts/AuthProvider";
import TopNav from "../../../components/layout/TopNav/TopNav";
import PageTitle from "../../../components/common/PageTitle/PageTitle";
import DishListTile from "../components/DishListsTile/DishListTile";
import DishListsMenu from "../components/DishListsMenu/DishListsMenu";
import DishListFooter from "../components/DishListsFooter/DishListFooter";
import LoadingState from "../../../components/common/LoadingState/LoadingState";
import { FETCH_DISHLISTS, ADD_DEFAULT_DISHLIST } from "../../../graphql";
import { useLocation } from "react-router-dom";
import styles from "./DishListsPage.module.css";

const DishListsPage = () => {
  const location = useLocation();
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
  const [searchTerm, setSearchTerm] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  const filterDishListsByMode = useCallback(
    (dishLists, mode) => {
      if (!dishLists || !currentUser) return;

      let filtered;
      switch (mode) {
        case "owned":
          filtered = dishLists.filter(
            (list) => list.userId === currentUser.uid
          );
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
        default:
          filtered = [...dishLists];
          break;
      }

      const sortedFiltered = [...filtered].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.title.localeCompare(b.title);
      });

      setFilteredDishLists(sortedFiltered);
    },
    [currentUser]
  );

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
    if (allDishLists.length > 0 && searchTerm) {
      try {
        const searchString = String(searchTerm).toLowerCase();
        const filtered = allDishLists.filter((list) =>
          list.title.toLowerCase().includes(searchString)
        );

        // Create a new array for sorting
        const sortedFiltered = [...filtered].sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return a.title.localeCompare(b.title);
        });

        // Use the sorted array for view mode filtering
        filterDishListsByMode(sortedFiltered, viewMode);
      } catch (error) {
        console.error("Error during search:", error);
        filterDishListsByMode(allDishLists, viewMode);
      }
    } else {
      filterDishListsByMode(allDishLists, viewMode);
    }
  }, [searchTerm, allDishLists, viewMode, filterDishListsByMode]);

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
      
      // Set initial loading to false once we have data
      setInitialLoading(false);
    }
  }, [data, currentUser, addDishList, viewMode, filterDishListsByMode]);

  // Add a timeout effect for the initial loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialLoading) {
        setInitialLoading(false);
      }
    }, 3000); // Set a maximum loading time of 3 seconds
    
    return () => clearTimeout(timer);
  }, [initialLoading]);

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

  useEffect(() => {
    if (location.state?.refresh && currentUser) {
      refetch();
    }
  }, [location.state, currentUser, refetch]);

  // Show loading state while authentication is being verified or data is loading
  if (!currentUser) {
    return <LoadingState message="Authenticating..." />;
  }
  
  if (loading || initialLoading) {
    return <LoadingState message="Loading your DishLists..." />;
  }
  
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error loading DishLists!</h2>
        <p>{error.message}</p>
        <button className={styles.refreshButton} onClick={() => refetch()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <TopNav
        pageType="dishlists"
        items={allDishLists}
        onSearch={(term) => setSearchTerm(term)}
      />

      <div className={styles.titleMenuContainer}>
        <PageTitle title="DishLists" />
        <div className={styles.viewControls}>
          <button
            className={`${styles.viewBtn} ${
              viewMode === "all" ? styles.activeViewBtn : ""
            }`}
            onClick={() => handleViewModeChange("all")}
          >
            All
          </button>
          <button
            className={`${styles.viewBtn} ${
              viewMode === "owned" ? styles.activeViewBtn : ""
            }`}
            onClick={() => handleViewModeChange("owned")}
          >
            My DishLists
          </button>
          <button
            className={`${styles.viewBtn} ${
              viewMode === "collaborated" ? styles.activeViewBtn : ""
            }`}
            onClick={() => handleViewModeChange("collaborated")}
          >
            Collaborations
          </button>
          <button
            className={`${styles.viewBtn} ${
              viewMode === "followed" ? styles.activeViewBtn : ""
            }`}
            onClick={() => handleViewModeChange("followed")}
          >
            Following
          </button>
        </div>
        <DishListsMenu
          dishLists={filteredDishLists}
          currentUserId={currentUser?.uid}
          isOwner={isOwner}
          isCollaborator={isCollaborator}
          isFollowing={isFollowing}
          refetch={refetch}
          onSelectionModeChange={handleSelectionModeChange}
          selectedDishList={selectedDishList}
        />

        {selectionMode && (
          <div className={styles.selectionModeIndicator}>
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