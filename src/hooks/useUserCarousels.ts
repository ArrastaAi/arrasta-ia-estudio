
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

  useEffect(() => {
    const fetchUserCarousels = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const carouselsRef = collection(db, 'carousels');
        const q = query(
          carouselsRef,
          where('user_id', '==', user.uid),
          orderBy('updated_at', 'desc'),
          limit(10)
        );

        const querySnapshot = await getDocs(q);
        const carouselsData: UserCarousel[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as UserCarousel));

        setCarousels(carouselsData);
      } catch (error) {
        console.error('Erro ao carregar carrosséis:', error);
        toast({
          title: "Erro ao carregar carrosséis",
          description: "Não foi possível carregar seus carrosséis salvos",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserCarousels();
  }, [user, toast]);

  return { carousels, loading };
};
