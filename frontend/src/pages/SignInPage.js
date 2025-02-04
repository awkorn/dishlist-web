import React from "react";
import PageHeader from "../components/PageHeader";
import SignInForm from "../components/SignInForm/SignInForm";

const SignInPage = () => {
  return (
    <div className="sign-in-page">
      <PageHeader title="Welcome Back!" />
      <SignInForm />
    </div>
  );
};

export default SignInPage;
