import React from "react";
import PageHeader from "../components/PageHeader/PageHeader";
import SignUpForm from "../components/SignUpForm/SignUpForm";

const SignUpPage = () => {
  return (
    <div>
      <PageHeader title="Create Account" />
      <SignUpForm />
    </div>
  );
}

export default SignUpPage;
