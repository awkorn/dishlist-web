import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth } from "../../../contexts/AuthProvider";
import TopNav from "../../../components/layout/TopNav/TopNav";
import { toast } from "react-toastify";
import { useApolloClient } from "@apollo/client";
import styles from "./NotificationsPage.module.css";
import {
  GET_USER_NOTIFICATIONS,
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION_READ,
  DELETE_NOTIFICATION,
  ACCEPT_COLLABORATION,
} from "../../../graphql";

const NotificationsPage = () => {
  const { currentUser, refreshNotificationCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const client = useApolloClient();
  const LIMIT = 20;

  // Query to fetch notifications
  const { loading, error, data } = useQuery(GET_USER_NOTIFICATIONS, {
    variables: { userId: currentUser?.uid, limit: LIMIT, offset },
    skip: !currentUser?.uid,
    fetchPolicy: "network-only",
  });

  // Mutations
  const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllNotificationsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);
  const [acceptCollaboration] = useMutation(ACCEPT_COLLABORATION);

  // Format date to display
  const formatDate = (dateString) => {
    const date = new Date(parseInt(dateString));
    const now = new Date();
    const diff = now - date;

    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
      return new Intl.RelativeTimeFormat("en", { style: "long" }).format(
        -Math.round(diff / (60 * 60 * 1000)),
        "hour"
      );
    }

    // Less than 7 days
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return new Intl.RelativeTimeFormat("en", { style: "long" }).format(
        -Math.round(diff / (24 * 60 * 60 * 1000)),
        "day"
      );
    }

    // Otherwise show date
    return date.toLocaleDateString();
  };

  // Load notifications when data changes
  useEffect(() => {
    if (data?.getUserNotifications) {
      if (offset === 0) {
        setNotifications(data.getUserNotifications);
      } else {
        setNotifications((prev) => [...prev, ...data.getUserNotifications]);
      }

      // Check if there might be more notifications to load
      setHasMore(data.getUserNotifications.length === LIMIT);
    }
  }, [data, offset]);

  // Handle marking notifications as read
  useEffect(() => {
    const markUnreadNotifications = async () => {
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      if (unreadNotifications.length > 0) {
        // Use Promise.all to wait for all mutations to complete
        await Promise.all(
          unreadNotifications.map((notification) =>
            markNotificationRead({
              variables: { id: notification.id, userId: currentUser?.uid },
            })
          )
        );

        // Update notifications in state as read
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            !notification.isRead
              ? { ...notification, isRead: true }
              : notification
          )
        );

        // Refresh notification count in the header immediately after marking as read
        refreshNotificationCount();
        
        // Ensure the cache is updated for any related queries
        client.cache.evict({ fieldName: "getUnreadNotificationCount" });
        client.cache.gc();
      }
    };

    if (currentUser?.uid && notifications.length > 0) {
      markUnreadNotifications();
    }
  }, [
    notifications,
    currentUser,
    markNotificationRead,
    refreshNotificationCount,
    client.cache,
  ]);

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead({
        variables: { userId: currentUser.uid },
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );

      // Clear the notification count cache and refresh
      client.cache.evict({ fieldName: "getUnreadNotificationCount" });
      client.cache.gc();
      
      // Refresh notification count
      refreshNotificationCount();
      
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  // Handle deleting a notification
  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification({
        variables: { id, userId: currentUser.uid },
      });

      // Update local state
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
      
      // Refresh notification count as deleted notifications should no longer count
      refreshNotificationCount();
      
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  // Handle accepting collaboration invitation
  const handleAcceptCollaboration = async (notificationId, dishListId) => {
    try {
      await acceptCollaboration({
        variables: { userId: currentUser.uid, dishListId },
      });

      // Force the cache to evict dishlists data
      client.cache.evict({ fieldName: "getDishLists" });
      client.cache.gc();

      toast.success("Collaboration accepted");
      handleDeleteNotification(notificationId);
    } catch (error) {
      toast.error("Failed to accept collaboration: " + error.message);
    }
  };

  // Load more notifications
  const loadMore = () => {
    if (hasMore && !loading) {
      setOffset(offset + LIMIT);
    }
  };

  // Render notification based on type
  const renderNotification = (notification) => {
    const { id, type, message, relatedId, isRead, createdAt } = notification;

    return (
      <div
        key={id}
        className={`${styles.notification} ${
          isRead ? styles.read : styles.unread
        }`}
      >
        <div className={styles.notificationContent}>
          <div className={styles.notificationMessage}>{message}</div>
          <div className={styles.notificationTime}>{formatDate(createdAt)}</div>
        </div>

        <div className={styles.notificationActions}>
          {/* Show accept/delete buttons for collaboration invites */}
          {type === "invite" ? (
            <>
              <button
                className={styles.acceptButton}
                onClick={() => handleAcceptCollaboration(id, relatedId)}
              >
                Accept
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteNotification(id)}
              >
                Delete
              </button>
            </>
          ) : (
            /* Show only delete button for other notification types */
            <button
              className={styles.deleteButton}
              onClick={() => handleDeleteNotification(id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  };

  // Call refreshNotificationCount when component mounts to sync the count
  useEffect(() => {
    if (currentUser?.uid) {
      refreshNotificationCount();
    }
  }, [currentUser, refreshNotificationCount]);

  return (
    <div className={styles.pageContainer}>
      <TopNav />
      <div className={styles.notificationsContainer}>
        <div className={styles.notificationsHeader}>
          <h1>Notifications</h1>
          <button
            className={styles.markAllReadButton}
            onClick={handleMarkAllRead}
            disabled={!notifications.some((n) => !n.isRead)}
          >
            Mark all as read
          </button>
        </div>

        {loading && offset === 0 ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>Error loading notifications. Please try again later.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <p>You don't have any notifications yet.</p>
          </div>
        ) : (
          <>
            <div className={styles.notificationsList}>
              {notifications.map(renderNotification)}
            </div>

            {hasMore && (
              <div className={styles.loadMoreContainer}>
                <button
                  className={styles.loadMoreButton}
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;