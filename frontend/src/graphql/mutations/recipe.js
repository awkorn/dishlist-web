import { gql } from "@apollo/client";

export const CREATE_RECIPE = gql`
  mutation CreateRecipe(
    $creatorId: String!
    $title: String!
    $ingredients: [IngredientInput!]!
    $instructions: [String!]!
    $cookTime: Int
    $prepTime: Int
    $servings: Int
    $tags: [String]
    $image: String
  ) {
    createRecipe(
      creatorId: $creatorId
      title: $title
      ingredients: $ingredients
      instructions: $instructions
      cookTime: $cookTime
      prepTime: $prepTime
      servings: $servings
      tags: $tags
      image: $image
    ) {
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
      image
      creatorId
      dishLists
      createdAt
    }
  }
`;

export const ADD_RECIPE_TO_DISHLIST = gql`
  mutation AddRecipeToDishList(
    $recipeId: ID!
    $dishListId: ID!
    $userId: String!
  ) {
    addRecipeToDishList(
      recipeId: $recipeId
      dishListId: $dishListId
      userId: $userId
    ) {
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
      image
      creatorId
      dishLists
      createdAt
      updatedAt
    }
  }
`;