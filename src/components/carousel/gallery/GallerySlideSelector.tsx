
import React from "react";
import { Button } from "@/components/ui/button";

interface GallerySlideSelectorProps {
  selectedImageIndex: number | null;
  slideIndex: number;
  onSlideIndexChange: (index: number) => void;
  onApply: () => void;
}

const GallerySlideSelector: React.FC<GallerySlideSelectorProps> = ({
  selectedImageIndex,
  slideIndex,
  onSlideIndexChange,
  onApply
}) => {
  if (selectedImageIndex === null) return null;

  return (
    <div className="bg-gray-700 p-4 rounded-md mt-4">
      <h4 className="text-sm font-medium text-white mb-2">Aplicar ao slide:</h4>
      <div className="flex items-center space-x-4">
        <input
          type="number"
          min="1"
          className="bg-gray-600 text-white p-2 w-16 rounded"
          value={slideIndex + 1}
          onChange={(e) => onSlideIndexChange(Math.max(0, parseInt(e.target.value) - 1 || 0))}
        />
        <Button
          onClick={onApply}
          className="bg-gradient-to-r from-purple-500 to-blue-500"
        >
          Aplicar ao slide {slideIndex + 1}
        </Button>
      </div>
    </div>
  );
};

export default GallerySlideSelector;
