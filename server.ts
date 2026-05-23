import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/api/translate', async (req, res) => {
  try {
    const { text, from, to } = req.body;

    if (!text || !from || !to) {
       res.status(400).json({ error: 'Missing required fields' });
       return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'Gemini API key is not configured' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are an expert translator specializing in Afaan Oromoo and Afaan Somaalii. 
Translate the following text strictly from ${from} to ${to}.
Rules:
1. Provide ONLY the translated text, nothing else. 
2. Do not include any explanations.
3. Do not wrap the text in quotes or markdown blocks.
4. Ensure the grammar and spelling are accurate for the target language.

Text to translate:
${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    const translatedText = response.text;
    res.json({ translatedText: translatedText?.trim() });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Failed to translate' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
