import { gql } from "@apollo/client";

export const FETCH_DISHLISTS = gql`
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

export const GET_USER_DISHLISTS = gql`
  query GetUserDishlists($userId: String!) {
    getUserOwnedDishLists(userId: $userId) {
      id
      title
      isPinned
    }
    getUserCollaboratedDishLists(userId: $userId) {
      id
      title
      userId
    }
  }
`;
