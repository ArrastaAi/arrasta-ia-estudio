
export interface TextStyleOptions {
  // Propriedades essenciais do Instagram Stories
  textSize: "small" | "medium" | "large";
  textPosition: "top" | "center" | "bottom";
  textStyle: "impact" | "elegant" | "cta" | "minimal" | "hyeser";
  textColor: string;
  fontFamily: "helvetica" | "pacifico" | "bebas" | "brusher" | "selima" | "fixture" | "serif" | "mono";
  hasBackground: boolean;
  backgroundColor?: string;
  backgroundOpacity?: number;
  
  // Propriedades legadas (manter compatibilidade)
  alignment: "left" | "center" | "right";
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

// Paleta de cores do Instagram Stories
export const INSTAGRAM_COLORS = {
  white: "#FFFFFF",
  black: "#000000",
  red: "#FF3040",
  orange: "#FF6B35", 
  yellow: "#FFD23F",
  green: "#4CAF50",
  blue: "#2196F3",
  purple: "#9C27B0",
  pink: "#E91E63",
  gray: "#757575"
};

// Manter compatibilidade (deprecated)
export const ARRASTAAI_COLORS = INSTAGRAM_COLORS;
