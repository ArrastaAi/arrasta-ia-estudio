
// Configuração das chaves API por agente
export const getAPIKeyForAgent = (agent: string): string[] => {
  const keys: string[] = [];
  
  switch (agent) {
    case "carousel":
      // Chave dedicada para carrossel
      const carouselKey = Deno.env.get('CRIADOR_CARROSSEL');
      if (carouselKey) keys.push(carouselKey);
      break;
    case "yuri":
      // Chave dedicada para criação de textos
      const yuriKey = Deno.env.get('CRIADOR_TEXTO');
      if (yuriKey) keys.push(yuriKey);
      break;
    case "formatter":
      // Chave dedicada para formatação de frases
      const formatterKey = Deno.env.get('CRIADOR_FRASES');
      if (formatterKey) keys.push(formatterKey);
      break;
  }
  
  // Fallback keys
  const fallbackKeys = [
    Deno.env.get('GOOGLE_GEMINI_API_KEY'),
    Deno.env.get('FALLBACK_API_KEY'),
    "AIzaSyBDmxNFfZs3OwBfrYuM8GvE48SIWDzH92w" // Chave principal como último fallback
  ].filter(Boolean);
  
  return [...keys, ...fallbackKeys];
};
