import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SlideImageRequest {
  slides: Array<{
    content: string;
    slideNumber: number;
    id?: string;
  }>;
  theme: string;
  style: 'photographic' | 'illustration' | 'minimalist';
  provider: 'gemini' | 'openai' | 'auto';
}

interface GeneratedImage {
  slideId: string;
  slideNumber: number;
  imageUrl: string;
  prompt: string;
  provider: string;
}

const generatePromptFromContent = (content: string, theme: string, style: string, slideNumber: number): string => {
  // Extrair texto principal do conteúdo do slide
  const cleanContent = content.replace(/\n+/g, ' ').trim();
  const words = cleanContent.split(' ').slice(0, 10).join(' '); // Primeiras 10 palavras
  
  const stylePrompts = {
    photographic: "professional photography, high quality, realistic",
    illustration: "digital illustration, vector art, clean design",
    minimalist: "minimalist design, simple composition, clean background"
  };

  const basePrompt = `${stylePrompts[style]}, ${theme} theme, representing: ${words}`;
  
  // Adicionar contexto específico baseado no número do slide
  if (slideNumber === 1) {
    return `${basePrompt}, introduction slide, engaging opening visual`;
  } else if (slideNumber > 8) {
    return `${basePrompt}, conclusion slide, call to action visual`;
  } else {
    return `${basePrompt}, informative content slide`;
  }
};

const generateWithOpenAI = async (prompt: string): Promise<string> => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  console.log('🔑 Verificando OpenAI API Key...');
  if (!openAIApiKey) {
    console.error('❌ OpenAI API key não configurada no Supabase Secrets');
    throw new Error('OpenAI API key não configurada. Configure OPENAI_API_KEY nos Secrets do Supabase.');
  }
  
  console.log('✅ OpenAI API Key encontrada');
  console.log('🎨 Gerando imagem com OpenAI:', prompt.substring(0, 100) + '...');

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: `Professional, clean, modern design: ${prompt}. High quality, business presentation style, minimalist aesthetic.`,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      response_format: 'url'
    }),
  });

  console.log('📡 OpenAI API Response Status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ OpenAI API Error:', errorText);
    
    let errorMessage = 'Erro na OpenAI API';
    try {
      const error = JSON.parse(errorText);
      errorMessage = `OpenAI API Error: ${error.error?.message || response.statusText}`;
    } catch {
      errorMessage = `OpenAI API Error (${response.status}): ${errorText}`;
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log('✅ Imagem gerada com sucesso pela OpenAI');
  return data.data[0].url;
};

const uploadImageToSupabase = async (imageUrl: string, fileName: string): Promise<string> => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  console.log('🔗 Fazendo download da imagem gerada...');
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Download da imagem
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    console.error('❌ Falha ao fazer download da imagem:', imageResponse.status);
    throw new Error('Falha ao fazer download da imagem gerada');
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  console.log('📤 Fazendo upload para Supabase Storage...');

  // Upload para o Supabase Storage
  const { data, error } = await supabase.storage
    .from('carousel-images')
    .upload(`ai-generated/${fileName}`, imageBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    console.error('❌ Erro no upload para Supabase:', error);
    throw new Error(`Erro no upload para Supabase: ${error.message}`);
  }

  // Retornar URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('carousel-images')
    .getPublicUrl(`ai-generated/${fileName}`);

  console.log('✅ Upload concluído com sucesso:', fileName);
  return publicUrl;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🚀 Edge Function generate-slide-images iniciada');
  console.log('📝 Method:', req.method);
  console.log('🌐 Headers:', Object.fromEntries(req.headers.entries()));

  try {
    const requestData: SlideImageRequest = await req.json();
    const { slides, theme, style, provider } = requestData;

    console.log('📊 Dados da requisição:', {
      slideCount: slides.length,
      theme,
      style,
      provider
    });

    if (!slides || slides.length === 0) {
      throw new Error('Nenhum slide fornecido para geração de imagens');
    }

    const results: GeneratedImage[] = [];

    for (const slide of slides) {
      try {
        console.log(`\n🎯 Processando slide ${slide.slideNumber}...`);
        
        const prompt = generatePromptFromContent(slide.content, theme, style, slide.slideNumber);
        console.log(`📝 Prompt gerado: ${prompt}`);

        let imageUrl: string;
        let usedProvider: string;

        // Usar OpenAI (agora com API key configurada)
        try {
          imageUrl = await generateWithOpenAI(prompt);
          usedProvider = 'openai';
        } catch (error) {
          console.error(`❌ Falha ao gerar imagem para slide ${slide.slideNumber}:`, error.message);
          throw error;
        }

        // Upload para Supabase Storage
        const fileName = `slide-${slide.slideNumber}-${Date.now()}.png`;
        const supabaseUrl = await uploadImageToSupabase(imageUrl, fileName);

        results.push({
          slideId: slide.id || `slide-${slide.slideNumber}`,
          slideNumber: slide.slideNumber,
          imageUrl: supabaseUrl,
          prompt,
          provider: usedProvider
        });

        console.log(`✅ Slide ${slide.slideNumber} processado com sucesso usando ${usedProvider}`);

      } catch (error) {
        console.error(`❌ Falha no slide ${slide.slideNumber}:`, error.message);
        // Continue com os outros slides mesmo se um falhar
      }
    }

    const response = {
      success: true,
      generatedImages: results,
      message: `Geradas ${results.length} de ${slides.length} imagens com sucesso`
    };

    console.log('🎉 Processo concluído:', response.message);
    console.log('📈 Resultados:', results.length, 'imagens geradas');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Erro geral na Edge Function:', error);
    console.error('🔍 Stack trace:', error.stack);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Erro interno do servidor',
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});