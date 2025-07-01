
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

  const fetchCarousels = async () => {
    if (!user) {
      console.log('[Dashboard] Usuário não autenticado, redirecionando...');
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      console.log('[Dashboard] Iniciando busca de carrosséis para usuário:', user.uid);

      const carouselsCollectionRef = collection(db, "carousels");
      const carouselsQuery = query(
        carouselsCollectionRef,
        where("user_id", "==", user.uid)
      );

      const carouselsSnapshot = await getDocs(carouselsQuery);

      const carouselsList: Carousel[] = carouselsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          layout_type: data.layout_type || "instagram_rect",
        } as Carousel;
      });

      // Ordenar por data de atualização
      carouselsList.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
        const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
        return dateB - dateA;
      });

      console.log('[Dashboard] Carrosséis carregados:', carouselsList.length);
      setCarousels(carouselsList);

    } catch (error: any) {
      console.error('[Dashboard] Erro ao carregar carrosséis:', error);
      toast({
        title: "Erro ao carregar carrosséis",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      console.log('[Dashboard] Excluindo carrossel:', id);
      
      const carouselDocRef = doc(db, "carousels", id);
      await deleteDoc(carouselDocRef);

      setCarousels(carousels.filter((carousel) => carousel.id !== id));
      
      toast({
        title: "Carrossel excluído com sucesso"
      });
    } catch (error: any) {
      console.error('[Dashboard] Erro ao excluir carrossel:', error);
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
    fetchCarousels,
    handleDelete
  };
};
