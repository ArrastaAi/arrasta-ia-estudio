
import { TextHierarchyStyle } from "@/types/carousel.types";

export const PREDIAL_CASA_NOVA_COLORS = {
  orange: "#FF6B35",
  darkOrange: "#E55A2B",
  black: "#1A1A1A", 
  darkGray: "#2D2D2D",
  lightGray: "#F5F5F5",
  white: "#FFFFFF",
  overlay: "rgba(0, 0, 0, 0.6)"
};

// Interface local para templates de marca (removendo dependência externa)
interface LocalBrandTemplate {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontWeights: {
    primary: string;
    secondary: string;
    cta: string;
  };
  spacing: {
    tight: number;
    normal: number;
    wide: number;
  };
}

export const BRAND_TEMPLATES: Record<string, LocalBrandTemplate> = {
  predial_casa_nova: {
    id: "predial_casa_nova",
    name: "Predial Casa Nova",
    description: "Estilo imobiliário profissional com destaque laranja",
    primaryColor: PREDIAL_CASA_NOVA_COLORS.orange,
    secondaryColor: PREDIAL_CASA_NOVA_COLORS.black,
    backgroundColor: PREDIAL_CASA_NOVA_COLORS.lightGray,
    textColor: PREDIAL_CASA_NOVA_COLORS.white,
    accentColor: PREDIAL_CASA_NOVA_COLORS.darkOrange,
    fontWeights: {
      primary: "800",
      secondary: "400",
      cta: "700"
    },
    spacing: {
      tight: 0.5,
      normal: 1,
      wide: 2
    }
  },
  corporate_orange: {
    id: "corporate_orange",
    name: "Corporate Orange",
    description: "Fundo laranja sólido corporativo",
    primaryColor: PREDIAL_CASA_NOVA_COLORS.orange,
    secondaryColor: PREDIAL_CASA_NOVA_COLORS.white,
    backgroundColor: PREDIAL_CASA_NOVA_COLORS.orange,
    textColor: PREDIAL_CASA_NOVA_COLORS.white,
    accentColor: PREDIAL_CASA_NOVA_COLORS.black,
    fontWeights: {
      primary: "700",
      secondary: "400",
      cta: "600"
    },
    spacing: {
      tight: 0.25,
      normal: 0.75,
      wide: 1.5
    }
  },
  overlay_text: {
    id: "overlay_text",
    name: "Overlay Text",
    description: "Texto sobre imagem com overlay inteligente",
    primaryColor: PREDIAL_CASA_NOVA_COLORS.white,
    secondaryColor: PREDIAL_CASA_NOVA_COLORS.lightGray,
    backgroundColor: PREDIAL_CASA_NOVA_COLORS.overlay,
    textColor: PREDIAL_CASA_NOVA_COLORS.white,
    accentColor: PREDIAL_CASA_NOVA_COLORS.orange,
    fontWeights: {
      primary: "800",
      secondary: "500",
      cta: "700"
    },
    spacing: {
      tight: 0.5,
      normal: 1,
      wide: 1.5
    }
  },
  cta_focused: {
    id: "cta_focused",
    name: "CTA Focused",
    description: "Focado em call-to-action com botões proeminentes",
    primaryColor: PREDIAL_CASA_NOVA_COLORS.orange,
    secondaryColor: PREDIAL_CASA_NOVA_COLORS.black,
    backgroundColor: PREDIAL_CASA_NOVA_COLORS.white,
    textColor: PREDIAL_CASA_NOVA_COLORS.black,
    accentColor: PREDIAL_CASA_NOVA_COLORS.orange,
    fontWeights: {
      primary: "700",
      secondary: "400",
      cta: "800"
    },
    spacing: {
      tight: 0.25,
      normal: 1,
      wide: 2
    }
  }
};

export const getTextHierarchyStyles = (template: LocalBrandTemplate, hierarchy: string): TextHierarchyStyle => {
  const baseStyles = {
    primary: {
      fontWeight: template.fontWeights.primary,
      fontSize: 24,
      textColor: template.textColor,
      textCase: "uppercase" as const,
      letterSpacing: template.spacing.wide,
      marginBottom: 12
    },
    secondary: {
      fontWeight: template.fontWeights.secondary,
      fontSize: 16,
      textColor: template.secondaryColor,
      textCase: "none" as const,
      letterSpacing: template.spacing.normal,
      marginBottom: 8
    },
    cta: {
      fontWeight: template.fontWeights.cta,
      fontSize: 14,
      textColor: template.accentColor,
      textCase: "uppercase" as const,
      letterSpacing: template.spacing.tight,
      marginBottom: 0
    },
    brand: {
      fontWeight: template.fontWeights.primary,
      fontSize: 20,
      textColor: template.primaryColor,
      textCase: "none" as const,
      letterSpacing: template.spacing.normal,
      marginBottom: 8
    }
  };

  return baseStyles[hierarchy as keyof typeof baseStyles] || baseStyles.primary;
};

export const getIntelligentTextPosition = (
  imageAnalysis: { hasDarkAreas: boolean; hasBrightAreas: boolean; aspectRatio: string | null },
  template: LocalBrandTemplate
): "top" | "center" | "bottom" => {
  if (template.id === "predial_casa_nova") {
    if (imageAnalysis.hasDarkAreas && !imageAnalysis.hasBrightAreas) {
      return "center";
    }
    if (imageAnalysis.hasBrightAreas && !imageAnalysis.hasDarkAreas) {
      return "bottom";
    }
    return "top";
  }
  
  return "center";
};

export const getIntelligentOverlayIntensity = (
  imageAnalysis: { hasDarkAreas: boolean; hasBrightAreas: boolean },
  template: LocalBrandTemplate
): number => {
  if (template.id === "overlay_text") {
    if (imageAnalysis.hasBrightAreas && imageAnalysis.hasDarkAreas) {
      return 70;
    }
    if (imageAnalysis.hasBrightAreas) {
      return 50;
    }
    return 30;
  }
  
  return 0;
};
