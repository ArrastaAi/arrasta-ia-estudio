
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import GalleryImage from "./gallery/GalleryImage";
import GallerySlideSelector from "./gallery/GallerySlideSelector";
import GalleryEmptyState from "./gallery/GalleryEmptyState";
import GalleryLoading from "./gallery/GalleryLoading";

interface ImageGalleryProps {
  carouselId: string;
  onSelectImage: (imageUrl: string, slideIndex: number) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ carouselId, onSelectImage }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [slideToApply, setSlideToApply] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { images, loading, deleteImage } = useGalleryImages(user?.id, carouselId);

  const handleApplyToSlide = () => {
    if (selectedIndex === null) return;
    
    onSelectImage(images[selectedIndex].url, slideToApply);
    toast({
      title: "Imagem aplicada",
      description: `Imagem aplicada ao slide ${slideToApply + 1}`
    });
  };

  if (loading) {
    return <GalleryLoading />;
  }

  if (images.length === 0) {
    return <GalleryEmptyState />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white mb-2">Galeria de Imagens</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((image, index) => (
          <GalleryImage
            key={image.name}
            url={image.url}
            name={image.name}
            isSelected={selectedIndex === index}
            onSelect={() => setSelectedIndex(index)}
            onDelete={() => deleteImage(image.name)}
          />
        ))}
      </div>
      
      <GallerySlideSelector
        selectedImageIndex={selectedIndex}
        slideIndex={slideToApply}
        onSlideIndexChange={setSlideToApply}
        onApply={handleApplyToSlide}
      />
    </div>
  );
};

export default ImageGallery;
