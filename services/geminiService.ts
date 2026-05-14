
import type { GoogleGenAI as GoogleGenAIType } from "@google/genai";
import { AIConfig } from "../types";

// 注意：@google/genai 体积约 253KB，改为动态 import，只在调用 AI 时下载
let defaultGenAI: GoogleGenAIType | null = null;
let GoogleGenAICtor: typeof GoogleGenAIType | null = null;

async function loadGenAI(): Promise<typeof GoogleGenAIType> {
  if (!GoogleGenAICtor) {
    const mod = await import('@google/genai');
    GoogleGenAICtor = mod.GoogleGenAI;
  }
  return GoogleGenAICtor;
}

export const generateTimeReflection = async (
  timeString: string,
  themeLabel: string,
  config?: AIConfig
): Promise<string> => {

  const prompt = `
    You are a poetic clock screensaver assistant.
    The current time is ${timeString}.
    The visual theme is "${themeLabel}".
    Write a short, artistic, and abstract reflection on this specific time of day.
    Strictly follow this output format:
    Line 1: English sentence (max 15 words)
    Line 2: Chinese translation
    Do not use quotes. Do not add labels like "English:" or "Chinese:".
  `;

  // 1. Handle Custom / OpenAI Compatible / ModelScope
  if (config && config.provider !== 'gemini') {
    if (!config.apiKey) return "Please enter your API Key in settings.\n请在设置中输入API密钥。";

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      // Ensure baseUrl ends without a slash for consistency if user forgot, but standard is handling both
      const baseUrl = config.baseUrl.replace(/\/$/, '');
      const url = `${baseUrl}/chat/completions`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model || 'qwen-turbo',
          messages: [
            { role: 'system', content: "You are a poetic clock screensaver assistant." },
            { role: 'user', content: prompt }
          ],
          max_tokens: 100,
          temperature: 0.7
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || "Time flows silently.\n岁月静好。";
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Custom AI API Error:", error);
      if (error instanceof Error && error.name === 'AbortError') {
        return "Request timed out. Please try again.\n请求超时，请重试。";
      }
      return "Connection to AI failed.\n连接AI失败。";
    }
  }

  // 2. Handle Google Gemini - 按需动态加载 SDK
  let aiClient = defaultGenAI;
  let modelName = 'gemini-3-flash-preview';

  // If user provided custom Gemini config, override
  if (config && config.provider === 'gemini') {
    if (config.apiKey) {
      try {
        const GenAI = await loadGenAI();
        aiClient = new GenAI({ apiKey: config.apiKey });
      } catch (e) {
        console.error("Invalid Custom Gemini Key", e);
        return "Invalid API Key.\n无效的API密钥。";
      }
    } else if (process.env.API_KEY && !aiClient) {
      // 默认从环境变量初始化（懒加载）
      try {
        const GenAI = await loadGenAI();
        defaultGenAI = new GenAI({ apiKey: process.env.API_KEY });
        aiClient = defaultGenAI;
      } catch (error) {
        console.error("Failed to initialize GoogleGenAI", error);
      }
    }
    if (config.model) {
      modelName = config.model;
    }
  }

  if (!aiClient) {
    return "Time flows like a river, endless and serene.\n时光如川，静水流深。";
  }

  try {
    const response = await aiClient.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    return response.text?.trim() || "Moments fade, memories remain.\n瞬间消逝，记忆永存。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The present moment is all we have.\n活在当下。";
  }
};
