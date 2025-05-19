import styles from './LoadingState.module.css';

const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <p className={styles.loadingMessage}>{message}</p>
    </div>
  );
};

export default LoadingState;