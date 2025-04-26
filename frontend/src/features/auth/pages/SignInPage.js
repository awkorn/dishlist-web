import React from "react";
import PageHeader from "../../../components/common/PageHeader/PageHeader"
import SignInForm from "../components/SignInForm/SignInForm"
import AuthBanner from "../components/AuthBanner/AuthBanner";

const SignInPage = () => {
  return (
    <div className="sign-in-page">
      <AuthBanner />
      <PageHeader title="Welcome Back!" />
      <SignInForm />
    </div>
  );
};

export default SignInPage;
