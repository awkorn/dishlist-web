import React, { createContext, useContext, useEffect, useState } from "react";
import { useLazyQuery, useMutation, gql } from "@apollo/client";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/authService";

const AuthContext = createContext(null);

const GET_USER = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      id
      firebaseUid
      email
      username
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($firebaseUid: String!, $email: String!, $username: String!) {
    createUser(firebaseUid: $firebaseUid, email: $email, username: $username) {
      id
      firebaseUid
      email
      username
    }
  }
`;

//AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); //prevent flicker while checking auth status

  const [getUserByEmail] = useLazyQuery(GET_USER, { fetchPolicy: "network-only" });
  const [createUser] = useMutation(CREATE_USER);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setLoading(false);

        try {
          //try fetching the user from MongoDB via GraphQL
          const { data } = await getUserByEmail({ variables: { email: user.email } });
          
          if (!data?.getUserByEmail) {
            console.log("User not found in DB. Creating new user...");
            //if the user doesn't exist, create a new record in db 
            await createUser({
              variables: {
                firebaseUid: user.uid,
                email: user.email,
                username: user.displayName || "New User",
              },
            });
          }
        } catch (error) {
          console.error("Error fetching/creating user:", error);
        }
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [getUserByEmail, createUser]);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {!loading && children}{" "}
    </AuthContext.Provider>
  );
};

//hook for consuming auth context
export const useAuth = () => useContext(AuthContext);
