
interface GeneratedText {
  id: number;
  text: string;
}

// Número máximo de slides permitido em toda a aplicação
const MAX_SLIDES_ALLOWED = 9;

export const parseRawText = (text: string): GeneratedText[] => {
  // Try to parse by "texto X -" pattern
  const textBlocksPattern = text.split(/texto \d+ - /g).filter(Boolean);
  
  if (textBlocksPattern.length > 1) {
    // Limitar ao número máximo de slides permitido
    return textBlocksPattern.slice(0, MAX_SLIDES_ALLOWED).map((text, index) => ({
      id: index + 1,
      text: text.trim(),
    }));
  }
  
  // Try to split by paragraphs
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter(p => p.trim().length > 0)
    .map(p => p.trim());
    
  if (paragraphs.length > 1) {
    // Limitar ao número máximo de slides permitido
    return paragraphs.slice(0, MAX_SLIDES_ALLOWED).map((text, index) => ({
      id: index + 1,
      text,
    }));
  }
  
  // As a last resort, split by sentences
  const sentences = text
    .split(/(?<=\.|\?|\!)\s+/)
    .filter(s => s.trim().length > 0)
    .map(s => s.trim());
    
  // Limitar ao número máximo de slides permitido
  return sentences.slice(0, MAX_SLIDES_ALLOWED).map((text, index) => ({
    id: index + 1,
    text,
  }));
};
