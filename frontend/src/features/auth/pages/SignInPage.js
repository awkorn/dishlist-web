import React from "react";
import PageHeader from "../../../components/common/PageHeader/PageHeader";
import SignInForm from "../components/SignInForm/SignInForm";
import AuthBanner from "../components/AuthBanner/AuthBanner";
import styles from "./AuthPages.module.css";

const SignInPage = () => {
  return (
    <div className={styles.authPageContainer}>
      <AuthBanner />
      <div className={styles.authContent}>
        <PageHeader title="Welcome Back!" />
        <div className={styles.formContainer}>
          <SignInForm />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;