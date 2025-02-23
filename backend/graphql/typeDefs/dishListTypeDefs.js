import { gql } from "apollo-server-express";

const dishListTypeDefs = gql`
  type DishList {
    id: ID
    userId: String!
    title: String!
    isPinned: Boolean!
    followers: [String]!
    collaborators: [String]!
    visibility: String!
  }

  type Query {
    getDishLists(userId: String!): [DishList]
  }

  type Mutation {
    addDishList(userId: String!, title: String!, isPinned: Boolean!, collaborators: [String]): DishList
    editDishList(id: ID!, title: String!): DishList
    removeDishList(id: ID!): DishList
    pinDishList(id: ID!): DishList
    unpinDishList(id: ID!): DishList
    followDishList(dishListId: ID!, userId: String!): DishList
    shareDishList(dishListId: ID!, visbility: String!): DishList
    inviteCollaborator(dishListId: ID!, userId: String!): DishList
  }
`;

export default dishListTypeDefs;
