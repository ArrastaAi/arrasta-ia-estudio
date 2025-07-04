import React from 'react';
import { Slide } from '@/types/database.types';

export interface ImageAnalysis {
  brightness: number;
  contrast: number;
  dominantColors: string[];
  safezones: {
    top: boolean;
    center: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
}

export interface LayoutRecommendation {
  textPosition: 'top' | 'center' | 'bottom' | 'left' | 'right';
  overlayIntensity: number;
  textColor: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  alignment: 'left' | 'center' | 'right';
  padding: number;
}

interface SmartLayoutEngineProps {
  slides: Slide[];
  onLayoutApplied: (slideId: string, layout: LayoutRecommendation) => void;
}

export class SmartLayoutEngine {
  static analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(this.getDefaultAnalysis());
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const analysis = this.processImageData(imageData);
          resolve(analysis);
        } catch (error) {
          console.warn('Erro ao analisar imagem:', error);
          resolve(this.getDefaultAnalysis());
        }
      };

      img.onerror = () => {
        resolve(this.getDefaultAnalysis());
      };

      img.src = imageUrl;
    });
  }

  private static processImageData(imageData: ImageData): ImageAnalysis {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    let totalBrightness = 0;
    const colorCount: { [key: string]: number } = {};
    
    // Dividir imagem em regiões para análise de safezones
    const regions = {
      top: { bright: 0, total: 0 },
      center: { bright: 0, total: 0 },
      bottom: { bright: 0, total: 0 },
      left: { bright: 0, total: 0 },
      right: { bright: 0, total: 0 }
    };

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calcular brightness
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
      totalBrightness += brightness;
      
      // Determinar posição do pixel
      const pixelIndex = i / 4;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);
      
      // Classificar em regiões
      const heightThird = height / 3;
      const widthThird = width / 3;
      
      if (y < heightThird) {
        regions.top.bright += brightness;
        regions.top.total++;
      } else if (y > height - heightThird) {
        regions.bottom.bright += brightness;
        regions.bottom.total++;
      } else {
        regions.center.bright += brightness;
        regions.center.total++;
      }
      
      if (x < widthThird) {
        regions.left.bright += brightness;
        regions.left.total++;
      } else if (x > width - widthThird) {
        regions.right.bright += brightness;
        regions.right.total++;
      }
      
      // Contar cores dominantes (simplificado)
      const colorKey = `${Math.floor(r/50)*50},${Math.floor(g/50)*50},${Math.floor(b/50)*50}`;
      colorCount[colorKey] = (colorCount[colorKey] || 0) + 1;
    }

    const avgBrightness = totalBrightness / (data.length / 4);
    
    // Calcular brightness médio por região
    const regionBrightness = {
      top: regions.top.total > 0 ? regions.top.bright / regions.top.total : 128,
      center: regions.center.total > 0 ? regions.center.bright / regions.center.total : 128,
      bottom: regions.bottom.total > 0 ? regions.bottom.bright / regions.bottom.total : 128,
      left: regions.left.total > 0 ? regions.left.bright / regions.left.total : 128,
      right: regions.right.total > 0 ? regions.right.bright / regions.right.total : 128
    };

    // Determinar safezones (áreas com bom contraste para texto)
    const safezones = {
      top: regionBrightness.top < 120 || regionBrightness.top > 180,
      center: regionBrightness.center < 120 || regionBrightness.center > 180,
      bottom: regionBrightness.bottom < 120 || regionBrightness.bottom > 180,
      left: regionBrightness.left < 120 || regionBrightness.left > 180,
      right: regionBrightness.right < 120 || regionBrightness.right > 180
    };

    // Encontrar cores dominantes
    const dominantColors = Object.entries(colorCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([color]) => `rgb(${color})`);

    return {
      brightness: avgBrightness,
      contrast: this.calculateContrast(data),
      dominantColors,
      safezones
    };
  }

  private static calculateContrast(data: Uint8ClampedArray): number {
    let minBrightness = 255;
    let maxBrightness = 0;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      minBrightness = Math.min(minBrightness, brightness);
      maxBrightness = Math.max(maxBrightness, brightness);
    }

    return (maxBrightness - minBrightness) / 255;
  }

  private static getDefaultAnalysis(): ImageAnalysis {
    return {
      brightness: 128,
      contrast: 0.5,
      dominantColors: ['#808080'],
      safezones: {
        top: true,
        center: true,
        bottom: true,
        left: true,
        right: true
      }
    };
  }

  static generateLayoutRecommendation(
    analysis: ImageAnalysis,
    contentLength: number
  ): LayoutRecommendation {
    // Determinar melhor posição baseado nas safezones
    let bestPosition: 'top' | 'center' | 'bottom' | 'left' | 'right' = 'center';
    
    if (analysis.safezones.bottom) {
      bestPosition = 'bottom';
    } else if (analysis.safezones.top) {
      bestPosition = 'top';
    } else if (analysis.safezones.center) {
      bestPosition = 'center';
    } else if (analysis.safezones.left) {
      bestPosition = 'left';
    } else if (analysis.safezones.right) {
      bestPosition = 'right';
    }

    // Determinar intensidade do overlay
    const needsOverlay = analysis.contrast < 0.3 || 
                        (analysis.brightness > 100 && analysis.brightness < 200);
    const overlayIntensity = needsOverlay ? 40 : 0;

    // Determinar cor do texto
    const textColor = analysis.brightness > 128 ? 'dark' : 'light';

    // Determinar tamanho da fonte baseado no comprimento do conteúdo
    let fontSize: 'small' | 'medium' | 'large' = 'medium';
    if (contentLength < 50) {
      fontSize = 'large';
    } else if (contentLength > 150) {
      fontSize = 'small';
    }

    // Determinar alinhamento
    const alignment = bestPosition === 'left' ? 'left' : 
                     bestPosition === 'right' ? 'right' : 'center';

    return {
      textPosition: bestPosition,
      overlayIntensity,
      textColor,
      fontSize,
      alignment,
      padding: 24
    };
  }

  static async applySmartLayout(
    slides: Slide[],
    onProgress?: (current: number, total: number) => void
  ): Promise<{ slideId: string; layout: LayoutRecommendation }[]> {
    const results: { slideId: string; layout: LayoutRecommendation }[] = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      onProgress?.(i + 1, slides.length);

      if (slide.image_url) {
        try {
          const analysis = await this.analyzeImage(slide.image_url);
          const layout = this.generateLayoutRecommendation(
            analysis,
            slide.content?.length || 0
          );
          
          results.push({
            slideId: slide.id,
            layout
          });
        } catch (error) {
          console.warn(`Erro ao analisar slide ${slide.id}:`, error);
          // Usar layout padrão em caso de erro
          results.push({
            slideId: slide.id,
            layout: {
              textPosition: 'center',
              overlayIntensity: 20,
              textColor: 'light',
              fontSize: 'medium',
              alignment: 'center',
              padding: 24
            }
          });
        }
      }
    }

    return results;
  }
}

const SmartLayoutEngineComponent: React.FC<SmartLayoutEngineProps> = ({
  slides,
  onLayoutApplied
}) => {
  // Este componente pode ser usado para UI de controle do layout engine
  // Por enquanto, é principalmente uma classe utilitária
  return null;
};

export default SmartLayoutEngineComponent;