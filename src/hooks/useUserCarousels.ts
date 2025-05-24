
import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { db } from '@/integrations/firebase/client';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
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
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const [carousels, setCarousels] = useState<UserCarousel[]>([]);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const fetchUserCarousels = async () => {
      if (!user) {
        console.log('[useUserCarousels] Usuário não autenticado');
        return;
      }

      try {
        setLoading(true);
        console.log('[useUserCarousels] Iniciando busca de carrosséis para usuário:', {
          uid: user.uid,
          email: user.email,
          timestamp: new Date().toISOString()
        });

        const carouselsRef = collection(db, 'carousels');
        const q = query(
          carouselsRef,
          where('user_id', '==', user.uid),
          orderBy('updated_at', 'desc'),
          limit(10)
        );

        console.log('[useUserCarousels] Query configurada:', {
          collection: 'carousels',
          filter: `user_id == ${user.uid}`,
          orderBy: 'updated_at desc',
          limit: 10
        });

        const querySnapshot = await getDocs(q);
        
        console.log('[useUserCarousels] Resultado da query:', {
          docs_count: querySnapshot.docs.length,
          empty: querySnapshot.empty,
          size: querySnapshot.size
        });

        if (querySnapshot.empty) {
          console.log('[useUserCarousels] Nenhum carrossel encontrado para este usuário');
          setCarousels([]);
          setDebugInfo({
            user_id: user.uid,
            query_executed: true,
            docs_found: 0,
            last_search: new Date().toISOString()
          });
          return;
        }

        const carouselsData: UserCarousel[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('[useUserCarousels] Documento encontrado:', {
            id: doc.id,
            data: data,
            user_id: data.user_id
          });
          
          return {
            id: doc.id,
            ...data
          } as UserCarousel;
        });

        console.log('[useUserCarousels] Carrosséis processados:', {
          count: carouselsData.length,
          carousels: carouselsData.map(c => ({
            id: c.id,
            title: c.title,
            layout_type: c.layout_type
          }))
        });

        setCarousels(carouselsData);
        setDebugInfo({
          user_id: user.uid,
          query_executed: true,
          docs_found: carouselsData.length,
          last_search: new Date().toISOString(),
          carousels_ids: carouselsData.map(c => c.id)
        });

        toast({
          title: "Carrosséis carregados",
          description: `${carouselsData.length} carrosséis encontrados`,
          autoShow: true
        });

      } catch (error) {
        console.error('[useUserCarousels] Erro detalhado ao carregar carrosséis:', {
          error: error,
          error_message: error instanceof Error ? error.message : 'Erro desconhecido',
          error_code: (error as any)?.code,
          user_id: user.uid,
          timestamp: new Date().toISOString()
        });
        
        toast({
          title: "Erro ao carregar carrosséis",
          description: `Detalhes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          variant: "destructive",
          autoShow: true
        });

        setDebugInfo({
          user_id: user.uid,
          query_executed: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          last_search: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserCarousels();
  }, [user, toast]);

  return { carousels, loading, debugInfo };
};
