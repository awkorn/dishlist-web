import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav/TopNav";
import { useMutation } from "@apollo/client";
import { ADD_DISHLIST } from "../graphql/mutations/dishLists";
import { FETCH_DISHLISTS } from "../graphql/queries/dishLists";
import { useAuth } from "../contexts/AuthProvider";
import { ToastContainer, toast } from "react-toastify";
import PageTitle from "../components/PageTitle/PageTitle";
import "./AddDishListPage.css";

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
    <div className="page-container">
      <TopNav pageType={"add-dishlist"} />
      <div className="create-dishlist-container">
        <PageTitle title="Create new DishList" />

        <form className="add-dishlist-form" onSubmit={handleAddDishList}>
          <div className="form-group">
            <label htmlFor="dishlist-title">Title</label>
            <input
              id="dishlist-title"
              className="form-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your DishList"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dishlist-description">Description (optional)</label>
            <textarea
              id="dishlist-description"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your DishList"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Visibility</label>
            <div className="visibility-options">
              <button
                type="button"
                className={`visibility-btn ${
                  visibility === "public" ? "active" : ""
                }`}
                onClick={() => setVisibility("public")}
              >
                Public
              </button>

              <button
                type="button"
                className={`visibility-btn ${
                  visibility === "private" ? "active" : ""
                }`}
                onClick={() => setVisibility("private")}
              >
                Private
              </button>

              <button
                type="button"
                className={`visibility-btn ${
                  visibility === "shared" ? "active" : ""
                }`}
                onClick={() => setVisibility("shared")}
              >
                Shared
              </button>
            </div>

            <div className="visibility-explanation">
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

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/dishlists")}
            >
              Cancel
            </button>
            <button type="submit" className="create-btn" disabled={loading}>
              {loading ? "Creating..." : "Create DishList"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDishListPage;
