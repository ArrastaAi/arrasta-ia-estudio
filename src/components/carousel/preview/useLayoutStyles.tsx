
import { useMemo } from 'react';

export type LayoutType = 
  'feed_square' | 
  'stories' | 
  'pinterest' | 
  'facebook' | 
  'instagram_rect' | 
  'tiktok' | 
  'newspaper' | 
  'magazine' | 
  'twitter' | 
  'linkedin' | 
  'youtube' |
  'editorial' |
  'quote' |
  'manifesto' |
  'statistics' |
  'case_study' |
  'long_form' |
  'fiction_cover' |
  'nonfiction_cover' |
  'memoir' |
  'self_help' |
  'academic' |
  'thriller';

interface LayoutStylesHook {
  getAspectRatio: () => number;
  getLayoutDimensions: () => string;
  getLayoutName: () => string;
  getGridLayoutClass: () => string;
  getHeaderConfig: () => HeaderConfig | null;
}

// Tipo para configuração de cabeçalho dos layouts editoriais
interface HeaderConfig {
  tag: string;
  bgColor: string;
  textColor: string;
}

/**
 * Hook personalizado para gerenciar estilos e dimensões de layout
 */
export const useLayoutStyles = (layoutType: string): LayoutStylesHook => {
  
  // Calcula a proporção de aspecto com base no tipo de layout
  const getAspectRatio = useMemo(() => {
    return () => {
      switch (layoutType) {
        case "feed_square":
          return 1; // proporção 1:1 para quadrado
        case "stories":
          return 9/16; // proporção 9:16 para stories
        case "pinterest":
          return 2/3; // proporção 2:3 para Pinterest
        case "facebook":
          return 16/9; // proporção 16:9 para Facebook
        case "instagram_rect":
          return 4/5; // proporção 4:5 para Instagram (1080x1350)
        case "tiktok":
          return 9/16; // proporção 9:16 para TikTok
        case "newspaper":
          return 3/2; // proporção 3:2 para layout de jornal
        case "magazine":
          return 4/3; // proporção 4:3 para layout de revista
        case "twitter":
          return 16/9; // proporção 16:9 para Twitter
        case "linkedin":
          return 1.91/1; // proporção 1.91:1 para LinkedIn
        case "youtube":
          return 16/9; // proporção 16:9 para YouTube thumbnails
        // Layouts editoriais
        case "editorial":
        case "quote":
        case "manifesto":
        case "statistics":
        case "case_study":
          return 4/5; // Proporção Instagram para posts editoriais
        case "long_form":
          return 4/5; // Artigo formato mais comprido
        // Novos layouts de livros
        case "fiction_cover":
        case "memoir":
        case "self_help":
        case "thriller":
          return 2/3; // Proporção típica de capas de livros
        case "nonfiction_cover":
          return 3/4; // Proporção para não-ficção
        case "academic":
          return 4/5; // Proporção para livros acadêmicos
        default:
          return 4/5; // Padrão para Instagram Feed (4:5)
      }
    };
  }, [layoutType]);

  // Obtém as dimensões corretas com base no tipo de layout
  const getLayoutDimensions = useMemo(() => {
    return () => {
      switch (layoutType) {
        case "feed_square":
          return "w-full max-w-md aspect-square";
        case "stories":
          return "w-64 h-[512px]";
        case "pinterest":
          return "w-64 h-[384px]";
        case "instagram_rect":
          return "w-full max-w-md aspect-[4/5]";
        case "facebook":
          return "w-full max-w-lg aspect-[16/9]";
        case "tiktok":
          return "w-72 h-[512px]";
        case "newspaper":
          return "w-full max-w-xl aspect-[3/2]";
        case "magazine":
          return "w-full max-w-xl aspect-[4/3]";
        case "twitter":
          return "w-full max-w-lg aspect-[16/9]";
        case "linkedin":
          return "w-full max-w-lg aspect-[1.91/1]";
        case "youtube":
          return "w-full max-w-xl aspect-[16/9]";
        // Layouts editoriais
        case "editorial":
        case "quote":
        case "manifesto":
        case "statistics":
        case "case_study":
        case "long_form":
          return "w-full max-w-md aspect-[4/5]";
        // Novos layouts de livros
        case "fiction_cover":
        case "memoir":
        case "self_help":
        case "thriller":
          return "w-72 h-[432px]"; // Proporção 2:3 para capas de livros
        case "nonfiction_cover":
          return "w-72 h-[384px]"; // Proporção 3:4 para não-ficção
        case "academic":
          return "w-full max-w-md aspect-[4/5]"; // Proporção para livros acadêmicos
        default:
          return "w-full max-w-md aspect-[4/5]"; // Padrão para Instagram Feed
      }
    };
  }, [layoutType]);
  
  // Obtém o nome legível do layout
  const getLayoutName = useMemo(() => {
    return () => {
      switch (layoutType) {
        case "feed_square":
          return "Instagram (Quadrado)";
        case "stories":
          return "Stories";
        case "pinterest":
          return "Pinterest";
        case "facebook":
          return "Facebook";
        case "instagram_rect":
          return "Instagram (Feed)";
        case "tiktok":
          return "TikTok";
        case "newspaper":
          return "Jornal";
        case "magazine":
          return "Revista";
        case "twitter":
          return "Twitter";
        case "linkedin":
          return "LinkedIn";
        case "youtube":
          return "YouTube";
        // Layouts editoriais
        case "editorial":
          return "Editorial";
        case "quote":
          return "Citação";
        case "manifesto":
          return "Manifesto";
        case "statistics":
          return "Estatísticas";
        case "case_study":
          return "Estudo de Caso";
        case "long_form":
          return "Texto Longo";
        // Novos layouts de livros
        case "fiction_cover":
          return "Livro - Ficção";
        case "nonfiction_cover":
          return "Livro - Não Ficção";
        case "memoir":
          return "Livro - Memórias";
        case "self_help":
          return "Livro - Autoajuda";
        case "academic":
          return "Livro - Acadêmico";
        case "thriller":
          return "Livro - Suspense";
        default:
          return "Instagram (Feed)";
      }
    };
  }, [layoutType]);
  
  // Retorna classes de CSS para o layout de grid específico
  const getGridLayoutClass = useMemo(() => {
    return () => {
      switch (layoutType) {
        case "newspaper":
          return "grid grid-cols-2 gap-2";
        case "magazine":
          return "grid grid-cols-3 gap-1";
        case "twitter":
          return "grid grid-rows-2 grid-cols-2 gap-1";
        case "pinterest":
          return "grid grid-cols-2 auto-rows-max gap-2";
        // Layouts editoriais
        case "editorial":
          return "flex flex-col"; // Layout em colunas com cabeçalho, conteúdo principal e rodapé
        case "quote":
          return "flex flex-col justify-center"; // Layout centralizado para citações
        case "manifesto":
          return "flex flex-col"; // Layout em colunas com título grande e texto de apoio
        case "statistics":
          return "flex flex-col"; // Layout para estatísticas com destaque
        case "case_study":
          return "flex flex-col"; // Layout para estudos de caso
        case "long_form":
          return "flex flex-col"; // Layout para texto longo
        // Livros não usam grid, mas sim layouts de colunas flexíveis
        case "fiction_cover":
        case "nonfiction_cover":
        case "memoir":
        case "self_help":
        case "academic":
        case "thriller":
          return "flex flex-col"; // Layout de capa de livro
        default:
          return ""; // Layouts sem grid específico
      }
    };
  }, [layoutType]);

  // Obtém a configuração de cabeçalho para layouts editoriais
  const getHeaderConfig = useMemo(() => {
    return () => {
      switch (layoutType) {
        case "editorial":
          return {
            tag: "EDITORIAL",
            bgColor: "#222222",
            textColor: "#FFFFFF"
          };
        case "quote":
          return {
            tag: "CITAÇÃO",
            bgColor: "#472E22",
            textColor: "#FFFFFF"
          };
        case "manifesto":
          return {
            tag: "MANIFESTO",
            bgColor: "#FFEB3B",
            textColor: "#000000"
          };
        case "statistics":
          return {
            tag: "DADOS",
            bgColor: "#0D47A1",
            textColor: "#FFFFFF"
          };
        case "case_study":
          return {
            tag: "ESTUDO DE CASO",
            bgColor: "#FF5722",
            textColor: "#FFFFFF"
          };
        case "long_form":
          return {
            tag: "ARTIGO",
            bgColor: "#333333",
            textColor: "#FFFFFF"
          };
        default:
          return null; // Sem cabeçalho para outros layouts
      }
    };
  }, [layoutType]);

  return {
    getAspectRatio,
    getLayoutDimensions,
    getLayoutName,
    getGridLayoutClass,
    getHeaderConfig
  };
};
