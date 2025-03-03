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