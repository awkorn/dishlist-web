import { gql } from "@apollo/client";

export const GET_RECIPE = gql`
  query GetRecipe($id: ID!, $userId: String!) {
    getRecipe(id: $id, userId: $userId) {
      id
      title
      creatorId
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
      dishLists
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