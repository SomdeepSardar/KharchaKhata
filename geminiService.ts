
import { GoogleGenAI, Type } from "@google/genai";
import { Expense, Category } from "./types";

const CATEGORIES: Category[] = [
  'Food & Dining', 'Transport', 'Housing', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Income', 'Other'
];

export async function parseReceipt(base64Image: string): Promise<Partial<Expense>> {
  // Fix: Initializing GoogleGenAI using process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1] || base64Image
          }
        },
        {
          text: `Extract expense details from this receipt. Return JSON with 'amount' (number), 'merchant' (string), 'date' (YYYY-MM-DD), and 'category' (one of: ${CATEGORIES.join(', ')}). If unknown, use 'Other'.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          amount: { type: Type.NUMBER },
          merchant: { type: Type.STRING },
          date: { type: Type.STRING },
          category: { type: Type.STRING }
        },
        required: ["amount", "merchant", "date", "category"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse receipt JSON", e);
    return {};
  }
}

export async function getSpendingInsights(expenses: Expense[]): Promise<string> {
  // Fix: Initializing GoogleGenAI using process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  const expenseSummary = expenses.map(e => `${e.date}: ${e.merchant} - ${e.amount} (${e.category})`).join('\n');
  
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze these expenses and provide 3 concise, actionable financial insights. Format as Markdown bullets.\n\nExpenses:\n${expenseSummary}`,
    config: {
      systemInstruction: "You are a professional financial advisor. Be encouraging but direct."
    }
  });

  return response.text || "No insights available at the moment.";
}

export async function generateAppIcon(): Promise<string | null> {
  // Fix: Initializing GoogleGenAI using process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash-image';
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          text: 'A modern, high-tech fintech mobile app icon for "KharchaKhata". Minimalist geometric design, blue and silver palette, sleek 3D glassmorphism effect, premium look, white background.',
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
