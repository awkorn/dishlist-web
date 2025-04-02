import { gql } from "apollo-server-express";

const userTypeDefs = gql`
  type NotificationPreferences {
    collaborationInvites: Boolean!
    dishListShares: Boolean!
    recipeAdditions: Boolean!
    newFollowers: Boolean!
    systemAnnouncements: Boolean!
  }

  type User {
    id: ID!
    firebaseUid: String!
    email: String!
    username: String!
    ownedDishLists: [ID]!
    savedRecipes: [ID]!
    followingDishLists: [ID]
    collaboratedDishLists: [ID]
    pendingFollowRequests: [ID]
    notificationPreferences: NotificationPreferences
    bio: String
    profilePicture: String
  }

  type Query {
    getUser(id: ID!): User
    getUserByEmail(email: String!): User
    getUserByFirebaseUid(firebaseUid: String!): User
    searchUsers(searchTerm: String!, limit: Int): [User]
    getUserOwnedDishLists(userId: String!): [DishList]
    getUserCollaboratedDishLists(userId: String!): [DishList]
    getUserFollowedDishLists(userId: String!): [DishList]
    getUserPendingFollowRequests(userId: String!): [DishList]
  }

  type Mutation {
    saveRecipe(userId: ID!, recipeId: ID!): User
    createUser(firebaseUid: String!, email: String!, username: String!): User
    unsaveRecipe(userId: ID!, recipeId: ID!): User
    updateUserProfile(
      userId: ID!
      username: String
      bio: String
      profilePicture: String
    ): User
    updateNotificationPreferences(
      userId: ID!
      preferences: NotificationPreferencesInput!
    ): User
    acceptCollaboration(userId: String!, dishListId: ID!): User
    declineCollaboration(userId: String!, dishListId: ID!): Boolean
    leaveCollaboration(userId: String!, dishListId: ID!): Boolean
  }

  input NotificationPreferencesInput {
    collaborationInvites: Boolean
    dishListShares: Boolean
    recipeAdditions: Boolean
    newFollowers: Boolean
    systemAnnouncements: Boolean
  }
`;

export default userTypeDefs;
