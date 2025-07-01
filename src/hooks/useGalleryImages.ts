
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface GalleryImage {
  name: string;
  url: string;
}

export const useGalleryImages = (userId: string | undefined, carouselId: string) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchImages = async () => {
    setLoading(true);
    try {
      // Por simplicidade, usar localStorage para armazenar imagens
      const savedImages = localStorage.getItem(`gallery_images_${carouselId}`);
      if (savedImages) {
        const parsedImages = JSON.parse(savedImages);
        setImages(parsedImages);
      }
    } catch (error) {
      console.error("Erro ao carregar imagens:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as imagens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageName: string) => {
    try {
      const updatedImages = images.filter(img => img.name !== imageName);
      setImages(updatedImages);
      localStorage.setItem(`gallery_images_${carouselId}`, JSON.stringify(updatedImages));
      
      toast({
        title: "Imagem removida",
        description: "A imagem foi removida com sucesso"
      });
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a imagem",
        variant: "destructive"
      });
    }
  };

  const addImage = (image: GalleryImage) => {
    const updatedImages = [...images, image];
    setImages(updatedImages);
    localStorage.setItem(`gallery_images_${carouselId}`, JSON.stringify(updatedImages));
  };

  useEffect(() => {
    if (carouselId) {
      fetchImages();
    }
  }, [carouselId]);

  return {
    images,
    loading,
    fetchImages,
    deleteImage,
    addImage
  };
};
