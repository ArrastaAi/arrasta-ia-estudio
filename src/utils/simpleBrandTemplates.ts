
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

export const getTextHierarchyStyles = (templateId: string, hierarchy: string): TextHierarchyStyle => {
  const baseStyles = {
    primary: {
      fontWeight: "800",
      fontSize: 24,
      textColor: PREDIAL_CASA_NOVA_COLORS.white,
      textCase: "uppercase" as const,
      letterSpacing: 0.02,
      marginBottom: 12
    },
    secondary: {
      fontWeight: "400",
      fontSize: 16,
      textColor: PREDIAL_CASA_NOVA_COLORS.lightGray,
      textCase: "none" as const,
      letterSpacing: 0.01,
      marginBottom: 8
    },
    cta: {
      fontWeight: "700",
      fontSize: 14,
      textColor: PREDIAL_CASA_NOVA_COLORS.orange,
      textCase: "uppercase" as const,
      letterSpacing: 0.01,
      marginBottom: 0
    },
    brand: {
      fontWeight: "800",
      fontSize: 20,
      textColor: PREDIAL_CASA_NOVA_COLORS.orange,
      textCase: "none" as const,
      letterSpacing: 0.01,
      marginBottom: 8
    }
  };

  return baseStyles[hierarchy as keyof typeof baseStyles] || baseStyles.primary;
};
