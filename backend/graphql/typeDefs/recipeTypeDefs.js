import { gql } from "apollo-server-express";

const recipeTypeDefs = gql`
  type Ingredient {
    name: String!
    amount: String
    unit: String
  }

  type ImageData {
    url: String
    rotation: Int
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
    image: ImageData
    createdAt: String!
    updatedAt: String!
  }

  input ImageDataInput {
    url: String
    rotation: Int
  }

  input IngredientInput {
    name: String!
    amount: String
    unit: String
  }

  type Query {
    getRecipe(id: ID!, userId: String!): Recipe
    getUserRecipes(userId: String!): [Recipe]
    getDishListRecipes(dishListId: ID!, userId: String!): [Recipe]
    searchRecipes(searchTerm: String!, limit: Int, userId: String): [Recipe]
    getUserProfile(userId: String!, viewerId: String!): UserProfile
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
      image: ImageDataInput
      dishListId: ID
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
      image: ImageDataInput
    ): Recipe

    deleteRecipe(id: ID!, userId: String!): String

    addRecipeToDishList(recipeId: ID!, dishListId: ID!, userId: String!): Recipe

    removeRecipeFromDishList(
      recipeId: ID!
      dishListId: ID
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

  type UserProfile {
    id: ID!
    firebaseUid: String!
    email: String!
    username: String!
    firstName: String! 
    lastName: String!
    ownedDishLists: [ID]!
    savedRecipes: [ID]!
    followingDishLists: [ID]
    collaboratedDishLists: [ID]
    pendingFollowRequests: [ID]
    notificationPreferences: NotificationPreferences
    bio: String
    profilePicture: String
    visibleDishLists: [DishList]
    visibleRecipes: [Recipe]
    dishListCount: Int
    recipeCount: Int
  }
`;

export default recipeTypeDefs;
