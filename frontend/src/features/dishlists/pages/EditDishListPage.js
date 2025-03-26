import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TopNav from "../../../components/layout/TopNav/TopNav";
import { useMutation, useQuery } from "@apollo/client";
import { EDIT_DISHLIST } from "../../../graphql/mutations/dishLists";
import { GET_DISHLIST_DETAIL } from "../../../graphql/queries/dishLists";
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

  // Form submission handler
  // Validate form (e.g., title not empty)
  // Execute mutation with updated values

  // Render loading state if data is still loading
  // Render error state if there was an error fetching data
  // Render unauthorized message if user isn't the owner

  // Render the form with pre-filled values
  // Include title input, description textarea, visibility options
  // Add cancel and update buttons

  return <></>;
};

export default EditDishListPage;
