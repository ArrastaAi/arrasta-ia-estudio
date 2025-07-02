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

const generateWithGemini = async (prompt: string): Promise<string> => {
  const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Generate an image with this description: ${prompt}. Make it professional and suitable for business presentations.`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Nota: Gemini Pro Vision atualmente não gera imagens diretamente
  // Por isso vamos usar o OpenAI como fallback
  throw new Error('Gemini image generation not available, falling back to OpenAI');
};

const generateWithOpenAI = async (prompt: string): Promise<string> => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url'
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].url;
};

const uploadImageToSupabase = async (imageUrl: string, fileName: string): Promise<string> => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Download da imagem
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error('Failed to download generated image');
  }

  const imageBuffer = await imageResponse.arrayBuffer();

  // Upload para o Supabase Storage
  const { data, error } = await supabase.storage
    .from('carousel-images')
    .upload(`ai-generated/${fileName}`, imageBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    throw new Error(`Storage upload error: ${error.message}`);
  }

  // Retornar URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('carousel-images')
    .getPublicUrl(`ai-generated/${fileName}`);

  return publicUrl;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: SlideImageRequest = await req.json();
    const { slides, theme, style, provider } = requestData;

    console.log(`Generating images for ${slides.length} slides with ${provider} provider`);

    const results: GeneratedImage[] = [];

    for (const slide of slides) {
      try {
        const prompt = generatePromptFromContent(slide.content, theme, style, slide.slideNumber);
        console.log(`Generating image for slide ${slide.slideNumber}: ${prompt}`);

        let imageUrl: string;
        let usedProvider: string;

        // Estratégia de provedor
        if (provider === 'auto' || provider === 'openai') {
          try {
            imageUrl = await generateWithOpenAI(prompt);
            usedProvider = 'openai';
          } catch (error) {
            console.log(`OpenAI failed for slide ${slide.slideNumber}, trying Gemini: ${error.message}`);
            imageUrl = await generateWithGemini(prompt);
            usedProvider = 'gemini';
          }
        } else {
          try {
            imageUrl = await generateWithGemini(prompt);
            usedProvider = 'gemini';
          } catch (error) {
            console.log(`Gemini failed for slide ${slide.slideNumber}, trying OpenAI: ${error.message}`);
            imageUrl = await generateWithOpenAI(prompt);
            usedProvider = 'openai';
          }
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

        console.log(`Successfully generated image for slide ${slide.slideNumber} using ${usedProvider}`);

      } catch (error) {
        console.error(`Failed to generate image for slide ${slide.slideNumber}:`, error);
        // Continue com os outros slides mesmo se um falhar
      }
    }

    return new Response(JSON.stringify({
      success: true,
      generatedImages: results,
      message: `Successfully generated ${results.length} out of ${slides.length} images`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-slide-images function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});