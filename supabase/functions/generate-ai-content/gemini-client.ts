
import { getPromptForAgent } from './prompts.ts';

export async function tryGenerateWithKey(apiKey: string, requestData: any, agent: string): Promise<any> {
  const targetSlideCount = 9;
  
  console.log(`[${agent.toUpperCase()}] Iniciando geração com chave especializada: ${apiKey ? apiKey.substring(0, 10) + "..." : "não fornecida"}`);

  if (!apiKey) {
    throw new Error("Chave da API não fornecida");
  }

  // Get specialized prompts for agent
  const { systemPrompt, userPrompt } = getPromptForAgent(agent, requestData, targetSlideCount);
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  console.log(`[${agent.toUpperCase()}] Enviando prompt especializado para Gemini 2.0`);

  // Call Gemini 2.0 API with the new model
  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`;
  
  const response = await fetch(geminiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: fullPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: agent === 'carousel' ? 0.8 : agent === 'yuri' ? 0.4 : 0.6,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[${agent.toUpperCase()}] Erro na API Gemini:`, errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`[${agent.toUpperCase()}] Resposta especializada recebida com sucesso`);
  
  if (data.error) {
    console.error(`[${agent.toUpperCase()}] API Gemini retornou erro:`, data.error);
    throw new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  return data;
}
