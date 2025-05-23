
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseAPIKeyManager } from '@/hooks/useFirebaseAPIKeyManager';

// This hook is deprecated - use useFirebaseAPIKeyManager instead
export const useAPIKeyManager = () => {
  const { toast } = useToast();
  const firebaseManager = useFirebaseAPIKeyManager();

  // Redirect to Firebase implementation
  useEffect(() => {
    console.warn('useAPIKeyManager is deprecated. Use useFirebaseAPIKeyManager instead.');
  }, []);

  return {
    ...firebaseManager,
    // Deprecated methods for backward compatibility
    resetAPIKeyUsage: () => {
      toast({
        title: "Método depreciado",
        description: "Use useFirebaseAPIKeyManager para gerenciar chaves de API",
        variant: "destructive"
      });
    },
    deleteAPIKey: () => {
      toast({
        title: "Método depreciado", 
        description: "Use useFirebaseAPIKeyManager para gerenciar chaves de API",
        variant: "destructive"
      });
    }
  };
};
