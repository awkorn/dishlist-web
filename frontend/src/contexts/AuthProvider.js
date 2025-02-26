import React, { createContext, useContext, useEffect, useState } from "react";
import { useLazyQuery, useMutation, gql } from "@apollo/client";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/authService";

const AuthContext = createContext(null);

// Updated to include all user fields we need throughout the app
const GET_USER = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      id
      firebaseUid
      email
      username
      ownedDishLists
      followingDishLists
      collaboratedDishLists
      savedRecipes
      pendingFollowRequests
      notificationPreferences {
        collaborationInvites
        dishListShares
        recipeAdditions
        newFollowers
        systemAnnouncements
      }
      bio
      profilePicture
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($firebaseUid: String!, $email: String!, $username: String!) {
    createUser(firebaseUid: $firebaseUid, email: $email, username: $username) {
      id
      firebaseUid
      email
      username
      ownedDishLists
      followingDishLists
      collaboratedDishLists
      savedRecipes
      pendingFollowRequests
      notificationPreferences {
        collaborationInvites
        dishListShares
        recipeAdditions
        newFollowers
        systemAnnouncements
      }
    }
  }
`;

const GET_UNREAD_NOTIFICATIONS = gql`
  query GetUnreadNotificationCount($userId: String!) {
    getUnreadNotificationCount(userId: $userId)
  }
`;

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null); // Store MongoDB user details
  const [loading, setLoading] = useState(true); // Prevent flicker while checking auth status
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [getUserByEmail] = useLazyQuery(GET_USER, { fetchPolicy: "network-only" });
  const [createUser] = useMutation(CREATE_USER);
  const [getUnreadCount] = useLazyQuery(GET_UNREAD_NOTIFICATIONS);

  // Function to refresh notification count
  const refreshNotificationCount = async (userId) => {
    if (!userId) return;
    
    try {
      const { data } = await getUnreadCount({ 
        variables: { userId }
      });
      
      if (data) {
        setUnreadNotifications(data.getUnreadNotificationCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Fetch or create user in MongoDB
  const fetchOrCreateMongoUser = async (firebaseUser) => {
    try {
      // Try fetching the user from MongoDB via GraphQL
      const { data } = await getUserByEmail({ 
        variables: { email: firebaseUser.email }
      });
      
      if (data?.getUserByEmail) {
        setDbUser(data.getUserByEmail);
        // Refresh notification count after getting user
        refreshNotificationCount(data.getUserByEmail.firebaseUid);
        return data.getUserByEmail;
      } else {
        console.log("User not found in DB. Creating new user...");
        // If the user doesn't exist, create a new record in db 
        const { data: newUserData } = await createUser({
          variables: {
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            username: firebaseUser.displayName || "New User",
          },
        });
        
        if (newUserData?.createUser) {
          setDbUser(newUserData.createUser);
          return newUserData.createUser;
        }
      }
    } catch (error) {
      console.error("Error fetching/creating user:", error);
    }
    
    return null;
  };

  // Check if user is a collaborator on a dishlist
  const isCollaborator = (dishListId) => {
    return dbUser?.collaboratedDishLists?.includes(dishListId);
  };

  // Check if user is following a dishlist
  const isFollowing = (dishListId) => {
    return dbUser?.followingDishLists?.includes(dishListId);
  };

  // Check if user is the owner of a dishlist
  const isOwner = (dishListId) => {
    return dbUser?.ownedDishLists?.includes(dishListId);
  };

  // Check if user has a pending follow request for a dishlist
  const hasPendingRequest = (dishListId) => {
    return dbUser?.pendingFollowRequests?.includes(dishListId);
  };

  // Check if user has saved a recipe
  const hasSavedRecipe = (recipeId) => {
    return dbUser?.savedRecipes?.includes(recipeId);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchOrCreateMongoUser(user);
        setLoading(false);
      } else {
        setCurrentUser(null);
        setDbUser(null);
        setUnreadNotifications(0);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Expose both Firebase user and MongoDB user details
  const value = {
    currentUser,
    dbUser,
    unreadNotifications,
    refreshNotificationCount: () => refreshNotificationCount(dbUser?.firebaseUid),
    isCollaborator,
    isFollowing,
    isOwner,
    hasPendingRequest,
    hasSavedRecipe,
    refreshUserData: () => fetchOrCreateMongoUser(currentUser)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook for consuming auth context
export const useAuth = () => useContext(AuthContext);