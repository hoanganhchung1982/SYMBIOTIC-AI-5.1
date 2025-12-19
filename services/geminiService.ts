import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
// Nhảy ra ngoài để tìm types.ts theo ảnh image_4b2c3e.png
import { AIResponse } from "../types";

const genAI = new GoogleGenerativeAI("AIZA..."); // Dán API Key chuẩn của bạn vào đây

export const generateStudyContent = async (subject: string, prompt: string, imageBase64?: string): Promise<AIResponse> => {
  // Sử dụng v1beta để hỗ trợ JSON Schema
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
  }, { apiVersion: 'v1beta' });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        speed: {
          type: SchemaType.OBJECT,
          properties: {
            answer: { type: SchemaType.STRING },
            similar: {
              type: SchemaType.OBJECT,
              properties: {
                question: { type: SchemaType.STRING },
                options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                correctIndex: { type: SchemaType.NUMBER },
              },
              required: ["question", "options", "correctIndex"],
            },
          },
          required: ["answer", "similar"],
        },
        mermaid: { type: SchemaType.STRING },
        step: { type: SchemaType.STRING },
        deep: { type: SchemaType.STRING },
        exam: { type: SchemaType.STRING },
      },
      required: ["speed", "mermaid", "step", "deep", "exam"],
    },
  };

  const parts: any[] = [{ text: `Môn học: ${subject}. Yêu cầu: ${prompt}` }];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.split(",")[1],
      },
    });
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
  });

  const responseText = result.response.text();
  return JSON.parse(responseText);
};
