import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthProvider";
import { GET_DISHLIST_DETAIL, GET_DISHLIST_RECIPES } from "../../../graphql/queries/dishListDetail";
import TopNav from "../../../components/layout/TopNav/TopNav";
import DishListHeader from "../components/DishListHeader/DishListHeader";
import RecipeList from "../components/RecipeList/RecipeList";
import DishListActions from "../components/DishListActions/DishListActions";
import PageTitle from "../../../components/common/PageTitle/PageTitle";
import "./DishListDetailPage.css";

const DishListDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, dbUser, isOwner, isCollaborator, isFollowing } = useAuth();
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  
  // Fetch dishlist details
  const { 
    loading: dishListLoading, 
    error: dishListError, 
    data: dishListData 
  } = useQuery(GET_DISHLIST_DETAIL, {
    variables: { 
      id, 
      userId: currentUser?.uid 
    },
    skip: !currentUser?.uid,
    fetchPolicy: "cache-and-network"
  });

  // Fetch dishlist recipes
  const { 
    loading: recipesLoading, 
    error: recipesError, 
    data: recipesData 
  } = useQuery(GET_DISHLIST_RECIPES, {
    variables: { 
      dishListId: id, 
      userId: currentUser?.uid 
    },
    skip: !currentUser?.uid,
    fetchPolicy: "cache-and-network"
  });

  // Update filtered recipes when data changes
  useEffect(() => {
    if (recipesData?.getDishListRecipes) {
      setFilteredRecipes(recipesData.getDishListRecipes);
    }
  }, [recipesData]);

  // Handle search functionality
  const handleSearch = (searchResults) => {
    setFilteredRecipes(searchResults);
  };

  // Determine user role for this dishlist
  const getUserRole = () => {
    if (!dishListData?.getDishList) return null;
    
    const { userId, collaborators, followers } = dishListData.getDishList;
    
    if (userId === currentUser?.uid) return "owner";
    if (collaborators.includes(currentUser?.uid)) return "collaborator";
    if (followers.includes(currentUser?.uid)) return "follower";
    return "visitor";
  };

  // Handle navigation back to dishlists page
  const handleBackClick = () => {
    navigate("/dishlists");
  };

  // Show loading state
  if (dishListLoading || recipesLoading) {
    return (
      <div className="dishlist-detail-page">
        <TopNav />
        <div className="container">
          <div className="loading">Loading dishlist details...</div>
        </div>
      </div>
    );
  }

  // Handle errors
  if (dishListError || recipesError) {
    const errorMessage = dishListError?.message || recipesError?.message;
    toast.error(`Error: ${errorMessage}`);
    return (
      <div className="dishlist-detail-page">
        <TopNav />
        <div className="container">
          <div className="error">
            <h2>Error loading dishlist</h2>
            <p>{errorMessage}</p>
            <button onClick={handleBackClick} className="back-button">
              Back to DishLists
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dishList = dishListData?.getDishList;
  const recipes = recipesData?.getDishListRecipes || [];
  const userRole = getUserRole();

  // If data is loaded but dishlist doesn't exist or user doesn't have access
  if (!dishList) {
    return (
      <div className="dishlist-detail-page">
        <TopNav />
        <div className="container">
          <div className="not-found">
            <h2>DishList Not Found</h2>
            <p>The dishlist you're looking for doesn't exist or you don't have permission to view it.</p>
            <button onClick={handleBackClick} className="back-button">
              Back to DishLists
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dishlist-detail-page">
      <TopNav 
        pageType="recipes" 
        items={recipes} 
        onSearch={handleSearch} 
      />
      
      <div className="container">
        <button onClick={handleBackClick} className="back-button">
          ← Back to DishLists
        </button>
        
        <DishListHeader 
          dishList={dishList} 
          userRole={userRole}
        />
        
        <DishListActions 
          dishList={dishList} 
          userRole={userRole}
          currentUserId={currentUser?.uid}
        />
        
        <RecipeList 
          recipes={filteredRecipes} 
          dishListId={id}
          userRole={userRole}
          currentUserId={currentUser?.uid}
        />
      </div>
    </div>
  );
};

export default DishListDetailPage;