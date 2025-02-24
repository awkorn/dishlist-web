import { gql } from "apollo-server-express";

const userTypeDefs = gql`
  type User {
    id: ID!
    firebaseUid: String!
    email: String!
    username: String!
    ownedDishLists: [ID]!
    savedRecipes: [ID]!
  }

  type Query {
    getUser(id: ID!): User
    getUserByEmail(email: String!): User
  }

  type Mutation {
    saveRecipe(userId: ID!, recipeId: ID!): User
    createUser(firebaseUid: String!, email: String!, username: String!): User
  }
`;

export default userTypeDefs;
