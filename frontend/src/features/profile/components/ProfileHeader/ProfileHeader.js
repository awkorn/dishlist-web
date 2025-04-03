import React, { useState } from "react";
import EditProfileModal from "../EditProfileModal/EditProfileModal";
import styles from "./ProfileHeader.module.css";
import profilePlaceHolder from "../../../../assets/images/chef-placeholder.png";

const ProfileHeader = ({
  user,
  isCurrentUser,
  dishListsCount,
  recipesCount,
  refetchProfile
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Default profile image if none is set
  const profileImage = user.profilePicture || profilePlaceHolder;

  // Create display name from username
  const displayName = user.username;

  // Open edit profile modal
  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  return (
    <div className={styles.profileHeader}>
      <div className={styles.profileContent}>
        <div className={styles.profileImageContainer}>
          <img
            src={profileImage}
            alt={`${displayName}'s profile`}
            className={styles.profileImage}
          />
        </div>

        <div className={styles.profileInfo}>
          <h1 className={styles.profileName}>{displayName}</h1>

          <div className={styles.profileStats}>
            <div className={styles.statItem}>
              <span className={styles.statCount}>{dishListsCount}</span>
              <span className={styles.statLabel}>DishLists</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statCount}>{recipesCount}</span>
              <span className={styles.statLabel}>Recipes</span>
            </div>
          </div>

          {user.bio && <p className={styles.profileBio}>{user.bio}</p>}
        </div>

        {isCurrentUser && (
          <button className={styles.editProfileBtn} onClick={handleEditProfile}>
            Edit Profile
          </button>
        )}
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          refetchProfile={refetchProfile} 
        />
      )}
    </div>
  );
};

export default ProfileHeader;
