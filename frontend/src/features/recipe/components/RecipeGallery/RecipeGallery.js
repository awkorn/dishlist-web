import React, { useState } from 'react';
import styles from './RecipeGallery.module.css';

const RecipeGallery = ({ images = [] }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Check if we have valid images to display
  const validImages = images.filter(img => {
    if (!img) return false;
    if (typeof img === 'string') return img.trim() !== '';
    return img.url && img.url.trim() !== '';
  });
  
  // Don't render anything if there are no valid images
  if (validImages.length === 0) {
    return null;
  }
  
  const handleImageClick = (index) => {
    setSelectedImage(index);
  };
  
  const closeModal = () => {
    setSelectedImage(null);
  };
  
  const getImageSrc = (image) => {
    if (typeof image === 'string') return image;
    return image.url;
  };
  
  const getImageStyle = (image) => {
    if (image && typeof image === 'object' && image.rotation) {
      return {
        transform: `rotate(${image.rotation}deg)`,
        transformOrigin: 'center center',
      };
    }
    return {};
  };
  
  return (
    <div className={styles.gallerySection}>
      
      <div className={styles.thumbnailGrid}>
        {validImages.map((image, index) => (
          <div 
            key={index} 
            className={styles.thumbnailContainer}
            onClick={() => handleImageClick(index)}
          >
            <img 
              src={getImageSrc(image)} 
              alt={`Recipe pics ${index + 1}`}
              className={styles.thumbnail}
              style={getImageStyle(image)}
            />
          </div>
        ))}
      </div>
      
      {selectedImage !== null && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <img 
              src={getImageSrc(validImages[selectedImage])} 
              alt="Enlarged recipe" 
              className={styles.enlargedImage}
              style={getImageStyle(validImages[selectedImage])}
            />
            <button className={styles.closeButton} onClick={closeModal}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeGallery;