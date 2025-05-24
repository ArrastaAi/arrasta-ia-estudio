
import { ArrastaAiTemplate, INSTAGRAM_COLORS } from "@/types/carousel.types";

export const ARRASTAAI_TEMPLATES: Record<string, ArrastaAiTemplate> = {
  impact: {
    id: "impact",
    name: "Impacto",
    description: "Título grande com overlay para máximo impacto",
    preview: "💥",
    colors: {
      primary: INSTAGRAM_COLORS.purple,
      secondary: INSTAGRAM_COLORS.white,
      background: INSTAGRAM_COLORS.black,
      text: INSTAGRAM_COLORS.white
    },
    textStyle: {
      textSize: "large",
      textPosition: "center",
      textStyle: "impact",
      textColor: INSTAGRAM_COLORS.white,
      fontFamily: "bebas",
      hasBackground: true,
      backgroundColor: INSTAGRAM_COLORS.black,
      backgroundOpacity: 60,
      textCase: "uppercase",
      fontWeight: "bold"
    }
  },
  
  elegant: {
    id: "elegant",
    name: "Elegante", 
    description: "Texto limpo e sofisticado",
    preview: "✨",
    colors: {
      primary: INSTAGRAM_COLORS.gray,
      secondary: INSTAGRAM_COLORS.purple,
      background: INSTAGRAM_COLORS.white,
      text: INSTAGRAM_COLORS.gray
    },
    textStyle: {
      textSize: "medium",
      textPosition: "center",
      textStyle: "elegant",
      textColor: INSTAGRAM_COLORS.gray,
      fontFamily: "helvetica",
      hasBackground: false,
      textCase: "none",
      fontWeight: "regular"
    }
  },
  
  cta: {
    id: "cta",
    name: "Call-to-Action",
    description: "Botão roxo ArrastaAí em destaque",
    preview: "🚀",
    colors: {
      primary: INSTAGRAM_COLORS.purple,
      secondary: INSTAGRAM_COLORS.white,
      background: INSTAGRAM_COLORS.purple,
      text: INSTAGRAM_COLORS.white
    },
    textStyle: {
      textSize: "medium",
      textPosition: "bottom",
      textStyle: "cta",
      textColor: INSTAGRAM_COLORS.white,
      fontFamily: "bebas",
      hasBackground: true,
      backgroundColor: INSTAGRAM_COLORS.purple,
      backgroundOpacity: 100,
      textCase: "uppercase",
      fontWeight: "bold"
    }
  },
  
  minimal: {
    id: "minimal",
    name: "Minimalista",
    description: "Texto direto sobre a imagem",
    preview: "📝",
    colors: {
      primary: INSTAGRAM_COLORS.white,
      secondary: INSTAGRAM_COLORS.gray,
      background: "transparent",
      text: INSTAGRAM_COLORS.white
    },
    textStyle: {
      textSize: "medium",
      textPosition: "center",
      textStyle: "minimal",
      textColor: INSTAGRAM_COLORS.white,
      fontFamily: "helvetica",
      hasBackground: false,
      textCase: "none",
      fontWeight: "regular"
    }
  },

  hyeser: {
    id: "hyeser",
    name: "Hyeser Style",
    description: "Estilo artístico com fontes manuscritas",
    preview: "🎨",
    colors: {
      primary: INSTAGRAM_COLORS.black,
      secondary: INSTAGRAM_COLORS.purple,
      background: INSTAGRAM_COLORS.black,
      text: INSTAGRAM_COLORS.white
    },
    textStyle: {
      textSize: "large",
      textPosition: "center",
      textStyle: "hyeser",
      textColor: INSTAGRAM_COLORS.white,
      fontFamily: "brusher",
      hasBackground: true,
      backgroundColor: INSTAGRAM_COLORS.black,
      backgroundOpacity: 80,
      textCase: "uppercase",
      fontWeight: "bold"
    }
  }
};

export const getArrastaAiTextStyles = (templateId: string, textType: "primary" | "secondary" | "cta" = "primary") => {
  const template = ARRASTAAI_TEMPLATES[templateId] || ARRASTAAI_TEMPLATES.minimal;
  
  const baseStyle = {
    fontWeight: template.textStyle.fontWeight || "regular",
    fontSize: template.textStyle.textSize === "large" ? 32 : 
              template.textStyle.textSize === "medium" ? 24 : 18,
    textColor: template.colors.text,
    textCase: template.textStyle.textCase || "none",
    letterSpacing: 0.02,
    marginBottom: textType === "primary" ? 16 : 8
  };
  
  return baseStyle;
};
