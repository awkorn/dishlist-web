import React from "react";
import PageHeader from "../../../components/common/PageHeader/PageHeader"
import SignUpForm from "../components/SignUpForm/SignUpForm";
import AuthBanner from "../components/AuthBanner/AuthBanner";

const SignUpPage = () => {
  return (
    <div>
      <AuthBanner />
      <PageHeader title="Create Account" />
      <SignUpForm />
    </div>
  );
}

export default SignUpPage;
