import React, { useState, useRef } from "react";
import { useRecipeForm } from "../../../../contexts/RecipeFormContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ImageCropper from "../ImageCropper/ImageCropper"; // Import the custom cropper
import styles from "./ImageUpload.module.css";

const ImageUpload = () => {
  const { image, setImage, errors } = useRecipeForm();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Define the target aspect ratio
  const TARGET_ASPECT_RATIO = 4 / 3; // You can adjust this as needed

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please select a valid image file (JPEG, PNG)");
      return;
    }

    // Validate file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setUploadError("Image size should be less than 5MB");
      return;
    }

    // Create a temporary URL for the cropper
    const previewUrl = URL.createObjectURL(file);
    setTempImageUrl(previewUrl);
    setShowCropper(true); // Show the cropper
    setUploadError(null);
  };

  const handleCropComplete = async (croppedImageUrl) => {
    try {
      setIsUploading(true);
      setRotation(0); // Reset rotation for new images

      // Convert data URL to blob
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();

      // Generate a file name
      const timestamp = new Date().getTime();
      const fileName = `cropped_image_${timestamp}.jpg`;

      // Upload to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `recipe-images/${fileName}`);

      // Upload the blob
      await uploadBytes(storageRef, blob);

      // Get the download URL
      const downloadUrl = await getDownloadURL(storageRef);

      // Update form context with image data
      setImage({
        preview: croppedImageUrl,
        url: downloadUrl,
        name: fileName,
        path: storageRef.fullPath,
        rotation: 0,
      });

      // Hide cropper and clean up temp image
      setShowCropper(false);
      setTempImageUrl(null);
    } catch (error) {
      console.error("Error uploading cropped image:", error);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const rotateImage = (direction) => {
    const newRotation =
      direction === "clockwise"
        ? (rotation + 90) % 360
        : (rotation - 90 + 360) % 360;

    setRotation(newRotation);

    // Update the image object with new rotation
    if (image) {
      setImage({
        ...image,
        rotation: newRotation,
      });
    }
  };

  // Get the correct transform style based on current rotation
  const getRotationStyle = () => {
    return {
      transform: `rotate(${rotation}deg)`,
      transition: "transform 0.3s ease",
    };
  };

  // Cancel cropping and go back to the file selection
  const handleCancelCrop = () => {
    setShowCropper(false);
    setTempImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.imageUploadSection}>
      <h3>Recipe Image</h3>
      {!showCropper && (
        <p className={styles.uploadHint}>
          For best results, use images with a 4:3 aspect ratio
        </p>
      )}
      {errors.image && <p className={styles.errorMessage}>{errors.image}</p>}

      {showCropper && tempImageUrl ? (
        // Show image cropper when we have a temp image
        <div>
          <ImageCropper
            imageUrl={tempImageUrl}
            onCropComplete={handleCropComplete}
            aspectRatio={TARGET_ASPECT_RATIO}
          />
          <button className={styles.cancelCropBtn} onClick={handleCancelCrop}>
            Cancel Cropping
          </button>
        </div>
      ) : (
        // Show regular upload UI or preview when not cropping
        <div className={styles.uploadContainer}>
          {image && image.preview ? (
            <div className={styles.previewContainer}>
              <img
                src={image.preview}
                alt="Recipe preview"
                className={styles.imagePreview}
                style={getRotationStyle()}
              />

              {/* Rotation controls */}
              <div className={styles.rotationControls}>
                <button
                  type="button"
                  onClick={() => rotateImage("counter-clockwise")}
                  className={styles.rotateButton}
                  aria-label="Rotate counter-clockwise"
                >
                  ↺
                </button>
                <button
                  type="button"
                  onClick={() => rotateImage("clockwise")}
                  className={styles.rotateButton}
                  aria-label="Rotate clockwise"
                >
                  ↻
                </button>
              </div>

              <button
                type="button"
                onClick={handleRemoveImage}
                className={styles.removeImageBtn}
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className={styles.uploadArea} onClick={triggerFileInput}>
              <div className={styles.uploadIcon}>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <p className={styles.uploadText}>Click to add a recipe image</p>
              <p className={styles.uploadHint}>JPEG or PNG, max 5MB</p>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/jpeg, image/png, image/jpg"
            className={styles.fileInput}
          />
        </div>
      )}

      {isUploading && (
        <div className={styles.uploadingStatus}>
          <div className={styles.uploadingSpinner}></div>
          <span>Uploading image...</span>
        </div>
      )}

      {uploadError && <p className={styles.errorMessage}>{uploadError}</p>}
    </div>
  );
};

export default ImageUpload;
