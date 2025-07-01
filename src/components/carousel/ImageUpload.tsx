
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ImageUploadArea from "./ImageUploadArea";
import ImagePreviewGrid from "./ImagePreviewGrid";
import ImageUploadButton from "./ImageUploadButton";

interface ImageUploadProps {
  carouselId: string;
  onImagesUploaded: (imageUrls: string[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ carouselId, onImagesUploaded }) => {
  const [previewImages, setPreviewImages] = useState<{ url: string; file: File }[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const MAX_IMAGES = 20;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const selectedFiles = Array.from(files);
    
    if (previewImages.length + selectedFiles.length > MAX_IMAGES) {
      toast({
        title: "Limite de imagens",
        description: `Você pode carregar no máximo ${MAX_IMAGES} imagens. Selecionando apenas as primeiras.`,
        variant: "destructive"
      });
      const availableSlots = MAX_IMAGES - previewImages.length;
      const filesToAdd = selectedFiles.slice(0, availableSlots);
      
      const newPreviews = filesToAdd.map(file => ({
        url: URL.createObjectURL(file),
        file
      }));
      
      setPreviewImages([...previewImages, ...newPreviews]);
      return;
    }
    
    const newPreviews = selectedFiles.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));
    
    setPreviewImages([...previewImages, ...newPreviews]);
  };
  
  const removeImage = (index: number) => {
    const updatedImages = [...previewImages];
    URL.revokeObjectURL(updatedImages[index].url);
    updatedImages.splice(index, 1);
    setPreviewImages(updatedImages);
  };
  
  const uploadImages = async () => {
    if (previewImages.length === 0) return;
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para fazer upload de imagens",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUploading(true);
      const uploadedUrls: string[] = [];
      
      for (const preview of previewImages) {
        const fileName = `${user.id}/${carouselId}/${Date.now()}-${preview.file.name}`;
        
        const { data, error } = await supabase.storage
          .from('carousel-images')
          .upload(fileName, preview.file);
        
        if (error) {
          console.error('Upload error:', error);
          throw error;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('carousel-images')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(publicUrl);
      }
      
      if (uploadedUrls.length > 0) {
        onImagesUploaded(uploadedUrls);
        setPreviewImages([]);
        
        toast({
          title: "Upload concluído",
          description: `${uploadedUrls.length} ${uploadedUrls.length === 1 ? 'imagem enviada' : 'imagens enviadas'} com sucesso!`
        });
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar as imagens. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
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
