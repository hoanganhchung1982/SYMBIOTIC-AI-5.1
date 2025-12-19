// Sửa import từ @google/genai thành @google/generative-ai
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AIResponse } from "../types";

// Vite bắt buộc dùng tiền tố VITE_ để nạp biến từ Vercel
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const generateStudyContent = async (subject: string, prompt: string, image?: string): Promise<AIResponse> => {
  if (!API_KEY) throw new Error("API Key chưa được cấu hình.");

  // 2. Khởi tạo SDK đúng cách
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  // 3. Cấu hình Model với Schema để ép AI trả về JSON chuẩn
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Dùng 1.5-flash để ổn định nhất hiện nay
    generationConfig: {
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
                  correctIndex: { type: SchemaType.NUMBER }
                },
                required: ["question", "options", "correctIndex"]
              }
            },
            required: ["answer", "similar"]
          },
          socratic: { type: SchemaType.STRING },
          notebooklm: { type: SchemaType.STRING },
          perplexity: { type: SchemaType.STRING },
          tools: { type: SchemaType.STRING },
          mermaid: { type: SchemaType.STRING }
        },
        required: ["speed", "socratic", "notebooklm", "perplexity", "tools", "mermaid"]
      }
    }
  });

  const systemInstruction = `Bạn là Symbiotic AI Pro - AI Trợ lý Giáo dục cho học sinh Việt Nam. 
  Phân tích môn ${subject}. TUYỆT ĐỐI KHÔNG dùng dấu sao (*). Trả về JSON theo cấu trúc yêu cầu.`;

  const parts: any[] = [{ text: prompt }];
  if (image) {
    const base64Data = image.includes(",") ? image.split(",")[1] : image;
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Data
      }
    });
  }

  // 4. Sửa lại cách gọi Content (Sử dụng đúng cấu trúc nội dung)
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      systemInstruction: { role: "system", parts: [{ text: systemInstruction }] }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText) as AIResponse;
  } catch (error) {
    console.error("Lỗi AI hoặc Parse JSON:", error);
    throw new Error("Đã xảy ra lỗi khi kết nối với Symbiotic AI.");
  }
};
