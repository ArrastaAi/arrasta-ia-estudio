
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserCarousel {
  id: string;
  title: string;
  description: string | null;
  layout_type: string;
  created_at: string;
  updated_at: string;
}

export const useUserCarousels = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [carousels, setCarousels] = useState<UserCarousel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserCarousels = async () => {
      if (!user) {
        console.log('[useUserCarousels] Usuário não autenticado');
        setCarousels([]);
        return;
      }

      try {
        setLoading(true);
        console.log('[useUserCarousels] Iniciando busca de carrosséis para usuário:', user.id);

        const { data, error } = await supabase
          .from('carousels')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(10);

        if (error) {
          throw error;
        }

        const carouselsData: UserCarousel[] = (data || []).map(carousel => ({
          id: carousel.id,
          title: carousel.title || 'Carrossel sem título',
          description: carousel.description || null,
          layout_type: carousel.layout_type || 'feed_square',
          created_at: carousel.created_at || new Date().toISOString(),
          updated_at: carousel.updated_at || new Date().toISOString()
        }));

        console.log('[useUserCarousels] Carrosséis processados:', carouselsData.length);
        setCarousels(carouselsData);

        if (carouselsData.length > 0) {
          toast({
            title: "Carrosséis carregados",
            description: `${carouselsData.length} carrosséis encontrados`,
          });
        }

      } catch (error) {
        console.error('[useUserCarousels] Erro ao carregar carrosséis:', error);
        
        toast({
          title: "Erro ao carregar carrosséis",
          description: error instanceof Error ? error.message : 'Erro desconhecido',
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserCarousels();
  }, [user, toast]);

  return { carousels, loading };
};
