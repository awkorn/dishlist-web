import React, { useState, useRef, useEffect } from 'react';
import styles from './ImageCropper.module.css';

const ImageCropper = ({ imageUrl, onCropComplete, aspectRatio = 4/3 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });

  // Initialize crop area when image loads
  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      initCropArea();
    } else if (imageRef.current) {
      imageRef.current.onload = initCropArea;
    }
  }, [imageUrl]);

  const initCropArea = () => {
    if (!imageRef.current || !containerRef.current) return;
    
    const img = imageRef.current;
    
    // Set image dimensions
    setImageSize({ width: img.width, height: img.height });
    
    // Calculate initial crop area based on aspect ratio
    let cropWidth, cropHeight;
    
    if (img.width / img.height > aspectRatio) {
      // Image is wider than our target aspect ratio
      cropHeight = img.height;
      cropWidth = cropHeight * aspectRatio;
    } else {
      // Image is taller than our target aspect ratio
      cropWidth = img.width;
      cropHeight = cropWidth / aspectRatio;
    }
    
    // Center the crop area
    const x = (img.width - cropWidth) / 2;
    const y = (img.height - cropHeight) / 2;
    
    setCropArea({ x, y, width: cropWidth, height: cropHeight });
  };

  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    
    e.preventDefault();
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - containerRect.left;
    const offsetY = e.clientY - containerRect.top;
    
    // Store start position for drag calculation
    startPosRef.current = { x: offsetX, y: offsetY };
    lastPosRef.current = { x: cropArea.x, y: cropArea.y };
    
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - containerRect.left;
    const offsetY = e.clientY - containerRect.top;
    
    // Calculate drag distance
    const deltaX = offsetX - startPosRef.current.x;
    const deltaY = offsetY - startPosRef.current.y;
    
    // Update crop area position
    let newX = lastPosRef.current.x + deltaX;
    let newY = lastPosRef.current.y + deltaY;
    
    // Boundary checking
    newX = Math.max(0, Math.min(newX, imageSize.width - cropArea.width));
    newY = Math.max(0, Math.min(newY, imageSize.height - cropArea.height));
    
    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResize = (direction, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    
    const initialArea = { ...cropArea };
    
    const handleResizeMove = (moveEvent) => {
      const currentX = moveEvent.clientX;
      const currentY = moveEvent.clientY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      
      let newArea = { ...initialArea };
      
      // Calculate new dimensions based on resize direction while maintaining aspect ratio
      if (direction.includes('e')) { // Right edge
        newArea.width = Math.max(50, initialArea.width + deltaX);
        newArea.height = newArea.width / aspectRatio;
      } else if (direction.includes('w')) { // Left edge
        const newWidth = Math.max(50, initialArea.width - deltaX);
        newArea.width = newWidth;
        newArea.height = newWidth / aspectRatio;
        newArea.x = initialArea.x + (initialArea.width - newArea.width);
      }
      
      if (direction.includes('s')) { // Bottom edge
        newArea.height = Math.max(50, initialArea.height + deltaY);
        newArea.width = newArea.height * aspectRatio;
      } else if (direction.includes('n')) { // Top edge
        const newHeight = Math.max(50, initialArea.height - deltaY);
        newArea.height = newHeight;
        newArea.width = newHeight * aspectRatio;
        newArea.y = initialArea.y + (initialArea.height - newArea.height);
      }
      
      // Boundary checking
      if (newArea.x < 0) {
        newArea.x = 0;
      }
      if (newArea.y < 0) {
        newArea.y = 0;
      }
      if (newArea.x + newArea.width > imageSize.width) {
        newArea.width = imageSize.width - newArea.x;
        newArea.height = newArea.width / aspectRatio;
      }
      if (newArea.y + newArea.height > imageSize.height) {
        newArea.height = imageSize.height - newArea.y;
        newArea.width = newArea.height * aspectRatio;
      }
      
      setCropArea(newArea);
    };
    
    const handleResizeUp = () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeUp);
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeUp);
  };

  const applyCrop = () => {
    if (!imageRef.current) return;
    
    // Create a canvas to draw the cropped image
    const canvas = document.createElement('canvas');
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      imageRef.current,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, cropArea.width, cropArea.height
    );
    
    // Get the data URL of the cropped image
    const croppedImageUrl = canvas.toDataURL('image/jpeg');
    
    // Send cropped image back to parent component
    onCropComplete(croppedImageUrl);
  };

  return (
    <div className={styles.imageCropper}>
      <div 
        ref={containerRef}
        className={styles.cropContainer}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img 
          ref={imageRef}
          src={imageUrl} 
          alt="Crop preview" 
          className={styles.cropImage}
        />
        <div
          className={styles.cropOverlay}
          style={{
            left: `${cropArea.x}px`,
            top: `${cropArea.y}px`,
            width: `${cropArea.width}px`,
            height: `${cropArea.height}px`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {/* Resize handles - 8 directions */}
          <div className={`${styles.resizeHandle} ${styles.topLeft}`} onMouseDown={(e) => handleResize('nw', e)}></div>
          <div className={`${styles.resizeHandle} ${styles.top}`} onMouseDown={(e) => handleResize('n', e)}></div>
          <div className={`${styles.resizeHandle} ${styles.topRight}`} onMouseDown={(e) => handleResize('ne', e)}></div>
          <div className={`${styles.resizeHandle} ${styles.right}`} onMouseDown={(e) => handleResize('e', e)}></div>
          <div className={`${styles.resizeHandle} ${styles.bottomRight}`} onMouseDown={(e) => handleResize('se', e)}></div>
          <div className={`${styles.resizeHandle} ${styles.bottom}`} onMouseDown={(e) => handleResize('s', e)}></div>
          <div className={`${styles.resizeHandle} ${styles.bottomLeft}`} onMouseDown={(e) => handleResize('sw', e)}></div>
          <div className={`${styles.resizeHandle} ${styles.left}`} onMouseDown={(e) => handleResize('w', e)}></div>
        </div>
      </div>
      
      <div className={styles.cropControls}>
        <p className={styles.cropInstructions}>
          Drag to reposition. Use the corner handles to resize the crop area.
        </p>
        <button className={styles.applyCropBtn} onClick={applyCrop}>
          Apply Crop
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;