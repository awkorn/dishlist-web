import { gql } from "@apollo/client";

export const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications($userId: String!, $limit: Int, $offset: Int) {
    getUserNotifications(userId: $userId, limit: $limit, offset: $offset) {
      id
      type
      message
      relatedId
      isRead
      createdAt
    }
  }
`;