
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/integrations/firebase/client";
import { ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";

interface GalleryImage {
  name: string;
  url: string;
}

export const useFirebaseGalleryImages = (userId: string | undefined, carouselId: string) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchImages = async () => {
    try {
      setLoading(true);
      
      if (!userId) {
        console.warn("Usuário não autenticado. Algumas funcionalidades podem não estar disponíveis.");
        setLoading(false);
        return;
      }
      
      // Path structure: carousel-images/user_id/carousel_id/
      const path = `carousel-images/${userId}/${carouselId}`;
      const storageRef = ref(storage, path);

      // List all files in the path
      const result = await listAll(storageRef);
      
      if (result.items && result.items.length > 0) {
        // Get URLs for all images
        const imageData = await Promise.all(
          result.items.map(async (item) => {
            const downloadURL = await getDownloadURL(item);
            
            return { 
              name: item.name,
              url: downloadURL
            };
          })
        );
        
        setImages(imageData);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error("Error fetching images from Firebase:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as imagens do Firebase Storage",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageName: string) => {
    try {
      if (!userId) {
        toast({
          title: "Erro",
          description: "Você precisa estar autenticado para remover imagens",
          variant: "destructive"
        });
        return;
      }
      
      // Full path to the file
      const filePath = `carousel-images/${userId}/${carouselId}/${imageName}`;
      const storageRef = ref(storage, filePath);
      
      await deleteObject(storageRef);
      
      // Update local state
      setImages(images.filter(img => img.name !== imageName));
      
      toast({
        title: "Imagem removida",
        description: "A imagem foi removida com sucesso"
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a imagem",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchImages();
  }, [carouselId, userId]);

  return {
    images,
    loading,
    fetchImages,
    deleteImage
  };
};
