import { gql } from "apollo-server-express";

const dishListTypeDefs = gql`
  type DishList {
    id: ID
    userId: String!
    title: String!
    isPinned: Boolean!
    followers: [String]!
    collaborators: [String]!
    pendingCollaborators: [String]
    visibility: String!
    sharedWith: [String]
    followRequests: [String]
    description: String
  }

  type DishListRecipeCount {
    dishListId: ID!
    count: Int!
  }

  type Query {
    getDishLists(userId: String!): [DishList]
    getPublicDishLists(limit: Int, offset: Int): [DishList]
    getDishList(id: ID!, userId: String!): DishList
    dishListsRecipeCounts(
      dishListIds: [ID!]!
      userId: String!
    ): [DishListRecipeCount]
  }

  type Mutation {
    addDishList(
      userId: String!
      title: String!
      isPinned: Boolean!
      collaborators: [String]
      description: String
      visibility: String!
    ): DishList
    editDishList(
      id: ID!
      title: String!
      userId: String!
      description: String
      visibility: String!
    ): DishList
    removeDishList(id: ID!, userId: String!): DishList
    pinDishList(id: ID!, userId: String!): DishList
    unpinDishList(id: ID!, userId: String!): DishList
    followDishList(dishListId: ID!, userId: String!): DishList
    shareDishList(dishListId: ID!, visbility: String!): DishList
    inviteCollaborator(dishListId: ID!, targetUserId: String!, userId: String!): DishList
    updateVisibility(id: ID!, visibility: String!, userId: String!): DishList
    addSharedUser(dishListId: ID!, userId: String!): DishList
    removeSharedUser(dishListId: ID!, userId: String!): DishList
    requestToFollow(dishListId: ID!, userId: String!): Boolean
    approveFollowRequest(dishListId: ID!, userId: String!): DishList
    rejectFollowRequest(dishListId: ID!, userId: String!): Boolean
    removeCollaborator(dishListId: ID!, targetUserId: String!, userId: String!): DishList
    unfollowDishList(dishListId: ID!, userId: String!): Boolean
  }
`;

export default dishListTypeDefs;
