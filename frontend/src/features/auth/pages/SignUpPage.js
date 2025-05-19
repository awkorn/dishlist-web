import React from "react";
import PageHeader from "../../../components/common/PageHeader/PageHeader";
import SignUpForm from "../components/SignUpForm/SignUpForm";
import AuthBanner from "../components/AuthBanner/AuthBanner";
import styles from "./AuthPages.module.css";

const SignUpPage = () => {
  return (
    <div className={styles.authPageContainer}>
      <AuthBanner />
      <div className={styles.authContent}>
        <PageHeader title="Create Account" />
        <div className={styles.formContainer}>
          <SignUpForm />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;