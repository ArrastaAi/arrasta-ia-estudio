
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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

      const { data, error } = await supabase
        .from('carousels')
        .select('*')
        .eq('user_id', user.uid)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      const carouselsList: Carousel[] = (data || []).map(carousel => ({
        ...carousel,
        layout_type: carousel.layout_type || "instagram_rect",
      }));

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
      
      const { error } = await supabase
        .from('carousels')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

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
  }, [user, navigate]);

  return {
    carousels,
    loading,
    fetchCarousels,
    handleDelete
  };
};
