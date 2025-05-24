
export interface TextStyleOptions {
  alignment: "left" | "center" | "right";
  fontFamily: "helvetica" | "fixture" | "serif" | "mono";
  fontSize: number;
  hasBackground: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  hasOutline: boolean;
  outlineColor: string;
  outlineWidth: number;
  textPosition: "top" | "center" | "bottom";
  // Novas propriedades para sistema Predial Casa Nova
  textHierarchy: "primary" | "secondary" | "cta" | "brand";
  fontWeight: "light" | "regular" | "bold" | "extra-bold";
  textColor: string;
  brandStyle: "predial_casa_nova" | "corporate_orange" | "overlay_text" | "cta_focused" | "custom";
  useIntelligentPositioning: boolean;
  overlayIntensity: number;
  textCase: "normal" | "uppercase" | "lowercase";
  letterSpacing: number;
}

export interface TextHierarchyStyle {
  fontWeight: string;
  fontSize: number;
  textColor: string;
  textCase: "normal" | "uppercase" | "lowercase";
  letterSpacing: number;
  marginBottom: number;
}

export interface BrandTemplate {
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
