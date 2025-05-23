
import { storage } from "@/integrations/firebase/client";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export interface ImageLabel {
  description: string;
  mid: string; // Knowledge Graph entity ID
  score: number;
  topicality?: number;
}

export interface ImageLabelingResult {
  labels: ImageLabel[];
  imageUrl: string;
}

/**
 * Service para rotulagem de imagens usando Firebase ML Kit
 * Esta implementação usa a API Cloud Vision através do Firebase Functions
 */
export class FirebaseMLImageLabeling {
  
  /**
   * Gera rótulos para uma imagem
   */
  static async labelImage(imageFile: File): Promise<ImageLabelingResult> {
    try {
      // Upload temporário da imagem para Firebase Storage
      const tempPath = `temp/image-labeling/${uuidv4()}-${imageFile.name}`;
      const storageRef = ref(storage, tempPath);
      
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);
      
      // Chamar API de rotulagem
      const result = await this.callImageLabelingAPI(imageUrl);
      
      // Limpar arquivo temporário
      await deleteObject(storageRef);
      
      return {
        ...result,
        imageUrl
      };
    } catch (error) {
      console.error("Erro na rotulagem de imagem:", error);
      throw new Error("Falha ao gerar rótulos para a imagem");
    }
  }

  /**
   * Gera rótulos para uma URL de imagem
   */
  static async labelImageFromUrl(imageUrl: string): Promise<ImageLabelingResult> {
    try {
      const result = await this.callImageLabelingAPI(imageUrl);
      return {
        ...result,
        imageUrl
      };
    } catch (error) {
      console.error("Erro na rotulagem de imagem:", error);
      throw new Error("Falha ao gerar rótulos para a imagem");
    }
  }

  /**
   * Chama a API de rotulagem de imagens (a ser implementada via Firebase Functions)
   */
  private static async callImageLabelingAPI(imageUrl: string): Promise<{ labels: ImageLabel[] }> {
    // TODO: Implementar chamada para Firebase Function que usa Cloud Vision API
    // Por enquanto, retorna resultado mockado
    return {
      labels: [
        {
          description: "Pessoa",
          mid: "/m/01g317",
          score: 0.95,
          topicality: 0.95
        },
        {
          description: "Tecnologia",
          mid: "/m/07c1v",
          score: 0.89,
          topicality: 0.92
        },
        {
          description: "Computador",
          mid: "/m/0dk0l",
          score: 0.87,
          topicality: 0.88
        }
      ]
    };
  }

  /**
   * Filtra rótulos por confiança mínima
   */
  static filterLabelsByConfidence(labels: ImageLabel[], minConfidence: number = 0.7): ImageLabel[] {
    return labels.filter(label => label.score >= minConfidence);
  }

  /**
   * Obtém apenas as descrições dos rótulos
   */
  static extractLabelDescriptions(labels: ImageLabel[]): string[] {
    return labels.map(label => label.description);
  }

  /**
   * Categoriza automaticamente uma imagem baseada nos rótulos
   */
  static categorizeImage(labels: ImageLabel[]): string {
    const highConfidenceLabels = this.filterLabelsByConfidence(labels, 0.8);
    
    if (highConfidenceLabels.length === 0) {
      return "Geral";
    }

    // Categorizar baseado nos rótulos de maior confiança
    const descriptions = this.extractLabelDescriptions(highConfidenceLabels);
    
    if (descriptions.some(desc => desc.toLowerCase().includes("pessoa") || desc.toLowerCase().includes("person"))) {
      return "Pessoas";
    }
    
    if (descriptions.some(desc => desc.toLowerCase().includes("tecnologia") || desc.toLowerCase().includes("computer"))) {
      return "Tecnologia";
    }
    
    if (descriptions.some(desc => desc.toLowerCase().includes("natureza") || desc.toLowerCase().includes("plant"))) {
      return "Natureza";
    }
    
    return "Geral";
  }
}
