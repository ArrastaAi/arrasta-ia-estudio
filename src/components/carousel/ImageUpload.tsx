
import React, { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseStorage } from "@/hooks/useFirebaseStorage";
import ImageUploadArea from "./ImageUploadArea";
import ImagePreviewGrid from "./ImagePreviewGrid";
import ImageUploadButton from "./ImageUploadButton";

interface ImageUploadProps {
  carouselId: string;
  onImagesUploaded: (imageUrls: string[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ carouselId, onImagesUploaded }) => {
  const [previewImages, setPreviewImages] = useState<{ url: string; file: File }[]>([]);
  const { toast } = useToast();
  const { user } = useFirebaseAuth();
  const MAX_IMAGES = 20;
  
  const { uploading, uploadImagesToFirebase } = useFirebaseStorage({
    userId: user?.uid,
    carouselId
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const selectedFiles = Array.from(files);
    
    // Check only the image quantity limit
    if (previewImages.length + selectedFiles.length > MAX_IMAGES) {
      toast({
        title: "Limite de imagens",
        description: `Você pode carregar no máximo ${MAX_IMAGES} imagens. Selecionando apenas as primeiras.`,
        variant: "destructive"
      });
      // Select only the images that fit in the limit
      const availableSlots = MAX_IMAGES - previewImages.length;
      const filesToAdd = selectedFiles.slice(0, availableSlots);
      
      const newPreviews = filesToAdd.map(file => ({
        url: URL.createObjectURL(file),
        file
      }));
      
      setPreviewImages([...previewImages, ...newPreviews]);
      return;
    }
    
    // Create previews for the selected images
    const newPreviews = selectedFiles.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));
    
    setPreviewImages([...previewImages, ...newPreviews]);
  };
  
  const removeImage = (index: number) => {
    const updatedImages = [...previewImages];
    URL.revokeObjectURL(updatedImages[index].url); // Clean up URL
    updatedImages.splice(index, 1);
    setPreviewImages(updatedImages);
  };
  
  const uploadImages = async () => {
    if (previewImages.length === 0) return;
    
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para fazer upload de imagens",
        variant: "destructive"
      });
      return;
    }
    
    const uploadedUrls = await uploadImagesToFirebase(previewImages);
    
    // Send URLs to parent component
    if (uploadedUrls.length > 0) {
      onImagesUploaded(uploadedUrls);
    }
  };
  
  return (
    <div className="space-y-4">
      <ImageUploadArea 
        onFileSelect={handleFileChange}
        maxImages={MAX_IMAGES}
        disabled={uploading}
      />
      
      <ImagePreviewGrid 
        images={previewImages}
        onRemoveImage={removeImage}
      />
      
      {previewImages.length > 0 && (
        <ImageUploadButton 
          onUpload={uploadImages}
          uploading={uploading}
          imageCount={previewImages.length}
        />
      )}
    </div>
  );
};

export default ImageUpload;
