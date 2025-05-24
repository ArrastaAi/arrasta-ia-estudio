
interface GeneratedText {
  id: number;
  text: string;
}

export function parseResponseToSlidesAdvanced(text: string, maxSlides: number, agent: string): GeneratedText[] {
  const slides: GeneratedText[] = [];
  
  console.log(`[${agent.toUpperCase()}] Iniciando parsing avançado para ${maxSlides} slides`);
  
  // Try to match "Slide X:" pattern first (most precise)
  const slideMatches = text.match(/Slide\s*(\d+):\s*([^\n]+?)(?=\s*Slide\s*\d+:|$)/gs);
  
  if (slideMatches && slideMatches.length > 0) {
    console.log(`[${agent.toUpperCase()}] Encontrados ${slideMatches.length} slides usando padrão Slide:`);
    slideMatches.forEach((match, index) => {
      if (index >= maxSlides) return;
      
      const slideNumberMatch = match.match(/Slide\s*(\d+):\s*/);
      const slideNumber = slideNumberMatch ? parseInt(slideNumberMatch[1]) : index + 1;
      const content = match.replace(/Slide\s*\d+:\s*/, '').trim();
      
      if (content) {
        slides.push({
          id: slideNumber,
          text: content
        });
      }
    });
  } else if (agent === "yuri" || agent === "formatter") {
    // Try alternative parsing for structured agents
    console.log(`[${agent.toUpperCase()}] Tentando parsing alternativo para agente estruturado`);
    
    // Try "texto X -" pattern for yuri agent
    const textMatches = text.match(/texto\s*(\d+)\s*-\s*([^\n]+?)(?=\s*texto\s*\d+\s*-|$)/gs);
    
    if (textMatches && textMatches.length > 0) {
      console.log(`[${agent.toUpperCase()}] Encontrados ${textMatches.length} blocos usando padrão texto:`);
      textMatches.forEach((match, index) => {
        if (index >= maxSlides) return;
        
        const content = match.replace(/texto\s*\d+\s*-\s*/, '').trim();
        if (content) {
          slides.push({
            id: index + 1,
            text: content
          });
        }
      });
    } else {
      // Fallback: split by meaningful breaks
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 10);
      if (paragraphs.length > 0) {
        paragraphs.slice(0, maxSlides).forEach((paragraph, index) => {
          slides.push({
            id: index + 1,
            text: paragraph.trim()
          });
        });
      }
    }
  } else {
    console.log(`[${agent.toUpperCase()}] Usando parsing linha por linha como fallback`);
    // Fallback: split by lines and create slides
    const lines = text.split('\n').filter(line => line.trim().length > 15);
    lines.forEach((line, index) => {
      if (index >= maxSlides) return;
      
      const cleanLine = line.replace(/^\d+\.\s*|\-\s*|\*\s*|texto\s*\d+\s*-\s*/i, '').trim();
      if (cleanLine && cleanLine.length > 10) {
        slides.push({
          id: index + 1,
          text: cleanLine
        });
      }
    });
  }

  console.log(`[${agent.toUpperCase()}] Parse avançado concluído: ${slides.length} slides de qualidade`);
  return slides.slice(0, maxSlides);
}
