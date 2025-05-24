
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  Timestamp 
} from "firebase/firestore";
import { firestore } from "@/integrations/firebase/client";
import { FirebaseAPIKey } from "@/types/firebase.types";

/**
 * Carrega todas as chaves de API do Firestore
 * Se userId não for especificado, carrega TODAS as chaves (para usuários comuns usarem)
 */
export const fetchAPIKeys = async (userId?: string) => {
  try {
    let apiKeysQuery;
    
    if (userId) {
      // Admin buscando suas próprias chaves
      apiKeysQuery = query(
        collection(firestore, 'api_keys'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
    } else {
      // Usuários comuns buscando todas as chaves disponíveis no sistema
      apiKeysQuery = query(
        collection(firestore, 'api_keys'),
        orderBy('created_at', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(apiKeysQuery);
    const apiKeys: FirebaseAPIKey[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Record<string, any>;
      apiKeys.push({
        id: doc.id,
        key: data.key || '',
        name: data.name || '',
        usage: data.usage || 0,
        limit: data.limit || 10000,
        last_used: data.last_used || new Date().toISOString(),
        created_at: data.created_at || new Date().toISOString(),
        user_id: data.user_id || ''
      });
    });
    
    return apiKeys;
  } catch (error) {
    console.error('Erro ao buscar chaves API:', error);
    throw error;
  }
};

/**
 * Tenta carregar as chaves de API do banco de dados
 * Para usuários comuns, não especifica userId para buscar todas as chaves
 */
export const fetchAndProcessAPIKeys = async (userId?: string, isAdmin?: boolean) => {
  try {
    // Se for admin, busca apenas suas chaves. Se for usuário comum, busca todas
    const searchUserId = isAdmin ? userId : undefined;
    const data = await fetchAPIKeys(searchUserId);
    
    if (data && data.length > 0) {
      return { success: true, data };
    }
    
    return { success: false, data: [] };
  } catch (err) {
    console.error('Erro ao buscar chaves API:', err);
    return { success: false, error: err };
  }
};

/**
 * Tenta criar a chave de API padrão quando não há chaves disponíveis
 */
export const setupDefaultKey = async (defaultApiKey: string, userId: string) => {
  try {
    const success = await createDefaultApiKey(defaultApiKey, userId);
    
    if (success) {
      // Recarrega os dados após criar a chave padrão
      const result = await fetchAndProcessAPIKeys(userId, true);
      if (result.success) {
        return { success: true, data: result.data };
      }
    }
    
    return { success: false, data: [] };
  } catch (err) {
    console.error('Erro ao configurar chave padrão:', err);
    return { success: false, error: err };
  }
};

/**
 * Adiciona uma nova chave de API ao Firestore
 */
export const createAPIKey = async (keyData: Omit<FirebaseAPIKey, 'id' | 'created_at'>) => {
  try {
    const apiKeyData = {
      key: keyData.key,
      name: keyData.name,
      usage: keyData.usage || 0,
      limit: keyData.limit || 10000,
      last_used: keyData.last_used || new Date().toISOString(),
      user_id: keyData.user_id,
      created_at: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(firestore, 'api_keys'), apiKeyData);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar chave API:', error);
    throw error;
  }
};

/**
 * Incrementa o uso de uma chave específica
 */
export const incrementAPIKeyUsage = async (keyId: string, currentUsage: number) => {
  try {
    const apiKeyRef = doc(firestore, 'api_keys', keyId);
    
    await updateDoc(apiKeyRef, {
      usage: currentUsage + 1,
      last_used: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao incrementar uso da chave API:', error);
    throw error;
  }
};

/**
 * Reseta o contador de uso de uma chave API específica
 */
export const resetAPIKeyUsage = async (keyId: string) => {
  try {
    const apiKeyRef = doc(firestore, 'api_keys', keyId);
    
    await updateDoc(apiKeyRef, {
      usage: 0
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao resetar uso da chave API:', error);
    throw error;
  }
};

/**
 * Remove uma chave de API do Firestore
 */
export const deleteAPIKey = async (keyId: string) => {
  try {
    const apiKeyRef = doc(firestore, 'api_keys', keyId);
    await deleteDoc(apiKeyRef);
    return true;
  } catch (error) {
    console.error('Erro ao excluir chave API:', error);
    throw error;
  }
};

/**
 * Verifica se uma chave API específica é válida
 */
export const validateAPIKey = async (apiKey: string): Promise<boolean> => {
  try {
    const apiKeysQuery = query(
      collection(firestore, 'api_keys'),
      where('key', '==', apiKey),
      limit(1)
    );
    
    const querySnapshot = await getDocs(apiKeysQuery);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Erro ao validar chave API:', error);
    return false;
  }
};

/**
 * Cria uma entrada para a chave de API padrão
 */
export const createDefaultApiKey = async (defaultApiKey: string, userId: string): Promise<boolean> => {
  try {
    if (!defaultApiKey) {
      console.warn('Chave API padrão não fornecida');
      return false;
    }
    
    await createAPIKey({
      key: defaultApiKey,
      name: 'Google API Key',
      usage: 0,
      limit: 10000,
      last_used: new Date().toISOString(),
      user_id: userId
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao criar chave padrão:', error);
    return false;
  }
};

/**
 * Chave de API padrão para uso quando não houver outras disponíveis
 * Deve ser configurada pelo admin nas configurações
 */
export const defaultAPIKey = '';

/**
 * Encontra a melhor chave disponível com base no uso/limite
 * Prioriza chaves com menor uso relativo
 */
export const findBestAvailableKey = (apiKeys: FirebaseAPIKey[]): string | null => {
  if (apiKeys.length === 0) return defaultAPIKey;
  
  // Ordena as chaves pelo uso relativo (uso/limite)
  const sortedKeys = [...apiKeys].sort((a, b) => 
    ((a.usage || 0) / (a.limit || 1)) - ((b.usage || 0) / (b.limit || 1))
  );
  
  // Retorna a primeira chave que não excedeu o limite
  const availableKey = sortedKeys.find(key => (key.usage || 0) < (key.limit || 10000));
  
  if (availableKey) return availableKey.key;
  
  return null;
};
