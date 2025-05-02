import { gql } from "@apollo/client";

export const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: String!, $viewerId: String!) {
    getUserProfile(userId: $userId, viewerId: $viewerId) {
      id
      firebaseUid
      email
      username
      firstName
      lastName
      bio
      profilePicture
      ownedDishLists
      collaboratedDishLists
      savedRecipes
      followingDishLists
      dishListCount
      recipeCount
      visibleDishLists {
        id
        title
        isPinned
        collaborators
        followers
        userId
        visibility
        description
      }
      visibleRecipes {
        id
        title
        ingredients {
          name
          amount
          unit
        }
        instructions
        cookTime
        prepTime
        servings
        tags
        image {
          url
          rotation
        }
        creatorId
      }
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($searchTerm: String!, $limit: Int) {
    searchUsers(searchTerm: $searchTerm, limit: $limit) {
      id
      firebaseUid
      username
      firstName
      lastName
      profilePicture
    }
  }
`;


export const GET_USER_BY_FIREBASE_UID = gql`
  query GetUserByFirebaseUid($firebaseUid: String!) {
    getUserByFirebaseUid(firebaseUid: $firebaseUid) {
      id
      username
      email
      profilePicture
    }
  }
`;