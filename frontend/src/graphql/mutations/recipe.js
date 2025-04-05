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
    $image: ImageDataInput
    $dishListId: ID
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
      dishListId: $dishListId
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
      image {
        url
        rotation
      }
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
      image {
        url
        rotation
      }
      creatorId
      dishLists
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_RECIPE = gql`
  mutation UpdateRecipe(
    $id: ID!
    $userId: String!
    $title: String
    $ingredients: [IngredientInput]
    $instructions: [String]
    $cookTime: Int
    $prepTime: Int
    $servings: Int
    $tags: [String]
    $image: ImageDataInput
  ) {
    updateRecipe(
      id: $id
      userId: $userId
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
      image {
        url
        rotation
      }
      creatorId
      dishLists
      createdAt
      updatedAt
    }
  }
`;

export const SAVE_RECIPE = gql`
  mutation SaveRecipe($userId: ID!, $recipeId: ID!) {
    saveRecipe(userId: $userId, recipeId: $recipeId) {
      id
      savedRecipes
    }
  }
`;

export const UNSAVE_RECIPE = gql`
  mutation UnsaveRecipe($userId: ID!, $recipeId: ID!) {
    unsaveRecipe(userId: $userId, recipeId: $recipeId) {
      id
      savedRecipes
    }
  }
`;
