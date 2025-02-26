import { gql } from "apollo-server-express";

const recipeTypeDefs = gql`
  type Ingredient {
    name: String!
    amount: String
    unit: String
  }

  type Comment {
    id: ID!
    userId: String!
    username: String!
    content: String!
    createdAt: String!
  }

  type Recipe {
    id: ID!
    creatorId: String!
    title: String!
    ingredients: [Ingredient!]!
    instructions: [String!]!
    cookTime: Int
    prepTime: Int
    servings: Int
    tags: [String]
    dishLists: [ID]
    comments: [Comment]
    image: String
    createdAt: String!
    updatedAt: String!
  }

  input IngredientInput {
    name: String!
    amount: String
    unit: String
  }

  type Query {
    getRecipe(id: ID!): Recipe
    getUserRecipes(userId: String!): [Recipe]
    getDishListRecipes(dishListId: ID!): [Recipe]
    searchRecipes(searchTerm: String!, limit: Int, userId: String): [Recipe]
  }

  type Mutation {
    createRecipe(
      creatorId: String!
      title: String!
      ingredients: [IngredientInput!]!
      instructions: [String!]!
      cookTime: Int
      prepTime: Int
      servings: Int
      tags: [String]
      image: String
    ): Recipe
    updateRecipe(
      id: ID!
      userId: String!
      title: String
      ingredients: [IngredientInput]
      instructions: [String]
      cookTime: Int
      prepTime: Int
      servings: Int
      tags: [String]
      image: String
    ): Recipe
    deleteRecipe(id: ID!, userId: String!): String
    addRecipeToDishList(recipeId: ID!, dishListId: ID!, userId: String!): Recipe
    removeRecipeFromDishList(
      recipeId: ID!
      dishListId: ID!
      userId: String!
    ): Recipe
    addComment(
      recipeId: ID!
      userId: String!
      username: String!
      content: String!
    ): Recipe
    removeComment(recipeId: ID!, commentId: ID!, userId: String!): Recipe
  }
`;

export default recipeTypeDefs;
