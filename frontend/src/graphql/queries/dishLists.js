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

export const GET_DISHLISTS_RECIPE_COUNTS = gql`
  query GetDishListsRecipeCounts($dishListIds: [ID!]!, $userId: String!) {
    dishListsRecipeCounts(dishListIds: $dishListIds, userId: $userId) {
      dishListId
      count
    }
  }
`;