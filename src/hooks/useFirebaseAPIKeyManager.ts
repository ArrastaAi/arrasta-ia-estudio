import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { FirebaseAPIKey } from '@/types/firebase.types';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { 
  fetchAPIKeys, 
  createAPIKey, 
  incrementAPIKeyUsage, 
  findBestAvailableKey,
  defaultAPIKey,
  fetchAndProcessAPIKeys,
  setupDefaultKey,
  resetAPIKeyUsage,
  deleteAPIKey as removeAPIKey
} from '@/services/firebaseApiKeyService';

export const useFirebaseAPIKeyManager = () => {
  const { toast } = useToast();
  const { user } = useFirebaseAuth();
  const [apiKeys, setApiKeys] = useState<FirebaseAPIKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Exibe uma mensagem de erro no toast
   */
  const showErrorToast = (message: string) => {
    toast({
      title: 'Erro',
      description: message,
      variant: 'destructive'
    });
  };

  /**
   * Carrega chaves da API do Firestore
   */
  const loadAPIKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Tenta buscar as chaves existentes
      const result = await fetchAndProcessAPIKeys(user.uid);
      
      if (result.success) {
        setApiKeys(result.data);
      } else {
        // Se não houver chaves, cria a chave padrão
        if (defaultAPIKey) {
          const defaultKeyResult = await setupDefaultKey(defaultAPIKey, user.uid);
          
          if (defaultKeyResult.success) {
            setApiKeys(defaultKeyResult.data);
          } else {
            throw new Error('Não foi possível carregar ou criar chaves API');
          }
        } else {
          setApiKeys([]);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar chaves API:', err);
      setError('Não foi possível carregar as chaves de API.');
      showErrorToast('Não foi possível carregar as chaves de API do servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Adiciona uma nova chave de API
  const addAPIKey = async (keyData: Omit<FirebaseAPIKey, 'id' | 'created_at' | 'user_id'>) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      await createAPIKey({
        ...keyData,
        user_id: user.uid
      });
      
      toast({
        title: 'Chave API adicionada',
        description: `A chave "${keyData.name}" foi adicionada com sucesso.`
      });
      
      // Recarrega a lista após adicionar
      await loadAPIKeys();
      
      return true;
    } catch (err) {
      console.error('Erro ao adicionar chave API:', err);
      setError('Não foi possível adicionar a chave de API.');
      showErrorToast('Não foi possível salvar a chave de API. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Atualiza o uso de uma chave
  const incrementKeyUsage = async (keyId: string) => {
    try {
      const keyToUpdate = apiKeys.find(key => key.key === keyId);
      
      if (!keyToUpdate) return false;
      
      await incrementAPIKeyUsage(keyToUpdate.id, keyToUpdate.usage || 0);
      
      // Recarrega a lista de chaves para ter os dados atualizados
      await loadAPIKeys();
      
      // Verifica se o uso está próximo do limite
      if (keyToUpdate.usage >= keyToUpdate.limit * 0.9) {
        toast({
          title: 'Alerta de uso de API',
          description: `A chave "${keyToUpdate.name}" está próxima do seu limite de uso.`,
          variant: 'warning'
        });
      }
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar uso de chave API:', err);
      return false;
    }
  };

  // Reseta o contador de uso de uma chave
  const resetKeyUsage = async (keyId: string) => {
    try {
      setLoading(true);
      
      // Buscar a chave pelo ID para obter o valor da chave (key)
      const keyToReset = apiKeys.find(key => key.id === keyId);
      
      if (!keyToReset) {
        throw new Error('Chave não encontrada');
      }
      
      // Chamar resetAPIKeyUsage com o ID correto
      await resetAPIKeyUsage(keyId);
      
      toast({
        title: 'Contador resetado',
        description: 'O contador de uso da chave foi resetado com sucesso.'
      });
      
      // Recarrega a lista de chaves
      await loadAPIKeys();
      
      return true;
    } catch (err) {
      console.error('Erro ao resetar uso da chave API:', err);
      showErrorToast('Não foi possível resetar o contador da chave.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove uma chave de API
  const deleteAPIKey = async (keyId: string) => {
    try {
      await removeAPIKey(keyId);
      // Recarrega a lista após a exclusão
      await loadAPIKeys();
      return true;
    } catch (error) {
      console.error('Erro ao excluir chave:', error);
      return false;
    }
  };

  // Carrega as chaves ao montar o componente
  useEffect(() => {
    if (user) {
      loadAPIKeys();
    }
  }, [user]);

  // Obtém a melhor chave disponível (com menos uso em relação ao limite)
  const getBestAvailableKey = (): string | null => {
    if (apiKeys.length === 0) return defaultAPIKey;
    
    const bestKey = findBestAvailableKey(apiKeys);
    
    if (!bestKey) {
      toast({
        title: 'Limite de API excedido',
        description: 'Todas as chaves de API atingiram seus limites de uso. Por favor, adicione uma nova chave.',
        variant: 'destructive'
      });
    }
    
    return bestKey;
  };
  
  return {
    apiKeys,
    loading,
    error,
    addAPIKey,
    incrementKeyUsage,
    resetKeyUsage,
    deleteAPIKey,
    loadAPIKeys,
    getBestAvailableKey
  };
};
