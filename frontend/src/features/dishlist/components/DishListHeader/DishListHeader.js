import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { EDIT_DISHLIST } from "../../../../graphql/mutations/dishLists";
import { useAuth } from "../../../../contexts/AuthProvider";
import styles from "./DishListHeader.module.css";

const DishListHeader = ({ dishList, userRole }) => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(dishList.title);
  const [description, setDescription] = useState(dishList.description || "");

  const [editDishList, { loading }] = useMutation(EDIT_DISHLIST, {
    onCompleted: () => {
      setIsEditing(false);
      toast.success("DishList updated successfully!");
    },
    onError: (error) => {
      toast.error(`Error updating DishList: ${error.message}`);
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTitle(dishList.title);
    setDescription(dishList.description || "");
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    editDishList({
      variables: {
        id: dishList.id,
        title,
        userId: currentUser.uid,
        description: description.trim() ? description : null,
      },
    });
  };

  // Determine visibility badge text and color
  const getVisibilityBadge = () => {
    switch (dishList.visibility) {
      case "public":
        return { text: "Public", className: "visibility-badge public" };
      case "private":
        return { text: "Private", className: "visibility-badge private" };
      default:
        return { text: dishList.visibility, className: "visibility-badge" };
    }
  };

  // Get badge for user role
  const getRoleBadge = () => {
    switch (userRole) {
      case "owner":
        return { text: "Owner", className: "role-badge owner" };
      case "collaborator":
        return { text: "Collaborator", className: "role-badge collaborator" };
      case "follower":
        return { text: "Follower", className: "role-badge follower" };
      default:
        return null;
    }
  };

  const visibilityBadge = getVisibilityBadge();
  const roleBadge = getRoleBadge();

  return (
    <div className={styles.dishlistHeader}>
      {isEditing ? (
        <div className={styles.editForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="DishList Title"
              maxLength="50"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description to your DishList"
              maxLength="200"
              rows="3"
            />
          </div>
          <div className={styles.editButtons}>
            <button
              className={styles.cancelBtn}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <h1 className={styles.dishlistTitle}>{dishList.title}</h1>
            {userRole === "owner" && (
              <button className={styles.editBtn} onClick={handleEdit}>
                Edit
              </button>
            )}
          </div>

          <div className={styles.badges}>
            <span className={visibilityBadge.className}>
              {visibilityBadge.text}
            </span>
            {roleBadge && (
              <span className={roleBadge.className}>{roleBadge.text}</span>
            )}
          </div>

          {dishList.description && (
            <p className={styles.dishlistDescription}>{dishList.description}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DishListHeader;
