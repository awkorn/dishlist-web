'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useLazyQuery, gql } from "@apollo/client";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/services/authService";

// Define TypeScript types for your context
type AuthContextType = {
  currentUser: any | null;
  dbUser: any | null;
  unreadNotifications: number;
  refreshNotificationCount: () => Promise<void>;
  isCollaborator: (dishListId: string) => boolean;
  isFollowing: (dishListId: string) => boolean;
  isOwner: (dishListId: string) => boolean;
  hasPendingRequest: (dishListId: string) => boolean;
  hasSavedRecipe: (recipeId: string) => boolean;
  refreshUserData: () => Promise<any | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const GET_USER = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      id
      firebaseUid
      email
      username
      firstName
      lastName
      ownedDishLists
      followingDishLists
      collaboratedDishLists
      savedRecipes
      pendingFollowRequests
      notificationPreferences {
        collaborationInvites
        recipeAdditions
        newFollowers
        systemAnnouncements
      }
      bio
      profilePicture
    }
  }
`;

const GET_UNREAD_NOTIFICATIONS = gql`
  query GetUnreadNotificationCount($userId: String!) {
    getUnreadNotificationCount(userId: $userId)
  }
`;

// AuthProvider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [dbUser, setDbUser] = useState<any | null>(null); // Store MongoDB user details
  const [loading, setLoading] = useState(true); // Prevent flicker while checking auth status
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [getUserByEmail] = useLazyQuery(GET_USER, {
    fetchPolicy: "network-only",
  });
  const [getUnreadCount] = useLazyQuery(GET_UNREAD_NOTIFICATIONS, {
    fetchPolicy: "network-only",
  });

  // Function to refresh notification count
  const refreshNotificationCount = useCallback(async () => {
    if (!dbUser?.firebaseUid) return;

    try {
      const { data } = await getUnreadCount({
        variables: { userId: dbUser.firebaseUid },
        fetchPolicy: "network-only", // Force a network request to get latest data
      });

      if (data && typeof data.getUnreadNotificationCount === "number") {
        setUnreadNotifications(data.getUnreadNotificationCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [dbUser, getUnreadCount]);

  // Fetch user from MongoDB
  const fetchMongoUser = useCallback(
    async (firebaseUser: any) => {
      try {
        const { data } = await getUserByEmail({
          variables: { email: firebaseUser.email },
        });

        if (data?.getUserByEmail) {
          setDbUser(data.getUserByEmail);
          return data.getUserByEmail;
        }

        return null;
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
    [getUserByEmail]
  );

  // Refresh notification count when dbUser changes
  useEffect(() => {
    if (dbUser?.firebaseUid) {
      refreshNotificationCount();
    }
  }, [dbUser, refreshNotificationCount]);

  // Check if user is a collaborator on a dishlist
  const isCollaborator = (dishListId: string) => {
    return dbUser?.collaboratedDishLists?.includes(dishListId);
  };

  // Check if user is following a dishlist
  const isFollowing = (dishListId: string) => {
    return dbUser?.followingDishLists?.includes(dishListId);
  };

  // Check if user is the owner of a dishlist
  const isOwner = (dishListId: string) => {
    return dbUser?.ownedDishLists?.includes(dishListId);
  };

  // Check if user has a pending follow request for a dishlist
  const hasPendingRequest = (dishListId: string) => {
    return dbUser?.pendingFollowRequests?.includes(dishListId);
  };

  // Check if user has saved a recipe
  const hasSavedRecipe = (recipeId: string) => {
    return dbUser?.savedRecipes?.includes(recipeId);
  };

  // Function to refresh user data (used after creating/updating profile)
  const refreshUserData = async () => {
    if (currentUser) {
      const userData = await fetchMongoUser(currentUser);
      // After refreshing user data, also refresh notification count
      if (userData) {
        await refreshNotificationCount();
      }
      return userData;
    }
    return null;
  };

  useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined' || !auth) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userData = await fetchMongoUser(user);
        setLoading(false);

        // If user data was fetched successfully, refresh notification count
        if (userData) {
          refreshNotificationCount();
        }
      } else {
        setCurrentUser(null);
        setDbUser(null);
        setUnreadNotifications(0);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchMongoUser, refreshNotificationCount]);

  // Expose both Firebase user and MongoDB user details
  const value = {
    currentUser,
    dbUser,
    unreadNotifications,
    refreshNotificationCount,
    isCollaborator,
    isFollowing,
    isOwner,
    hasPendingRequest,
    hasSavedRecipe,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook for consuming auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};