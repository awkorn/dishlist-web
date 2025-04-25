import { gql } from "@apollo/client";

export const GET_DISHLIST_DETAIL = gql`
  query GetDishList($id: ID!, $userId: String!) {
    getDishList(id: $id, userId: $userId) {
      id
      userId
      title
      description
      isPinned
      followers
      collaborators
      pendingCollaborators
      visibility
      sharedWith
      followRequests
    }
  }
`;

export const GET_DISHLIST_RECIPES = gql`
  query GetDishListRecipes($dishListId: ID!, $userId: String!) {
    getDishListRecipes(dishListId: $dishListId, userId: $userId) {
      id
      creatorId
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
      comments {
        id
        userId
        username
        content
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;