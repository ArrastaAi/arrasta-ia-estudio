
import React from "react";
import { X } from "lucide-react";

interface ImagePreviewGridProps {
  images: { url: string; file: File }[];
  onRemoveImage: (index: number) => void;
}

const ImagePreviewGrid: React.FC<ImagePreviewGridProps> = ({ 
  images, 
  onRemoveImage 
}) => {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
      {images.map((img, index) => (
        <div key={index} className="relative group">
          <img 
            src={img.url} 
            alt={`Preview ${index}`} 
            className="w-full h-24 object-cover rounded-md" 
          />
          <button 
            className="absolute top-1 right-1 bg-gray-800/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemoveImage(index)}
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ImagePreviewGrid;
