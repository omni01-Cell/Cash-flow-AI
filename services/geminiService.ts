import { GoogleGenAI, Type } from "@google/genai";
import { Invoice, DunningDraft } from '../types';

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = 'gemini-2.5-flash';

/**
 * Simulates analyzing invoice text to extract structured data.
 */
export const analyzeInvoiceText = async (text: string): Promise<Partial<Invoice>> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `You are an expert accountant AI. Extract the invoice details from the following text. 
      If data is missing, make a reasonable estimate based on context or leave blank.
      
      Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clientName: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            dueDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
            riskLevel: { type: Type.STRING, enum: ["Faible", "Moyen", "Élevé"] },
          },
          required: ["clientName", "amount", "dueDate", "riskLevel"],
        },
      },
    });

    const json = JSON.parse(response.text || '{}');
    return {
      ...json,
      id: Math.random().toString(36).substr(2, 9),
      status: 'En attente', 
    } as Partial<Invoice>;

  } catch (error) {
    console.error("Error analyzing invoice:", error);
    return {
      id: "err-fallback",
      clientName: "Client Inconnu (Erreur API)",
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      riskLevel: "Faible",
    };
  }
};

/**
 * Generates dunning emails based on invoice details.
 */
export const generateDunningSequence = async (clientName: string, amount: number, lang: 'fr' | 'en' = 'fr'): Promise<DunningDraft[]> => {
  try {
    const prompt = `
      Generate 3 dunning emails (relances) for a debt collection scenario.
      Language: ${lang === 'fr' ? 'French' : 'English'}.
      Client: ${clientName}
      Amount: ${amount} EUR.
      
      Level 1: Polite, empathetic reminder (J+3).
      Level 2: Firm reminder, mentioning Terms & Conditions (J+10).
      Level 3: Formal notice (Mise en demeure), mentioning legal codes (J+20).

      Return strictly valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              level: { type: Type.INTEGER },
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
              tone: { type: Type.STRING },
            },
            required: ["level", "subject", "body", "tone"],
          },
        },
      },
    });

    const drafts = JSON.parse(response.text || '[]');
    return drafts;

  } catch (error) {
    console.error("Error generating emails:", error);
    return [];
  }
};

export const generateAdministrativeLetter = async (type: 'fine' | 'visa' | 'review', context: string, lang: 'fr' | 'en' = 'fr'): Promise<string> => {
  try {
    const promptMap = {
      fine: {
        fr: "Rédige une lettre de contestation formelle pour une amende majorée.",
        en: "Write a formal dispute letter for a fine."
      },
      visa: {
        fr: "Rédige une lettre de motivation pour un visa freelance.",
        en: "Write a cover letter for a freelance visa."
      },
      review: {
        fr: "Rédige une réponse diplomatique à un avis client négatif.",
        en: "Write a diplomatic response to a negative customer review."
      }
    };

    const prompt = `${promptMap[type][lang]}
    Context: "${context}"
    Language: ${lang === 'fr' ? 'French' : 'English'}
    
    Response (Body only):`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Error generating content.";
  } catch (error) {
    return "Service temporarily unavailable.";
  }
};