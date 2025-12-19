
import { GoogleGenAI, Type } from "@google/genai";
import { Expense, Category } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CATEGORIES: Category[] = [
  'Food & Dining', 'Transport', 'Housing', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Income', 'Other'
];

export async function parseReceipt(base64Image: string): Promise<Partial<Expense>> {
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
  const model = "gemini-3-flash-preview";
  const expenseSummary = expenses.map(e => `${e.date}: ${e.merchant} - ₹${e.amount} (${e.category})`).join('\n');
  
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze these expenses (amounts in Indian Rupees ₹) and provide 3 concise, actionable financial insights or tips to save money in the Indian context. Format as Markdown bullets.\n\nExpenses:\n${expenseSummary}`,
    config: {
      systemInstruction: "You are a professional financial advisor specializing in Indian personal finance. Be encouraging but direct."
    }
  });

  return response.text || "No insights available at the moment.";
}
