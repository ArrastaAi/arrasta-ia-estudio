
export interface TextStyleOptions {
  // Propriedades essenciais do Instagram Stories
  textSize: "small" | "medium" | "large";
  textPosition: "top" | "center" | "bottom";
  textStyle: "impact" | "elegant" | "cta" | "minimal";
  textColor: string;
  hasBackground: boolean;
  backgroundColor?: string;
  backgroundOpacity?: number;
  
  // Propriedades legadas (manter compatibilidade)
  alignment: "left" | "center" | "right";
  fontFamily: "helvetica" | "fixture" | "serif" | "mono";
  fontSize: number;
  hasOutline: boolean;
  outlineColor: string;
  outlineWidth: number;
  textHierarchy: "primary" | "secondary" | "cta" | "brand";
  fontWeight: "light" | "regular" | "bold" | "extra-bold";
  brandStyle: "arrastaai_dark" | "arrastaai_purple" | "arrastaai_minimal" | "custom";
  useIntelligentPositioning: boolean;
  overlayIntensity: number;
  textCase: "none" | "uppercase" | "lowercase" | "capitalize";
  letterSpacing: number;
}

export interface TextHierarchyStyle {
  fontWeight: string;
  fontSize: number;
  textColor: string;
  textCase: "none" | "uppercase" | "lowercase" | "capitalize";
  letterSpacing: number;
  marginBottom: number;
}

export interface ArrastaAiTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  textStyle: Partial<TextStyleOptions>;
}

// Paleta de cores ArrastaAí
export const ARRASTAAI_COLORS = {
  black: "#000000",
  darkGray: "#121212", 
  white: "#FFFFFF",
  purple: "#A259FF",
  blue: "#5B8EFF",
  magenta: "#B16EFF",
  lightGray: "#F5F5F5"
};
