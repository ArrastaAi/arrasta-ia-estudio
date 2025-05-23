
/**
 * Funções utilitárias para lidar com estilos de layout e formatação de conteúdo
 */

/**
 * Interface para informações sobre imagens
 */
export interface ImageInfo {
  url: string | null;
  aspectRatio: number | null;
  hasDarkAreas: boolean;
  hasBrightAreas: boolean;
}

/**
 * Determina a família de fonte com base no tipo de layout
 */
export function determineFontFamily(layoutType: string, isTitle: boolean = false): string {
  // Layouts de livros
  if (["fiction_cover", "nonfiction_cover", "memoir", "self_help", "academic", "thriller"].includes(layoutType)) {
    return isTitle ? "serif" : "serif";
  }
  // Layouts editoriais 
  else if (["editorial", "quote", "manifesto", "statistics", "case_study", "long_form"].includes(layoutType)) {
    return isTitle ? "fixture" : "helvetica";
  } 
  // Redes sociais e outros layouts
  else {
    return isTitle ? "fixture" : "helvetica";
  }
}

/**
 * Detecta a proporção de aspecto de uma imagem
 */
export async function detectImageAspectRatio(imageUrl: string): Promise<number | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(img.width / img.height);
    };
    img.onerror = () => {
      console.error("Erro ao carregar imagem para análise");
      resolve(null);
    };
    img.src = imageUrl;
  });
}

/**
 * Analisa o brilho de uma imagem para detectar áreas claras e escuras
 */
export async function analyzeImageBrightness(imageUrl: string): Promise<{hasDarkAreas: boolean; hasBrightAreas: boolean}> {
  // Por padrão, assumimos que todas as imagens têm áreas escuras e claras
  // Uma implementação real analisaria a imagem pixel por pixel
  return {
    hasDarkAreas: true,
    hasBrightAreas: true
  };
}

/**
 * Determina a posição de texto otimizada com base nas características da imagem e layout
 */
export function determineOptimalTextPosition(imageInfo: ImageInfo, layoutType: string): string {
  if (!imageInfo.url) return "center";
  
  // Layouts de livros têm posicionamentos específicos
  if (["fiction_cover", "nonfiction_cover", "memoir"].includes(layoutType)) {
    return "bottom";
  } else if (["self_help", "academic"].includes(layoutType)) {
    return "center";
  } else if (["thriller"].includes(layoutType)) {
    return "bottom";
  }
  
  // Layouts editoriais
  if (["editorial", "quote", "manifesto", "statistics", "case_study", "long_form"].includes(layoutType)) {
    if (layoutType === "quote") return "center";
    if (layoutType === "statistics") return "center";
    return "bottom";
  }
  
  // Para imagens com proporção quadrada, centralizar o texto
  if (imageInfo.aspectRatio && Math.abs(imageInfo.aspectRatio - 1) < 0.1) {
    return "center";
  }
  
  // Para imagens horizontais amplas, texto no topo
  if (imageInfo.aspectRatio && imageInfo.aspectRatio > 1.5) {
    return "top";
  }
  
  // Para imagens verticais, texto na parte inferior
  if (imageInfo.aspectRatio && imageInfo.aspectRatio < 0.7) {
    return "bottom";
  }
  
  // Padrão para outros casos
  return "center";
}

/**
 * Adapta o conteúdo ao modelo de estilo selecionado
 */
export function adaptContentToModel(content: string | undefined, modelType: string): string {
  if (!content) return "";

  // Layouts de livros
  if (["fiction_cover", "nonfiction_cover", "memoir", "self_help", "academic", "thriller"].includes(modelType)) {
    return adaptToBookStyle(content, modelType);
  }
  // Layouts editoriais
  else if (["editorial", "quote", "manifesto", "statistics", "case_study", "long_form"].includes(modelType)) {
    return adaptToEditorialStyle(content, modelType);
  }
  // Redes sociais
  else if (["feed_square", "instagram_rect", "stories", "tiktok", "facebook", "linkedin", "twitter", "youtube"].includes(modelType)) {
    return adaptToSocialMediaStyle(content, modelType);
  }
  // Formatos de mídia
  else if (["newspaper", "magazine", "pinterest"].includes(modelType)) {
    return adaptToMediaStyle(content, modelType);
  }
  
  // Padrão
  return content;
}

/**
 * Adapta o conteúdo para o estilo de livro
 */
function adaptToBookStyle(content: string, bookType: string): string {
  // Remove marcadores de lista, se presentes
  let adaptedContent = content.replace(/^[•\-*]\s+/gm, '');
  
  // Adiciona aspas em citações que parecem diretas
  adaptedContent = adaptedContent.replace(/"([^"]+)"/g, '"$1"');
  
  // Adaptações específicas para cada tipo de livro
  switch (bookType) {
    case "fiction_cover":
      // Estilo narrativo, diálogos mais frequentes
      adaptedContent = adaptedContent
        .replace(/\b(eu disse|você disse)\b/gi, match => match.replace("disse", "falei"))
        .replace(/\b(estava)\b/gi, "encontrava-se")
        .replace(/\.\s+/g, ".\n\n"); // Quebras de parágrafo mais frequentes em narrativas
      break;
      
    case "nonfiction_cover":
      // Estilo mais formal, direto
      adaptedContent = adaptedContent
        .replace(/\b(acho que|eu acho)\b/gi, "considero que")
        .replace(/\b(muita gente|muitas pessoas)\b/gi, "diversos estudos indicam")
        .replace(/\b(é importante)\b/gi, "é fundamental");
      break;
      
    case "memoir":
      // Estilo pessoal, reflexivo
      adaptedContent = adaptedContent
        .replace(/\b(lembro)\b/gi, "recordo-me")
        .replace(/\b(pensei)\b/gi, "refleti")
        .replace(/\b(vi)\b/gi, "presenciei");
      break;
      
    case "self_help":
      // Estilo motivacional, direto ao leitor
      adaptedContent = adaptedContent
        .replace(/\b(você pode)\b/gi, "você consegue")
        .replace(/\b(tente)\b/gi, "pratique")
        .replace(/\b(problema)\b/gi, "desafio")
        .replace(/\b(difícil)\b/gi, "desafiador");
      break;
      
    case "academic":
      // Estilo formal, técnico
      adaptedContent = adaptedContent
        .replace(/\b(mostra)\b/gi, "demonstra")
        .replace(/\b(uso)\b/gi, "utilização")
        .replace(/\b(feito)\b/gi, "realizado")
        .replace(/\b(ligado a)\b/gi, "correlacionado com");
      break;
      
    case "thriller":
      // Estilo tenso, dramático
      adaptedContent = adaptedContent
        .replace(/\b(olhou)\b/gi, "fitou")
        .replace(/\b(andou)\b/gi, "avançou")
        .replace(/\b(rápido)\b/gi, "veloz")
        .replace(/\b(medo)\b/gi, "pavor");
      break;
  }
  
  // Assegura que parágrafos têm pelo menos 20 palavras (quando possível)
  const paragraphs = adaptedContent.split(/\n+/).filter(p => p.trim().length > 0);
  
  if (paragraphs.length > 1) {
    // Combina parágrafos curtos
    const combinedParagraphs = [];
    let currentParagraph = "";
    
    for (const paragraph of paragraphs) {
      const wordCount = paragraph.split(/\s+/).length;
      
      if (currentParagraph && wordCount < 15) {
        currentParagraph += " " + paragraph;
      } else {
        if (currentParagraph) {
          combinedParagraphs.push(currentParagraph);
        }
        currentParagraph = paragraph;
      }
    }
    
    if (currentParagraph) {
      combinedParagraphs.push(currentParagraph);
    }
    
    adaptedContent = combinedParagraphs.join("\n\n");
  }
  
  // Adicionar tratamento formal característico de livros em português
  adaptedContent = adaptedContent
    .replace(/(?:^|\. )(\w)/g, match => match.toUpperCase())  // Capitalizar início de frases
    .replace(/\b(eu|você|a gente)\b/gi, match => match.toLowerCase())  // Normalizar pronomes
    .replace(/\b(não é|tá|pra)\b/gi, match => {
      // Substituir expressões coloquiais por formais em português
      const replacements: Record<string, string> = {
        'não é': 'não está',
        'tá': 'está',
        'pra': 'para'
      };
      return replacements[match.toLowerCase()] || match;
    })
    .replace(/\b(né|tipo|daí|aí)\b/gi, match => {
      // Substituir mais expressões coloquiais brasileiras
      const replacements: Record<string, string> = {
        'né': 'não é',
        'tipo': 'como',
        'daí': 'então',
        'aí': 'então'
      };
      return replacements[match.toLowerCase()] || match;
    });
    
  return adaptedContent;
}

/**
 * Adapta o conteúdo para o estilo editorial
 */
function adaptToEditorialStyle(content: string, editorialType: string): string {
  // Divide o conteúdo em parágrafos
  let paragraphs = content.split(/\n+/).filter(p => p.trim().length > 0);
  
  if (paragraphs.length === 0) {
    return content;
  }
  
  // Adaptações específicas por tipo editorial
  switch (editorialType) {
    case "quote":
      // Para citações, mantém apenas uma frase impactante
      if (paragraphs.length > 0) {
        const sentences = paragraphs[0].split(/\.\s+/);
        if (sentences.length > 0) {
          // Pega a frase mais impactante (assumindo que é a mais curta entre 30-100 caracteres)
          const impactfulSentences = sentences.filter(s => s.length >= 30 && s.length <= 100);
          if (impactfulSentences.length > 0) {
            // Ordena por comprimento e pega a mais curta
            return `"${impactfulSentences.sort((a, b) => a.length - b.length)[0]}"`;
          } else {
            // Se não encontrar uma frase ideal, usa a primeira
            return `"${sentences[0]}"`;
          }
        }
      }
      break;
      
    case "statistics":
      // Para estatísticas, tenta extrair números
      const numberMatch = content.match(/\b(\d+[,.]\d+|\d+)%?\b/);
      if (numberMatch) {
        // Encontrou um número, forma uma estatística com ele
        const number = numberMatch[0];
        const restOfSentence = content.substring(content.indexOf(number) + number.length);
        const context = restOfSentence.split(/[,.;:]/)
                         .filter(s => s.trim().length > 0)
                         .map(s => s.trim())
                         [0] || "";
        
        return `${number}\n${context}`;
      } else {
        // Não encontrou números, cria uma estatística genérica
        const words = content.split(/\s+/).filter(w => w.length > 3);
        const randomIndex = Math.floor(Math.random() * words.length);
        const keyword = words[randomIndex] || "resultados";
        
        return `87%\ndos ${keyword} comprovam eficácia`;
      }
      
    case "manifesto":
      // Para manifestos, cria um título forte e subtítulo
      if (paragraphs.length > 0) {
        const firstParagraph = paragraphs[0];
        const words = firstParagraph.split(/\s+/).filter(w => w.length > 3);
        
        // Cria um título com palavras-chave
        const titleWords = words
          .slice(0, 3)
          .map(w => w.toUpperCase());
        
        const title = titleWords.join(" ");
        
        // Cria um subtítulo com o resto do conteúdo
        let subtitle = "";
        if (paragraphs.length > 1) {
          subtitle = paragraphs[1];
        } else {
          subtitle = firstParagraph.split(".")[0];
        }
        
        return `${title}\n${subtitle}`;
      }
      break;
      
    case "case_study":
    case "long_form":
      // Extrai ou cria um título em destaque
      let title = "";
      let body = [...paragraphs];
      
      // Se o primeiro parágrafo tem menos de 10 palavras, considerá-lo um título
      if (paragraphs[0].split(/\s+/).length < 10) {
        title = paragraphs[0].toUpperCase();
        body = paragraphs.slice(1);
      } else {
        // Criar um título baseado no primeiro parágrafo
        const firstSentence = paragraphs[0].split(/\.\s+/)[0];
        if (firstSentence && firstSentence.length < 60) {
          title = firstSentence.toUpperCase();
        } else {
          const words = paragraphs[0].split(/\s+/).slice(0, 5);
          title = words.join(" ").toUpperCase();
        }
      }
      
      // Processar o corpo do texto para case studies e long form
      const processedBody = editorialType === "long_form" 
        ? body.join("\n\n")  // Texto longo mantém parágrafos
        : body.map(p => p.trim().replace(/\.$/, "")).join("\n");  // Case study remove pontos finais
      
      return `${title}\n\n${processedBody}`;
  }
  
  // Para outros tipos editoriais (editorial padrão)
  // Extrai ou cria um título em destaque
  let title = "";
  let body = [...paragraphs];
  
  // Se o primeiro parágrafo tem menos de 10 palavras, considerá-lo um título
  if (paragraphs[0].split(/\s+/).length < 10) {
    title = paragraphs[0].toUpperCase();
    body = paragraphs.slice(1);
  } else {
    // Criar um título baseado no primeiro parágrafo
    const firstSentence = paragraphs[0].split(/\.\s+/)[0];
    if (firstSentence && firstSentence.length < 60) {
      title = firstSentence.toUpperCase();
    } else {
      const words = paragraphs[0].split(/\s+/).slice(0, 5);
      title = words.join(" ").toUpperCase();
    }
  }
  
  // Dividir parágrafos longos
  const processedBody = body.flatMap(paragraph => {
    if (paragraph.split(/\s+/).length > 30) {
      // Dividir parágrafos longos em sentenças
      const sentences = paragraph.split(/\.\s+/);
      if (sentences.length > 1) {
        let result = [];
        let current = "";
        
        for (const sentence of sentences) {
          if (current && current.split(/\s+/).length + sentence.split(/\s+/).length > 25) {
            result.push(current + ".");
            current = sentence;
          } else {
            current = current ? `${current}. ${sentence}` : sentence;
          }
        }
        
        if (current) {
          result.push(current + ".");
        }
        
        return result;
      }
    }
    
    return [paragraph];
  });
  
  // Adicionar estilo editorial para português brasileiro
  const styledParagraphs = processedBody.map((p, i) => {
    // Melhorar conteúdo com termos editoriais brasileiros
    let enhancedP = p
      .replace(/\b(importante|relevante)\b/gi, "fundamental")
      .replace(/\b(ver|olhar)\b/gi, "observar")
      .replace(/\b(bom|legal)\b/gi, "excelente")
      .replace(/\b(ruim|mal)\b/gi, "insuficiente");

    if (i === 0 && !title) {
      // Destacar o início do primeiro parágrafo se não houver título
      const words = enhancedP.split(/\s+/);
      if (words.length >= 3) {
        return words.slice(0, 3).join(" ").toUpperCase() + " " + words.slice(3).join(" ");
      }
    }
    return enhancedP;
  });
  
  // Reconstruir o texto com título e corpo
  return [title, ...styledParagraphs].filter(p => p).join("\n\n");
}

/**
 * Adapta o conteúdo para estilo de mídia social
 */
function adaptToSocialMediaStyle(content: string, socialType: string): string {
  if (!content) return "";
  
  // Remove espaços em branco extras e quebras de linha
  let adaptedContent = content.trim().replace(/\s+/g, " ");
  
  switch (socialType) {
    case "feed_square":
    case "instagram_rect":
      // Instagram - conciso, emocional, hashtags
      if (adaptedContent.length > 150) {
        // Reduz para evitar texto longo demais
        adaptedContent = adaptedContent.substring(0, 150) + "...";
      }
      // Adiciona emojis e hashtags
      adaptedContent += "\n\n";
      adaptedContent += ["✨", "🙌", "💯", "✅", "🔥"][Math.floor(Math.random() * 5)];
      adaptedContent += " ";
      
      // Extrai palavras-chave para hashtags
      const keywords = content.split(/\s+/)
        .filter(word => word.length > 4)
        .slice(0, 3)
        .map(word => "#" + word.toLowerCase().replace(/[.,;:!?]/g, ""));
      
      adaptedContent += keywords.join(" ");
      break;
      
    case "stories":
      // Stories - muito curto, direto
      if (adaptedContent.length > 60) {
        // Extrai apenas o essencial
        const sentences = adaptedContent.split(/\.\s+/);
        if (sentences.length > 0) {
          adaptedContent = sentences[0];
          if (adaptedContent.length > 60) {
            adaptedContent = adaptedContent.substring(0, 57) + "...";
          }
        }
      }
      break;
      
    case "tiktok":
      // TikTok - curto, trending, hashtags
      if (adaptedContent.length > 100) {
        adaptedContent = adaptedContent.substring(0, 97) + "...";
      }
      adaptedContent = adaptedContent.replace(/\b(interessante|legal|incrível)\b/gi, "viral");
      adaptedContent += "\n\n#FYP #ParaVocê #Trend";
      break;
      
    case "twitter":
      // Twitter - conciso, direto
      if (adaptedContent.length > 280) {
        adaptedContent = adaptedContent.substring(0, 277) + "...";
      }
      break;
      
    case "facebook":
    case "linkedin":
      // Mais formal, pode ser mais longo
      if (adaptedContent.length > 400) {
        // Divide em parágrafos para melhor legibilidade
        const sentences = adaptedContent.split(/\.\s+/);
        adaptedContent = "";
        let currentLength = 0;
        
        for (let i = 0; i < sentences.length; i++) {
          if (currentLength + sentences[i].length > 380) {
            adaptedContent += "...";
            break;
          }
          
          adaptedContent += sentences[i] + ". ";
          currentLength += sentences[i].length + 2;
          
          // Adiciona quebra de parágrafo a cada 2-3 frases
          if ((i + 1) % 3 === 0) {
            adaptedContent += "\n\n";
          }
        }
      }
      break;
      
    case "youtube":
      // Estilo clickbait para títulos/descrições
      adaptedContent = adaptedContent.toUpperCase();
      if (!adaptedContent.includes("COMO") && !adaptedContent.includes("INCRÍVEL") && Math.random() > 0.5) {
        adaptedContent = "VEJA COMO " + adaptedContent;
      }
      if (!adaptedContent.includes("!")) {
        adaptedContent += "!";
      }
      break;
  }
  
  return adaptedContent;
}

/**
 * Adapta o conteúdo para estilo de mídia tradicional
 */
function adaptToMediaStyle(content: string, mediaType: string): string {
  if (!content) return "";
  
  // Divide em parágrafos
  const paragraphs = content.split(/\n+/).filter(p => p.trim());
  
  switch (mediaType) {
    case "newspaper":
      // Estilo jornal - título destacado, primeiro parágrafo é lide
      let title = "";
      let body = [...paragraphs];
      
      // Extrai ou cria título
      if (paragraphs.length > 0) {
        if (paragraphs[0].length < 80) {
          title = paragraphs[0].toUpperCase();
          body = paragraphs.slice(1);
        } else {
          // Cria um título a partir da primeira frase
          const firstSentence = paragraphs[0].split(/\.\s+/)[0];
          title = firstSentence.toUpperCase();
        }
      }
      
      // Formata o lide (primeiro parágrafo)
      let lide = "";
      if (body.length > 0) {
        // O lide deve responder: quem, o quê, quando, onde, como, por quê
        lide = body[0];
        body = body.slice(1);
      }
      
      // Formata o corpo da notícia
      const formattedBody = body.join("\n\n");
      
      return `${title}\n\n${lide}\n\n${formattedBody}`;
      
    case "magazine":
      // Estilo revista - mais criativo que jornal
      let magazineTitle = "";
      const magazineBody = [...paragraphs];
      
      // Cria um título criativo
      if (magazineBody.length > 0) {
        const firstParagraph = magazineBody[0];
        const words = firstParagraph.split(/\s+/);
        
        // Usa palavras-chave do conteúdo
        const keywordCandidates = words
          .filter(w => w.length > 4)
          .slice(0, 3);
        
        if (keywordCandidates.length > 0) {
          magazineTitle = keywordCandidates.join(" ").toUpperCase();
        } else {
          magazineTitle = firstParagraph.substring(0, 50).toUpperCase();
        }
      }
      
      // Formato de revista: título, subtítulo e corpo
      let subtitle = "";
      if (magazineBody.length > 1) {
        subtitle = magazineBody[0];
        return `${magazineTitle}\n\n${subtitle}\n\n${magazineBody.slice(1).join("\n\n")}`;
      } else {
        return `${magazineTitle}\n\n${magazineBody.join("\n\n")}`;
      }
      
    case "pinterest":
      // Pinterest - visual, inspiracional, curto
      // Título destacado + frase inspiracional
      const words = content.split(/\s+/).filter(w => w.length > 3);
      let pinterestTitle = "";
      
      if (words.length >= 3) {
        pinterestTitle = words.slice(0, 3).join(" ").toUpperCase();
      } else {
        pinterestTitle = content.substring(0, 30).toUpperCase();
      }
      
      // Extrai ou cria uma frase inspiracional
      let inspirationalQuote = "";
      if (paragraphs.length > 0) {
        const sentences = content.split(/\.\s+/);
        if (sentences.length > 1) {
          // Escolhe a frase mais curta para inspiração
          inspirationalQuote = sentences
            .filter(s => s.length > 20 && s.length < 100)
            .sort((a, b) => a.length - b.length)[0] || sentences[0];
        } else {
          inspirationalQuote = paragraphs[0];
        }
      }
      
      return `${pinterestTitle}\n\n"${inspirationalQuote}"`;
  }
  
  return content;
}

/**
 * Analisa a imagem para determinar o posicionamento ideal do texto
 */
export function analyzeImageForTextPosition(imageUrl: string | null): 'top' | 'middle' | 'bottom' {
  if (!imageUrl) return 'middle';
  
  // Aqui implementaríamos uma lógica para analisar a imagem
  // Por enquanto, retornamos uma posição padrão
  return 'bottom';
}

/**
 * Determina o tamanho de fonte recomendado com base no conteúdo
 */
export function getRecommendedFontSize(content: string | undefined, isMobile: boolean): number {
  if (!content) return isMobile ? 16 : 18;
  
  const wordCount = content.split(/\s+/).length;
  
  if (wordCount > 50) return isMobile ? 14 : 16;
  if (wordCount > 30) return isMobile ? 15 : 17;
  if (wordCount > 15) return isMobile ? 16 : 18;
  if (wordCount > 5) return isMobile ? 18 : 20;
  
  return isMobile ? 20 : 24; // Para conteúdo muito curto (títulos)
}
