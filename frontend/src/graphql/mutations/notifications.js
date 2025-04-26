import { gql } from "@apollo/client";

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!, $userId: String!) {
    markNotificationRead(id: $id, userId: $userId) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead($userId: String!) {
    markAllNotificationsRead(userId: $userId)
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!, $userId: String!) {
    deleteNotification(id: $id, userId: $userId)
  }
`;

export const ACCEPT_COLLABORATION = gql`
  mutation AcceptCollaboration($userId: String!, $dishListId: ID!) {
    acceptCollaboration(userId: $userId, dishListId: $dishListId) {
      id
      collaboratedDishLists
    }
  }
`;

export const DELETE_ALL_NOTIFICATIONS = gql`
  mutation DeleteAllNotifications($userId: String!) {
    deleteAllNotifications(userId: $userId)
  }
`;