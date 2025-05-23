
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GalleryImage {
  name: string;
  url: string;
}

export const useGalleryImages = (userId: string | undefined, carouselId: string) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchImages = async () => {
    try {
      setLoading(true);
      
      if (!userId) {
        console.warn("Usuario não autenticado. Algumas funcionalidades podem não estar disponíveis.");
        setLoading(false);
        return;
      }
      
      // Caminho na estrutura de pastas: user_id/carousel_id/
      const path = `${userId}/${carouselId}`;

      // Listamos os arquivos do Supabase Storage
      const { data, error } = await supabase.storage
        .from('carousel-images')
        .list(path);
        
      if (error) {
        console.error("Erro ao listar imagens:", error);
        toast({
          title: "Erro ao carregar imagens",
          description: "Verifique se você tem permissão para acessar estas imagens.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      if (data && data.length > 0) {
        // Obtemos URLs públicas para todas as imagens
        const imageData = await Promise.all(
          data.map(async (file) => {
            const { data: { publicUrl } } = supabase.storage
              .from('carousel-images')
              .getPublicUrl(`${path}/${file.name}`);
              
            return { 
              name: file.name,
              url: publicUrl
            };
          })
        );
        
        setImages(imageData);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
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
      if (!userId) {
        toast({
          title: "Erro",
          description: "Você precisa estar autenticado para remover imagens",
          variant: "destructive"
        });
        return;
      }
      
      // Caminho completo para o arquivo
      const filePath = `${userId}/${carouselId}/${imageName}`;
      
      const { error } = await supabase.storage
        .from('carousel-images')
        .remove([filePath]);
        
      if (error) {
        console.error("Erro ao remover imagem:", error);
        toast({
          title: "Erro",
          description: "Não foi possível remover a imagem. Verifique as permissões.",
          variant: "destructive"
        });
        return;
      }
      
      // Atualizamos o estado local
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
