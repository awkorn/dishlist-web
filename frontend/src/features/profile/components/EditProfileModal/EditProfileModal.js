import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_USER_PROFILE } from "../../../../graphql/mutations/userProfile";
import { GET_USER_PROFILE } from "../../../../graphql/queries/userProfile";
import { toast } from "react-toastify";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import styles from "./EditProfileModal.module.css";

const EditProfileModal = ({ user, onClose, refetchProfile }) => {
  const [username, setUsername] = useState(user.username || "");
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user.profilePicture || null);
  const [uploading, setUploading] = useState(false);

  const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE, {
    onCompleted: () => {
      toast.success("Profile updated successfully!");
      refetchProfile();
      onClose();
    },
    onError: (error) => {
      toast.error(`Error updating profile: ${error.message}`);
    },
    // Add this update function to modify the Apollo cache
    update: (cache, { data: { updateUserProfile } }) => {
      try {
        // Read existing profile data from cache
        const existingData = cache.readQuery({
          query: GET_USER_PROFILE,
          variables: { userId: user.firebaseUid },
        });

        if (existingData) {
          // Create updated user data by merging existing data with new data
          const updatedUser = {
            ...existingData.getUserProfile,
            username: updateUserProfile.username,
            firstName: updateUserProfile.firstName,
            lastName: updateUserProfile.lastName,
            bio: updateUserProfile.bio,
            profilePicture: updateUserProfile.profilePicture,
          };

          // Write the merged data back to cache
          cache.writeQuery({
            query: GET_USER_PROFILE,
            variables: { userId: user.firebaseUid },
            data: { getUserProfile: updatedUser },
          });
        }
      } catch (error) {
        console.error("Error updating cache:", error);
      }
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setProfileImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let profilePictureUrl = user.profilePicture;

      // Upload new profile image if changed
      if (profileImage) {
        const storage = getStorage();
        const timestamp = new Date().getTime();
        const storageRef = ref(
          storage,
          `profile-images/${user.firebaseUid}_${timestamp}`
        );

        await uploadBytes(storageRef, profileImage);
        profilePictureUrl = await getDownloadURL(storageRef);
      }

      // Update user profile in the database
      await updateUserProfile({
        variables: {
          userId: user.firebaseUid,
          username,
          firstName,
          lastName,
          bio,
          profilePicture: profilePictureUrl,
        },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Edit Profile</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <form className={styles.editForm} onSubmit={handleSubmit}>
          <div className={styles.imageSection}>
            <div className={styles.currentImage}>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className={styles.previewImage}
                />
              ) : (
                <div className={styles.placeholderImage}>
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className={styles.uploadControls}>
              <label htmlFor="profile-image" className={styles.uploadButton}>
                Change Profile Picture
              </label>
              <input
                type="file"
                id="profile-image"
                onChange={handleImageChange}
                className={styles.fileInput}
                accept="image/jpeg, image/png"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.nameFields}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bio">Bio (Optional)</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={styles.formTextarea}
              placeholder="Tell us a bit about yourself..."
              rows="4"
              maxLength="200"
            />
            <div className={styles.charCount}>{bio ? bio.length : 0}/200</div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={uploading}
            >
              {uploading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
