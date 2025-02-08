import { useEffect } from "react";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../../services/authService";
import { toast } from "react-toastify";

const GoogleSignInButton = () => {
  useEffect(() => {
    //Initialize Google Identity Services button
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-button-container"),
      { theme: "filled_blue", size: "medium", width: 300, shape: "pill" }
    );
  }, []);

  //Handles the credential response from Google and signs in with Firebase
  const handleCredentialResponse = async (response) => {
    try {
      const credential = GoogleAuthProvider.credential(response.credential);
      const result = await signInWithCredential(auth, credential);
      toast.success("Welcome, " + result.user.displayName);
      //TODO: Navigate user to home page
    } catch (error) {
      toast.error("Error signing in with Google: " + error.message);
    }
  };

  return <div id="google-button-container"></div>;
};

export default GoogleSignInButton;
