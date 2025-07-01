
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
    case "instagram_rect":
      return "aspect-[5/4]";
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
    case "instagram_rect": return "Instagram (Vertical 5:4)";
    default: return "Padrão (16:9)";
  }
};

// Novas funções para o sistema Predial Casa Nova
export const getPredialCasaNovaLayout = (contentType: string) => {
  const layouts = {
    "property_showcase": {
      aspectRatio: "aspect-[4/3]",
      displayName: "Showcase de Imóvel",
      textPosition: "bottom",
      overlayIntensity: 60
    },
    "agent_contact": {
      aspectRatio: "aspect-square", 
      displayName: "Contato do Corretor",
      textPosition: "center",
      overlayIntensity: 40
    },
    "company_branding": {
      aspectRatio: "aspect-[16/9]",
      displayName: "Branding da Empresa", 
      textPosition: "top",
      overlayIntensity: 30
    },
    "call_to_action": {
      aspectRatio: "aspect-[5/4]",
      displayName: "Call-to-Action",
      textPosition: "center", 
      overlayIntensity: 50
    }
  };
  
  return layouts[contentType as keyof typeof layouts] || layouts["property_showcase"];
};

export const extractTextHierarchy = (text: string) => {
  const lines = text.split('\n').filter(line => line.trim());
  
  return lines.map((line, index) => {
    if (line.toLowerCase().includes('venda') || line.toLowerCase().includes('compra')) {
      return { type: 'primary', content: line };
    } else if (line.toLowerCase().includes('contato') || line.toLowerCase().includes('whatsapp')) {
      return { type: 'cta', content: line };
    } else if (line.toLowerCase().includes('predial') || line.toLowerCase().includes('casa nova')) {
      return { type: 'brand', content: line };
    } else {
      return { type: 'secondary', content: line };
    }
  });
};
