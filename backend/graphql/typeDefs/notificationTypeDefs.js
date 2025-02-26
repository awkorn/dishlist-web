import { gql } from "apollo-server-express";

const notificationTypeDefs = gql`
  type Notification {
    id: ID!
    userId: String!
    type: String!
    message: String!
    relatedId: String
    isRead: Boolean!
    createdAt: String!
  }

  type Query {
    getUserNotifications(
      userId: String!
      limit: Int
      offset: Int
    ): [Notification]
    getUnreadNotificationCount(userId: String!): Int
  }

  type Mutation {
    markNotificationRead(id: ID!, userId: String!): Notification
    markAllNotificationsRead(userId: String!): Boolean
    deleteNotification(id: ID!, userId: String!): Boolean
    deleteAllNotifications(userId: String!): Boolean
  }
`;

export default notificationTypeDefs;
