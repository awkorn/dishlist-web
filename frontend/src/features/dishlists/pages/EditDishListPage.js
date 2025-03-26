import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TopNav from "../../../components/layout/TopNav/TopNav";
import { useMutation, useQuery } from "@apollo/client";
import { EDIT_DISHLIST } from "../../../graphql/mutations/dishLists";
import { GET_DISHLIST_DETAIL } from "../../../graphql/queries/dishListDetail";
import { useAuth } from "../../../contexts/AuthProvider";
import styles from "./EditDishListPage.module.css";
import { toast } from "react-toastify";

const EditDishListPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const location = useLocation();

  const { dishListId, returnTo = "/dishlists" } = location.state || {};
  const effectiveDishListId = dishListId || id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("");

  const { loading, error, data } = useQuery(GET_DISHLIST_DETAIL, {
    variables: { id: effectiveDishListId, userId: currentUser?.uid },
    skip: !currentUser,
  });

  useEffect(() => {
    if (data?.getDishList) {
      setTitle(data.getDishList.title);
      setDescription(data.getDishList.description || "");
      setVisibility(data.getDishList.visibility);
    }
  }, [data]);

  const [editDishList] = useMutation(EDIT_DISHLIST, {
    onCompleted: () => {
      toast.success("Dishlist updated successfully");
      navigate(returnTo);
    },
    onError: (error) => {
      toast.error(`Error updating dishlist: ${error.message}`);
    },
    update: (cache, { data: { editDishList } }) => {
      cache.modify({
        id: cache.identify(editDishList),
        fields: {
          title: () => editDishList.title,
          description: () => editDishList.description,
          visibility: () => editDishList.visibility,
        },
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title) {
      toast.error("Title cannot be empty");
      return;
    }

    editDishList({
      variables: {
        id: effectiveDishListId,
        title: title,
        userId: currentUser.uid,
        description: description,
        visibility: visibility,
      },
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dishlist data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error.message}</p>
        <button
          className={styles.primaryButton}
          onClick={() => navigate(returnTo)}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!data?.getDishList || data.getDishList.userId !== currentUser?.uid) {
    return (
      <div className={styles.unauthorizedContainer}>
        <h2>Unauthorized</h2>
        <p>
          You don't have permission to edit this dishlist or it doesn't exist.
        </p>
        <button
          className={styles.primaryButton}
          onClick={() => navigate(returnTo)}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <TopNav />
      <div className={styles.editDishlistContainer}>
        <h1 className={styles.pageTitle}>Edit DishList</h1>

        <form className={styles.dishlistForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="dishlist-title">Title</label>
            <input
              id="dishlist-title"
              className={styles.formInput}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your DishList"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dishlist-description">Description (optional)</label>
            <textarea
              id="dishlist-description"
              className={styles.formTextarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your DishList"
              rows="4"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Visibility</label>
            <div className={styles.visibilityOptions}>
              <button
                type="button"
                className={`${styles.visibilityBtn} ${
                  visibility === "public" ? styles.activeVisibility : ""
                }`}
                onClick={() => setVisibility("public")}
              >
                Public
              </button>

              <button
                type="button"
                className={`${styles.visibilityBtn} ${
                  visibility === "private" ? styles.activeVisibility : ""
                }`}
                onClick={() => setVisibility("private")}
              >
                Private
              </button>

              <button
                type="button"
                className={`${styles.visibilityBtn} ${
                  visibility === "shared" ? styles.activeVisibility : ""
                }`}
                onClick={() => setVisibility("shared")}
              >
                Shared
              </button>
            </div>

            <div className={styles.visibilityExplanation}>
              {visibility === "public" && (
                <p>
                  Anyone can view, follow, and copy recipes from this DishList.
                </p>
              )}
              {visibility === "private" && (
                <p>Only you and collaborators can view this DishList.</p>
              )}
              {visibility === "shared" && (
                <p>Only specific people you invite can view this DishList.</p>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate(returnTo)}
            >
              Cancel
            </button>
            <button type="submit" className={styles.updateBtn}>
              Update DishList
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDishListPage;
