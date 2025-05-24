
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/integrations/firebase/client";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Carousel } from "@/types/database.types";

export const useDashboardCarousels = () => {
  const { user } = useFirebaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>({});

  const fetchCarousels = async () => {
    if (!user) {
      console.log('[Dashboard] Usuário não autenticado, redirecionando...');
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      console.log('[Dashboard] Iniciando busca de carrosséis:', {
        user_id: user.uid,
        user_email: user.email,
        timestamp: new Date().toISOString()
      });

      const carouselsCollectionRef = collection(db, "carousels");
      const carouselsQuery = query(
        carouselsCollectionRef,
        where("user_id", "==", user.uid)
      );

      console.log('[Dashboard] Executando query:', {
        collection: 'carousels',
        where: `user_id == ${user.uid}`
      });

      const carouselsSnapshot = await getDocs(carouselsQuery);

      console.log('[Dashboard] Resultado da query:', {
        docs_count: carouselsSnapshot.docs.length,
        empty: carouselsSnapshot.empty,
        size: carouselsSnapshot.size
      });

      const carouselsList: Carousel[] = carouselsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('[Dashboard] Processando documento:', {
          id: doc.id,
          title: data.title,
          user_id: data.user_id,
          layout_type: data.layout_type,
          created_at: data.created_at
        });

        return {
          id: doc.id,
          ...data,
          layout_type: data.layout_type || "instagram_rect",
        } as Carousel;
      });

      // Ordenar no cliente por created_at ou updated_at
      carouselsList.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
        const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
        return dateB - dateA;
      });

      console.log('[Dashboard] Carrosséis processados:', {
        total: carouselsList.length,
        published: carouselsList.filter(c => c.published).length,
        drafts: carouselsList.filter(c => !c.published).length
      });

      setCarousels(carouselsList);
      setDebugInfo({
        user_id: user.uid,
        total_carousels: carouselsList.length,
        last_fetch: new Date().toISOString(),
        query_success: true
      });

    } catch (error: any) {
      console.error('[Dashboard] Erro detalhado ao carregar carrosséis:', {
        error: error,
        message: error?.message,
        code: error?.code,
        user_id: user.uid,
        timestamp: new Date().toISOString()
      });

      setDebugInfo({
        user_id: user.uid,
        error: error?.message || 'Erro desconhecido',
        last_fetch: new Date().toISOString(),
        query_success: false
      });

      toast({
        title: "Erro ao carregar carrosséis",
        description: `Detalhes: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      console.log('[Dashboard] Iniciando exclusão do carrossel:', id);
      
      const carouselDocRef = doc(db, "carousels", id);
      await deleteDoc(carouselDocRef);

      console.log('[Dashboard] Carrossel excluído com sucesso:', id);
      setCarousels(carousels.filter((carousel) => carousel.id !== id));
      
      toast({
        title: "Carrossel excluído com sucesso"
      });
    } catch (error: any) {
      console.error('[Dashboard] Erro ao excluir carrossel:', {
        carousel_id: id,
        error: error,
        message: error?.message
      });
      
      toast({
        title: "Erro ao excluir carrossel",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarousels();
  }, [user, navigate, toast]);

  return {
    carousels,
    loading,
    debugInfo,
    fetchCarousels,
    handleDelete
  };
};
