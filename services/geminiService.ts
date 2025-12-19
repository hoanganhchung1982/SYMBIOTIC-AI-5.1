import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
// SỬA ĐƯỜNG DẪN: Nhảy ra ngoài thư mục services để tìm types.ts
import { AIResponse } from "../types";

const genAI = new GoogleGenerativeAI("AIZA..."); // Thay API Key của bạn vào đây

export const generateStudyContent = async (subject: string, prompt: string, imageBase64?: string): Promise<AIResponse> => {
  // BẮT BUỘC dùng apiVersion: 'v1beta' để hỗ trợ responseSchema
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
  }, { apiVersion: 'v1beta' });

  const generationConfig = {
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

  const contents = [];
  if (imageBase64) {
    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.split(",")[1],
      },
    });
  }
  contents.push({ text: `Môn học: ${subject}. Yêu cầu: ${prompt}` });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: contents }],
    generationConfig,
  });

  return JSON.parse(result.response.text());
};
