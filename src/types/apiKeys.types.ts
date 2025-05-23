
/**
 * Interface que define a estrutura de uma chave de API
 */
export interface APIKeyUsage {
  id?: string;
  key: string;
  name: string;
  usage: number;
  limit: number;
  last_used: string;
  created_at?: string;
  user_id?: string | null;
}
