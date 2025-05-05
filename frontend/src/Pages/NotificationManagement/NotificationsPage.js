import React, { useEffect, useState } from "react";
import axios from "axios";
import { RiDeleteBin6Fill, RiInboxArchiveFill } from "react-icons/ri";
import { MdOutlineMarkChatRead, MdMarkChatUnread } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "../../Components/NavBar/NavBar";
import "./notification.css";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all', 'read', 'unread'
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem("userID");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/notifications/${userId}`
        );
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchNotifications();
    } else {
      console.error("User ID is not available");
      setIsLoading(false);
    }
  }, [userId]);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "read") return notification.read;
    if (filter === "unread") return !notification.read;
    return true; // 'all'
  });

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:8080/notifications/${id}/markAsRead`);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAsUnread = async (id) => {
    try {
      await axios.put(`http://localhost:8080/notifications/${id}/markAsUnread`);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
    } catch (error) {
      console.error("Error marking notification as unread:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/notifications/${id}`);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `http://localhost:8080/notifications/markAllAsRead/${userId}`
      );
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const archiveAllRead = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/notifications/archiveRead/${userId}`
      );
      setNotifications(notifications.filter((n) => !n.read));
    } catch (error) {
      console.error("Error archiving read notifications:", error);
    }
  };

  return (
    <div className="notifications-page dark-theme">
      <NavBar />

      <div className="animated-background">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="glow-effect"></div>
      </div>

      <div className="notifications-container">
        <div className="notifications-header">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Notifications
          </motion.h1>

          <div className="header-actions">
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={`filter-tab ${filter === "unread" ? "active" : ""}`}
                onClick={() => setFilter("unread")}
              >
                Unread
              </button>
              <button
                className={`filter-tab ${filter === "read" ? "active" : ""}`}
                onClick={() => setFilter("read")}
              >
                Read
              </button>
            </div>

            <div className="bulk-actions">
              {notifications.some((n) => !n.read) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mark-all-read-btn"
                  onClick={markAllAsRead}
                >
                  Mark All as Read
                </motion.button>
              )}
              {notifications.some((n) => n.read) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="archive-read-btn"
                  onClick={archiveAllRead}
                >
                  <RiInboxArchiveFill /> Archive Read
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="notification-skeleton"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 0.8 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  repeatType: "reverse",
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="empty-illustration"></div>
            <p className="empty-message">
              {filter === "all"
                ? "No notifications yet"
                : filter === "read"
                ? "No read notifications"
                : "No unread notifications"}
            </p>
            <p className="empty-subtext">
              {filter === "all"
                ? "Your notifications will appear here"
                : filter === "read"
                ? "Mark notifications as read to see them here"
                : "You're all caught up!"}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                className={`notification-card ${
                  notification.read ? "read" : "unread"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                layout
                whileHover={{ scale: 1.02 }}
              >
                <div className="notification-indicator">
                  {!notification.read ? (
                    <motion.div
                      className="unread-dot"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ) : (
                    <div className="read-icon">✓</div>
                  )}
                </div>

                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <p className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="notification-actions">
                  {notification.read ? (
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="mark-unread-btn"
                      onClick={() => handleMarkAsUnread(notification.id)}
                      title="Mark as unread"
                    >
                      <MdMarkChatUnread />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="mark-read-btn"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <MdOutlineMarkChatRead />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="delete-btn"
                    onClick={() => handleDelete(notification.id)}
                    title="Delete"
                  >
                    <RiDeleteBin6Fill />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
