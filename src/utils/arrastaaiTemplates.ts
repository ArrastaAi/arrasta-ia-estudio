
import { ArrastaAiTemplate, ARRASTAAI_COLORS } from "@/types/carousel.types";

export const ARRASTAAI_TEMPLATES: Record<string, ArrastaAiTemplate> = {
  impact: {
    id: "impact",
    name: "Impacto",
    description: "Título grande com overlay para máximo impacto",
    preview: "💥",
    colors: {
      primary: ARRASTAAI_COLORS.purple,
      secondary: ARRASTAAI_COLORS.white,
      background: ARRASTAAI_COLORS.black,
      text: ARRASTAAI_COLORS.white
    },
    textStyle: {
      textSize: "large",
      textPosition: "center",
      textStyle: "impact",
      textColor: ARRASTAAI_COLORS.white,
      fontFamily: "bebas",
      hasBackground: true,
      backgroundColor: ARRASTAAI_COLORS.black,
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
      primary: ARRASTAAI_COLORS.darkGray,
      secondary: ARRASTAAI_COLORS.purple,
      background: ARRASTAAI_COLORS.white,
      text: ARRASTAAI_COLORS.darkGray
    },
    textStyle: {
      textSize: "medium",
      textPosition: "center",
      textStyle: "elegant",
      textColor: ARRASTAAI_COLORS.darkGray,
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
      primary: ARRASTAAI_COLORS.purple,
      secondary: ARRASTAAI_COLORS.white,
      background: ARRASTAAI_COLORS.purple,
      text: ARRASTAAI_COLORS.white
    },
    textStyle: {
      textSize: "medium",
      textPosition: "bottom",
      textStyle: "cta",
      textColor: ARRASTAAI_COLORS.white,
      fontFamily: "bebas",
      hasBackground: true,
      backgroundColor: ARRASTAAI_COLORS.purple,
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
      primary: ARRASTAAI_COLORS.white,
      secondary: ARRASTAAI_COLORS.lightGray,
      background: "transparent",
      text: ARRASTAAI_COLORS.white
    },
    textStyle: {
      textSize: "medium",
      textPosition: "center",
      textStyle: "minimal",
      textColor: ARRASTAAI_COLORS.white,
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
      primary: ARRASTAAI_COLORS.black,
      secondary: ARRASTAAI_COLORS.purple,
      background: ARRASTAAI_COLORS.black,
      text: ARRASTAAI_COLORS.white
    },
    textStyle: {
      textSize: "large",
      textPosition: "center",
      textStyle: "hyeser",
      textColor: ARRASTAAI_COLORS.white,
      fontFamily: "brusher",
      hasBackground: true,
      backgroundColor: ARRASTAAI_COLORS.black,
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
