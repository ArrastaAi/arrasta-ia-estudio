
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { convertToJpeg } from "@/utils/imageProcessing";
import { storage } from "@/integrations/firebase/client";
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

interface UseFirebaseStorageProps {
  userId: string | undefined;
  carouselId: string;
}

export const useFirebaseStorage = ({ userId, carouselId }: UseFirebaseStorageProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);

  // Check storage availability
  useEffect(() => {
    try {
      if (storage) {
        setStorageAvailable(true);
      }
    } catch (error) {
      console.error("Erro ao verificar Firebase Storage:", error);
      setStorageAvailable(false);
    }
  }, []);

  const uploadImagesToFirebase = async (previewImages: { url: string; file: File }[]): Promise<string[]> => {
    if (!userId) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para fazer upload de imagens",
        variant: "destructive",
      });
      return [];
    }

    if (!storageAvailable) {
      console.log("Firebase Storage não disponível, usando URLs locais");
      return previewImages.map(img => img.url);
    }

    setUploading(true);
    const uploadedUrls: string[] = [];
    const uploadErrors: string[] = [];
    
    try {
      // Path structure: carousel-images/user_id/carousel_id/
      const basePath = `carousel-images/${userId}/${carouselId}`;
      
      for (const item of previewImages) {
        const fileName = `${uuidv4()}-${item.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `${basePath}/${fileName}`;
        
        console.log("Enviando para Firebase Storage:", filePath, "Tamanho:", (item.file.size / (1024 * 1024)).toFixed(2) + " MB");
        
        try {
          // Convert image to JPEG before upload
          const blob = await convertToJpeg(item.file);
          
          const storageRef = ref(storage, filePath);
          
          // Upload the image to Firebase Storage
          const snapshot = await uploadBytes(storageRef, blob);
          
          // Get the public URL
          const downloadURL = await getDownloadURL(snapshot.ref);
          
          uploadedUrls.push(downloadURL);
        } catch (uploadError) {
          console.error("Erro ao enviar imagem:", uploadError);
          uploadErrors.push(item.file.name);
          
          // In case of error, add local URL as fallback
          uploadedUrls.push(item.url);
        }
      }
      
      // Show feedback about the upload
      if (uploadErrors.length === 0 && uploadedUrls.length > 0) {
        toast({
          title: "Sucesso!",
          description: `${uploadedUrls.length} imagens processadas com sucesso.`,
        });
      } else if (uploadErrors.length > 0 && uploadedUrls.length > uploadErrors.length) {
        toast({
          title: "Upload parcial",
          description: `${uploadedUrls.length - uploadErrors.length} imagens enviadas com sucesso. ${uploadErrors.length} imagens com erros.`,
          variant: "destructive",
        });
      }
      
      return uploadedUrls;
    } catch (error) {
      console.error("Erro ao enviar imagens:", error);
      
      // In case of general error, use local images
      return previewImages.map(img => img.url);
    } finally {
      setUploading(false);
    }
  };

  const deleteImageFromFirebase = async (imageUrl: string): Promise<boolean> => {
    try {
      if (!userId || !imageUrl.includes('firebase')) {
        return false;
      }

      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);
      
      toast({
        title: "Imagem removida",
        description: "A imagem foi removida com sucesso do Firebase Storage"
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a imagem",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return {
    uploading,
    storageAvailable,
    uploadImagesToFirebase,
    deleteImageFromFirebase
  };
};
