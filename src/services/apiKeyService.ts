
import { supabase } from '@/integrations/supabase/client';
import { APIKeyUsage } from '@/types/apiKeys.types';

/**
 * Carrega todas as chaves de API do usuário do Supabase
 */
export const fetchAPIKeys = async () => {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data;
};

/**
 * Tenta carregar as chaves de API do banco de dados
 */
export const fetchAndProcessAPIKeys = async () => {
  try {
    const data = await fetchAPIKeys();
    
    if (data && data.length > 0) {
      // Converter os dados para o formato correto
      const formattedData = mapApiKeyData(data);
      return { success: true, data: formattedData };
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
export const setupDefaultKey = async (defaultApiKey: string) => {
  try {
    const success = await createDefaultApiKey(defaultApiKey);
    
    if (success) {
      // Recarrega os dados após criar a chave padrão
      const result = await fetchAndProcessAPIKeys();
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
 * Adiciona uma nova chave de API ao Supabase
 */
export const createAPIKey = async (keyData: APIKeyUsage) => {
  // Obter o ID do usuário atual de forma síncrona primeiro
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || null;
  
  const { error } = await supabase
    .from('api_keys')
    .insert({
      key: keyData.key,
      name: keyData.name,
      usage: keyData.usage || 0,
      limit: keyData.limit || 10000,
      last_used: keyData.last_used || new Date().toISOString(),
      user_id: userId
    });
  
  if (error) throw error;
  
  return true;
};

/**
 * Incrementa o uso de uma chave específica
 */
export const incrementAPIKeyUsage = async (keyId: string, currentUsage: number) => {
  const { error } = await supabase
    .from('api_keys')
    .update({
      usage: currentUsage + 1,
      last_used: new Date().toISOString()
    })
    .eq('key', keyId);
  
  if (error) throw error;
  
  return true;
};

/**
 * Reseta o contador de uso de uma chave API específica
 */
export const resetAPIKeyUsage = async (keyId: string) => {
  const { error } = await supabase
    .from('api_keys')
    .update({
      usage: 0
    })
    .eq('id', keyId);
  
  if (error) throw error;
  
  return true;
};

/**
 * Remove uma chave de API do Supabase
 */
export const deleteAPIKey = async (keyId: string) => {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId);
  
  if (error) throw error;
  
  return true;
};

/**
 * Mapeia os dados brutos do banco de dados para o formato da interface APIKeyUsage
 */
export const mapApiKeyData = (data: any[]): APIKeyUsage[] => {
  if (!data) return [];
  
  return data.map(item => ({
    id: item.id,
    key: item.key,
    name: item.name,
    usage: item.usage || 0,
    limit: item.limit || 10000,
    last_used: item.last_used || new Date().toISOString(),
    created_at: item.created_at,
    user_id: item.user_id
  }));
};

/**
 * Cria uma entrada para a chave de API padrão
 */
export const createDefaultApiKey = async (defaultApiKey: string): Promise<boolean> => {
  try {
    await createAPIKey({
      key: defaultApiKey,
      name: 'Google API Key',
      usage: 0,
      limit: 10000,
      last_used: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Erro ao criar chave padrão:', error);
    return false;
  }
};

/**
 * Verifica se uma chave API específica é válida
 */
export const validateAPIKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Verificar se a chave existe no banco de dados
    const { data, error } = await supabase
      .from('api_keys')
      .select('id')
      .eq('key', apiKey)
      .maybeSingle();
    
    if (error) throw error;
    
    return data !== null;
  } catch (error) {
    console.error('Erro ao validar chave API:', error);
    return false;
  }
};

/**
 * Chave de API padrão para uso quando não houver outras disponíveis
 * Deve ser configurada pelo usuário nas configurações
 */
export const defaultAPIKey = '';

/**
 * Encontra a melhor chave disponível com base no uso/limite
 */
export const findBestAvailableKey = (apiKeys: APIKeyUsage[]): string | null => {
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
