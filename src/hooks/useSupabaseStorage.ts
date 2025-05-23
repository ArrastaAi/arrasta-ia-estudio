import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { convertToJpeg } from "@/utils/imageProcessing";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { firestore } from "@/integrations/firebase/client";

interface UseSupabaseStorageProps {
  userId: string | undefined;
  carouselId: string;
}

export const useSupabaseStorage = ({ userId, carouselId }: UseSupabaseStorageProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [bucketExists, setBucketExists] = useState(false);

  // Check if bucket exists on component mount
  useEffect(() => {
    checkBucket();
  }, []);

  const checkBucket = async () => {
    try {
      // Check if we can list the buckets (this validates access)
      //const { data: buckets, error } = await supabase.storage.listBuckets();
      
      //if (error) {
      //  console.error("Erro ao verificar buckets:", error);
      //  return;
      //}
      
      // Check if the bucket exists
      //if (buckets) {
      //  const bucketExists = buckets.some(bucket => bucket.name === 'carousel-images');
      //  if (bucketExists) {
      //    console.log("Bucket 'carousel-images' encontrado.");
      //    setBucketExists(true);
      //  } else {
      //    console.log("Bucket 'carousel-images' não encontrado. O bucket precisa ser criado pelo administrador.");
      //    setBucketExists(false);
      //  }
      //}
      setBucketExists(true);
    } catch (error) {
      console.error("Erro ao verificar buckets:", error);
    }
  };

  const uploadImagesToSupabase = async (previewImages: { url: string; file: File }[]): Promise<string[]> => {
    if (!userId) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para fazer upload de imagens",
        variant: "destructive",
        context: "auth-required"
      });
      return [];
    }

    // If bucket doesn't exist, we'll use local URLs
    if (!bucketExists) {
      console.log("Bucket não disponível, usando URLs locais");
      return previewImages.map(img => img.url);
    }

    setUploading(true);
    const uploadedUrls: string[] = [];
    const uploadErrors: string[] = [];
    
    try {
      // Path structure: user_id/carousel_id/
      const basePath = `${userId}/${carouselId}`;
      
      for (const item of previewImages) {
        const fileName = `${Date.now()}-${item.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `${basePath}/${fileName}`;
        
        console.log("Enviando:", filePath, "Tamanho:", (item.file.size / (1024 * 1024)).toFixed(2) + " MB");
        
        try {
          // Convert image to JPEG before upload for better quality
          const blob = await convertToJpeg(item.file);
          
          const storage = getStorage();
          const storageRef = ref(storage, `carousel-images/${filePath}`);

          // Upload the image to Cloud Storage
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
          context: "upload-success"
        });
      } else if (uploadErrors.length > 0 && uploadedUrls.length > uploadErrors.length) {
        toast({
          title: "Upload parcial",
          description: `${uploadedUrls.length - uploadErrors.length} imagens enviadas com sucesso. ${uploadErrors.length} imagens com erros.`,
          variant: "warning",
          context: "upload-partial"
        });
      }
      
      return uploadedUrls;
    } catch (error) {
      console.error("Erro ao enviar imagens:", error);
      
      // In case of general error, try to use all local images
      return previewImages.map(img => img.url);
    } finally {
      setUploading(false);
    }
  };
  
  return {
    uploading,
    bucketExists,
    checkBucket,
    uploadImagesToSupabase
  };
};
