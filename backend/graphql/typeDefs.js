import { gql } from "apollo-server-express";

const typeDefs = gql`
  type DishList {
    id: ID!
    userId: String!
    title: String!
    isPinned: Boolean!
  }

  type Query {
    getDishLists(userId: String!): [DishList]
  }

  type Mutation {
    addDishList(userId: String!, title: String!): DishList
    editDishList(id: ID!, title: String!): DishList
    removeDishList(id: ID!): DishList
    pinDishList(id: ID!): DishList
  }
`;

export default typeDefs;
