import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../../../components/layout/TopNav/TopNav";
import { useMutation } from "@apollo/client";
import { ADD_DISHLIST } from "../../../graphql/mutations/dishLists";
import { FETCH_DISHLISTS } from "../../../graphql/queries/dishLists";
import { useAuth } from "../../../contexts/AuthProvider";
import { toast } from "react-toastify";
import styles from "./AddDishListPage.module.css";

const AddDishListPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const { currentUser, refreshUserData } = useAuth();
  const navigate = useNavigate();

  const [addDishList, { loading }] = useMutation(ADD_DISHLIST, {
    onCompleted: () => {
      toast.success("DishList created successfully!");

      // If refreshUserData is available, call it
      if (refreshUserData) {
        refreshUserData();
      }

      navigate("/dishlists", { state: { refresh: true } });
    },
    onError: (error) => {
      toast.error(`Error creating DishList: ${error.message}`);
    },

    update: (cache, { data: { addDishList } }) => {
      // Read the current query data from the cache
      const existingData = cache.readQuery({
        query: FETCH_DISHLISTS,
        variables: { userId: currentUser?.uid },
      });

      if (existingData) {
        // Write the updated data back to the cache
        cache.writeQuery({
          query: FETCH_DISHLISTS,
          variables: { userId: currentUser?.uid },
          data: {
            getDishLists: [...existingData.getDishLists, addDishList],
          },
        });
      }
    },
  });

  const handleAddDishList = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title for your DishList");
      return;
    }

    addDishList({
      variables: {
        userId: currentUser.uid,
        title: title,
        isPinned: false,
        description: description || "",
        visibility: visibility,
      },
    });
  };

  return (
    <div className={styles.pageContainer}>
      <TopNav pageType={"add-dishlist"} />
      <div className={styles.createDishlistContainer}>
        <h1 className={styles.pageTitle}>Create new DishList</h1>

        <form className={styles.addDishlistForm} onSubmit={handleAddDishList}>
          <div className={styles.formGroup}>
            <label htmlFor="dishlist-title">Title</label>
            <input
              id="dishlist-title"
              className={styles.formInput}
              type="text"
              value={title}
              maxLength={40}
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
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate("/dishlists")}
            >
              Cancel
            </button>
            <button type="submit" className={styles.createBtn} disabled={loading}>
              {loading ? "Creating..." : "Create DishList"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDishListPage;