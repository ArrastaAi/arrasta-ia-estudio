
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
        setCarousels([]);
        setDebugInfo({
          user_authenticated: false,
          last_search: new Date().toISOString()
        });
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
        // Mudança: usar apenas user_id para evitar problema de índice
        const q = query(
          carouselsRef,
          where('user_id', '==', user.uid),
          limit(10)
        );

        console.log('[useUserCarousels] Query configurada:', {
          collection: 'carousels',
          filter: `user_id == ${user.uid}`,
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
            last_search: new Date().toISOString(),
            index_issue: false
          });
          return;
        }

        const carouselsData: UserCarousel[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('[useUserCarousels] Documento encontrado:', {
            id: doc.id,
            title: data.title,
            user_id: data.user_id,
            created_at: data.created_at,
            updated_at: data.updated_at
          });
          
          return {
            id: doc.id,
            title: data.title || 'Carrossel sem título',
            description: data.description || null,
            layout_type: data.layout_type || 'feed_square',
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || new Date().toISOString()
          } as UserCarousel;
        });

        // Ordenar no cliente por updated_at
        carouselsData.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

        console.log('[useUserCarousels] Carrosséis processados:', {
          count: carouselsData.length,
          carousels: carouselsData.map(c => ({
            id: c.id,
            title: c.title,
            layout_type: c.layout_type,
            updated_at: c.updated_at
          }))
        });

        setCarousels(carouselsData);
        setDebugInfo({
          user_id: user.uid,
          query_executed: true,
          docs_found: carouselsData.length,
          last_search: new Date().toISOString(),
          carousels_ids: carouselsData.map(c => c.id),
          index_issue: false
        });

        if (carouselsData.length > 0) {
          toast({
            title: "Carrosséis carregados",
            description: `${carouselsData.length} carrosséis encontrados`,
          });
        }

      } catch (error) {
        console.error('[useUserCarousels] Erro detalhado ao carregar carrosséis:', {
          error: error,
          error_message: error instanceof Error ? error.message : 'Erro desconhecido',
          error_code: (error as any)?.code,
          user_id: user.uid,
          timestamp: new Date().toISOString()
        });
        
        const isIndexError = error instanceof Error && error.message.includes('index');
        
        toast({
          title: "Erro ao carregar carrosséis",
          description: isIndexError 
            ? "Índice do Firebase precisa ser criado. Verifique o console para detalhes."
            : `Detalhes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          variant: "destructive",
        });

        setDebugInfo({
          user_id: user.uid,
          query_executed: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          index_issue: isIndexError,
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
