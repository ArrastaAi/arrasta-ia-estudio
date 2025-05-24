
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

export const formatSafeDate = (dateString: string) => {
  try {
    if (!dateString) return "Data não disponível";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Data inválida";
    }
    
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ptBR 
    });
  } catch (error) {
    console.error('[carouselUtils] Erro ao formatar data:', error);
    return "Data não disponível";
  }
};

export const getLayoutAspectRatio = (layoutType: string) => {
  switch (layoutType) {
    case "feed_square":
      return "aspect-square";
    case "stories":
      return "aspect-[9/16]";
    case "pinterest":
      return "aspect-[2/3]";
    case "facebook":
      return "aspect-[16/10]";
    default:
      return "aspect-video";
  }
};

export const getLayoutDisplayName = (layoutType: string) => {
  switch (layoutType) {
    case "feed_square": return "Instagram/LinkedIn (Quadrado)";
    case "stories": return "Stories (9:16)";
    case "pinterest": return "Pinterest (2:3)";
    case "facebook": return "Facebook (16:10)";
    default: return "Padrão (16:9)";
  }
};
