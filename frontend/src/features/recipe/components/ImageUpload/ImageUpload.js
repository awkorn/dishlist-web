import React, { useState, useRef, useCallback } from "react";
import { useRecipeForm } from "../../../../contexts/RecipeFormContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import styles from "./ImageUpload.module.css";

const ImageUpload = () => {
  const { image, setImage, errors } = useRecipeForm();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState(null);
  const [crop, setCrop] = useState({ unit: "%", width: 80, aspect: 4 / 3 });
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  const TARGET_ASPECT_RATIO = 4 / 3;

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please select a valid image file (JPEG, PNG)");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("Image size should be less than 5MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setTempImageUrl(previewUrl);
    setShowCropper(true);
    setUploadError(null);
  };

  const handleCropComplete = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!imageRef.current || !crop.width || !crop.height) return;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;

      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;
      const pixelCrop = {
        x: crop.x * scaleX,
        y: crop.y * scaleY,
        width: crop.width * scaleX,
        height: crop.height * scaleY,
      };

      const isRotated = rotation === 90 || rotation === 270;
      canvas.width = isRotated ? pixelCrop.height : pixelCrop.width;
      canvas.height = isRotated ? pixelCrop.width : pixelCrop.height;

      ctx.save();
      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      ctx.drawImage(
        img,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.restore();

      const croppedImageUrl = canvas.toDataURL("image/jpeg", 0.9);

      try {
        setIsUploading(true);
        setRotation(0);

        const response = await fetch(croppedImageUrl);
        const blob = await response.blob();

        const timestamp = new Date().getTime();
        const fileName = `cropped_image_${timestamp}.jpg`;

        const storage = getStorage();
        const storageRef = ref(storage, `recipe-images/${fileName}`);

        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);

        setImage({
          preview: croppedImageUrl,
          url: downloadUrl,
          name: fileName,
          path: storageRef.fullPath,
          rotation: 0,
        });

        setShowCropper(false);
        setTempImageUrl(null);
      } catch (error) {
        console.error("Error uploading cropped image:", error);
        setUploadError("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [crop, rotation, setImage]
  );

  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const rotateImage = (direction) => {
    const newRotation =
      direction === "clockwise"
        ? (rotation + 90) % 360
        : (rotation - 90 + 360) % 360;
    setRotation(newRotation);
  };

  const handleCancelCrop = (e) => {
    e.preventDefault();
    setShowCropper(false);
    setTempImageUrl(null);
    setRotation(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        <>
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
          <div className={styles.cropContainer}>
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              onComplete={setCrop}
              aspect={TARGET_ASPECT_RATIO}
            >
              <img
                ref={imageRef}
                src={tempImageUrl}
                alt="Crop preview"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  maxWidth: "100%",
                  maxHeight: "30rem",
                }}
              />
            </ReactCrop>
          </div>
          <div className={styles.cropControls}>
            <p className={styles.cropInstructions}>
              Drag to reposition. Use handles to resize the crop area.
            </p>
            <button
              type="button"
              className={styles.applyCropBtn}
              onClick={handleCropComplete}
            >
              Apply Crop
            </button>
            <button
              type="button"
              className={styles.cancelCropBtn}
              onClick={handleCancelCrop}
            >
              Cancel Cropping
            </button>
          </div>
        </>
      ) : (
        <div className={styles.uploadContainer}>
          {image && (image.preview || image.url) ? (
            <div className={styles.previewContainer}>
              <img
                src={image.preview || image.url}
                alt="Recipe preview"
                className={styles.imagePreview}
                style={
                  image.rotation
                    ? { transform: `rotate(${image.rotation}deg)` }
                    : {}
                }
              />
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
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
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
