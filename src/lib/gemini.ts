import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askGeminiYesNo(prompt: string): Promise<"YES" | "NO"> {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt + "\n\nAnswer strictly with only YES or NO.",
    config: {
      temperature: 0.1,
    }
  });

  const text = (response.text || "").trim().toUpperCase();
  if (text.includes("YES")) return "YES";
  return "NO";
}
