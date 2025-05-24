
/**
 * Utility functions for image processing and conversion
 */

/**
 * Converts an image file to JPEG format with high quality
 * @param file - The file to convert
 * @returns Promise resolving to a Blob in JPEG format
 */
export const convertToJpeg = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // For files already JPEG, return the file original
    if (file.type === 'image/jpeg') {
      resolve(file);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert to JPEG with high quality (0.9)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image to JPEG'));
            }
          },
          'image/jpeg',
          0.9 // High quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Rotates an image by a specified angle
 * @param imageUrl - URL of the image to rotate
 * @param angle - Angle in degrees to rotate
 * @returns Promise resolving to the rotated image URL
 */
export const rotateImage = async (imageUrl: string, angle: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Calculate new dimensions based on rotation
      let width = img.width;
      let height = img.height;
      
      if (angle === 90 || angle === 270) {
        // Swap dimensions for 90/270 degree rotations
        [width, height] = [height, width];
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Move to center of canvas
      ctx.translate(width / 2, height / 2);
      
      // Rotate canvas
      ctx.rotate((angle * Math.PI) / 180);
      
      // Draw the image centered and rotated
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      // Get data URL
      const rotatedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve(rotatedImageUrl);
    };
    
    img.onerror = () => reject(new Error('Failed to load image for rotation'));
    img.src = imageUrl;
  });
};

/**
 * Resizes an image to fit within specified dimensions while maintaining aspect ratio
 * @param imageUrl - URL of the image to resize
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns Promise resolving to the resized image URL
 */
export const resizeImage = async (
  imageUrl: string, 
  maxWidth: number, 
  maxHeight: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate aspect ratio
      const aspectRatio = img.width / img.height;
      
      // Determine new dimensions
      let newWidth = img.width;
      let newHeight = img.height;
      
      if (newWidth > maxWidth) {
        newWidth = maxWidth;
        newHeight = newWidth / aspectRatio;
      }
      
      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
      }
      
      // Create canvas with new dimensions
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Draw resized image
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Get data URL
      const resizedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve(resizedImageUrl);
    };
    
    img.onerror = () => reject(new Error('Failed to load image for resizing'));
    img.src = imageUrl;
  });
};

/**
 * Crops an image to the specified region
 * @param imageUrl - URL of the image to crop
 * @param cropArea - Area to crop (x, y, width, height)
 * @returns Promise resolving to the cropped image URL
 */
export const cropImage = async (
  imageUrl: string,
  cropArea: { x: number; y: number; width: number; height: number }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Draw only the cropped portion
      ctx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, cropArea.width, cropArea.height
      );
      
      // Get data URL
      const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve(croppedImageUrl);
    };
    
    img.onerror = () => reject(new Error('Failed to load image for cropping'));
    img.src = imageUrl;
  });
};
