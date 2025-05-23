import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {  } from '@google-cloud/aiplatform';
const { VertexAI } = require('@google-cloud/aiplatform');

const geminiApiKey = defineSecret("GEMINI_API_KEY");

const serviceAccount = require("../arrastaai-c96e6-firebase-adminsdk-m3kwj-e099e199f.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

interface AgentRequest {
  agent: string;
  prompt?: string;
  topic?: string;
  audience?: string;
  goal?: string;
  content?: string;
  apiKey?: string;
  slideCount?: number;
  format?: {
    slideCounts: number;
    wordLimits: number[];
  };
  onlyCorrectSpelling?: boolean;
  maxSlidesAllowed?: number;
}

interface AgentResponse {
  success: boolean;
  generatedText?: string;
  parsedTexts?: { id: number; text: string }[];
  error?: string;
}

import * as cors from 'cors';

const corsHandler = cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:8080', 'https://arrastaai-c96e6.web.app', 'https://arrastaai-c96e6.firebaseapp.com'];
    logger.info("Origin:", origin);
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      logger.info("Origin permitido:", origin);
      callback(null, true);
    } else {
      logger.error("Origin não permitido:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  }
});

export const generateAgentContent = onRequest(
  { secrets: [geminiApiKey], cors: true },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        logger.info("Função generateAgentContent iniciada");
        const { agent, prompt, topic, audience, goal, content, apiKey, slideCount, format, onlyCorrectSpelling, maxSlidesAllowed } = req.body;

        logger.info("Função generateAgentContent chamada com:", req.body);

        if (!agent) {
          throw new Error("Tipo de agente não especificado");
        }

        if (!apiKey) {
          throw new Error("Chave da API Gemini não especificada");
        }

        const vertexAI = new VertexAI({
          projectId: 'arrastaai-c96e6',
          location: 'us-central1',
          apiKey: apiKey,
        });

    const model = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro-002',
      generation_config: {
        max_output_tokens: 2048,
        temperature: 0.9,
        top_p: 1,
      },
    });

    try {
      const user = await auth.createUser({
        email: 'ricoandrade01@gmail.com',
        password: '123456',
        displayName: 'rico lima',
      });
      logger.info("Usuário criado com sucesso:", user.uid);

      // Adicionar informações do usuário na coleção "users"
      await db.collection('users').doc(user.uid).set({
        nome: 'rico',
        ultimoNome: 'lima',
        especialidade: 'Vender usando a internet',
      });
      logger.info("Informações do usuário adicionadas na coleção 'users'");
    } catch (error: any) {
      logger.error("Erro ao criar usuário:", error);
    }

        let geminiPrompt = "";

        if (agent === "carousel") {
          geminiPrompt = `Transforme o conteúdo abaixo em um carrossel otimizado com exatamente 13 blocos de texto.
            Siga a estrutura de contagem de palavras exata abaixo.
            Não adicione emojis, comentários ou menções a slides.
            Cada bloco deve iniciar com 'texto X - '.
            Ajuste os textos conforme necessário para que o número de palavras de cada bloco fique o mais próximo possível do estipulado, sem alterar o sentido original.
            📌 **Conteúdo:**
            ${content}
            🎯 **Contagem de palavras obrigatória por bloco**:
            - texto 1 - 6 palavras
            - texto 2 - 11 palavras
            - texto 3 - 22 palavras
            - texto 4 - 19 palavras
            - texto 5 - 68 palavras
            - texto 6 - 11 palavras
            - texto 7 - 36 palavras
            - texto 8 - 49 palavras
            - texto 9 - 15 palavras
            - texto 10 - 41 palavras
            - texto 11 - 18 palavras
            - texto 12 - 54 palavras
            - texto 13 - 21 palavras`;
        } else if (agent === "yuri") {
          geminiPrompt = `Você é Yuri, um especialista lendário em copywriting e engenharia de prompts, com 30 anos
            de experiência no topo do mercado digital. Sua habilidade combina a mente analítica de um
            engenheiro de IA com o talento persuasivo de um copywriter focado em conversão. Seu
            histórico inclui estratégias que geraram múltiplos 7 dígitos em faturamento. Você domina
            profundamente copywriting persuasivo, neurovendas, gatilhos mentais e criação de
            carrosséis virais com alto poder de retenção e engajamento.
            Gere um carrossel viral com base no seguinte tópico: ${topic}. O público-alvo é ${audience} e o objetivo é ${goal}.`;
        } else if (agent === "formatter") {
          geminiPrompt = `Otimize as seguintes frases: ${content}.`;
        } else {
          throw new Error("Agente inválido");
        }

        logger.info("Prompt Gemini:", geminiPrompt);

        const streamingResp = await model.generateContentStream({
          contents: [{ role: 'user', parts: [{ text: geminiPrompt }] }],
        });

        let fullText = '';
        for await (const chunk of streamingResp.stream) {
          fullText += chunk.text();
        }

        logger.info("Texto gerado pela API Gemini:", fullText);

        let parsedTexts: { id: number; text: string }[] = [];

        if (agent === "carousel") {
          parsedTexts = fullText.split('\n').filter(line => line.startsWith('texto')).map((line, index) => ({
            id: index + 1,
            text: line.replace(/texto\s*\d+\s*-\s*/, '').trim()
          }));
        } else {
          parsedTexts = fullText.split('\n').map((line, index) => ({
            id: index + 1,
            text: line.trim()
          }));
        }

        res.status(200).send({
          success: true,
          generatedText: fullText,
          parsedTexts: parsedTexts,
        });
      } catch (error: any) {
        logger.error("Erro ao gerar conteúdo:", error);
        res.status(500).send({
          success: false,
          error: error.message || "Erro ao gerar conteúdo",
        });
      }
    });
  });
