import { GoogleGenAI, Type, Content, Part } from "@google/genai";
import { FinancialPerformanceData, ChatMessage } from "../types";

const performanceDashboardSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    subtitle: { type: Type.STRING },
    asOfDate: { type: Type.STRING },
    keyMetrics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          metric: { type: Type.STRING },
          percentageChange: { type: Type.NUMBER },
          currentValue: { type: Type.NUMBER },
          previousValue: { type: Type.NUMBER },
          previousPeriod: { type: Type.STRING },
          currentPeriod: { type: Type.STRING },
        },
        required: ["metric", "percentageChange", "currentValue", "previousValue", "previousPeriod", "currentPeriod"]
      }
    },
    quality: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          factor: { type: Type.STRING },
          rating: { type: Type.NUMBER },
        },
        required: ["factor", "rating"]
      }
    },
    financials: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          metric: { type: Type.STRING },
          percentageChange: { type: Type.NUMBER },
          currentValue: { type: Type.NUMBER },
          previousValue: { type: Type.NUMBER },
          previousPeriod: { type: Type.STRING },
          currentPeriod: { type: Type.STRING },
        },
        required: ["metric", "percentageChange", "currentValue", "previousValue", "previousPeriod", "currentPeriod"]
      }
    },
    financialRatios: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          metric: { type: Type.STRING },
          value: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["metric", "value", "description"]
      }
    },
    pros: { type: Type.ARRAY, items: { type: Type.STRING } },
    cons: { type: Type.ARRAY, items: { type: Type.STRING } },
    valuation: {
      type: Type.OBJECT,
      properties: {
        fcfScenario1: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.STRING } } } },
        fcfScenario2: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.STRING } } } },
        achievability: { type: Type.STRING },
        fairValue: { type: Type.STRING },
        undervaluationPercent: { type: Type.NUMBER },
      },
      required: ["achievability", "fairValue", "undervaluationPercent"]
    },
    dcfAnalysis: {
      type: Type.OBJECT,
      properties: {
        currentEarnings: { type: Type.STRING },
        shortTermGrowth: { type: Type.STRING },
        longTermGrowth: { type: Type.STRING },
        discountRate: { type: Type.STRING },
        terminalMultiple: { type: Type.STRING },
        timePeriod: { type: Type.STRING },
        intrinsicValue: { type: Type.STRING },
        simpleValuation: { type: Type.STRING }
      },
      required: ["currentEarnings", "shortTermGrowth", "longTermGrowth", "discountRate", "terminalMultiple", "timePeriod", "intrinsicValue", "simpleValuation"]
    },
    valuationRatios: {
      type: Type.OBJECT,
      properties: {
        dividendYield: { type: Type.STRING, description: "Annual Dividend / Share Price" },
        eps: { type: Type.STRING, description: "(Net Income - Pref. Dividends) / Shares Outstanding" },
        peRatio: { type: Type.STRING, description: "Share Price / EPS" }
      },
      required: ["dividendYield", "eps", "peRatio"]
    },
    summary: { type: Type.STRING },
  },
  required: ["title", "subtitle", "asOfDate", "keyMetrics", "quality", "financials", "financialRatios", "pros", "cons", "valuation", "dcfAnalysis", "valuationRatios", "summary"],
};

export const generatePerformanceData = async (input: string | Part): Promise<FinancialPerformanceData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const textPart: Part = {
    text: `
      You are a world-class financial analyst. Analyze the provided financial document and generate a structured Analyst Report.
      
      Calculations Required:
      1. Dividend Yield: Annual Dividend per Share / Current Share Price.
      2. Earnings Per Share (EPS): (Net Income - Preferred Dividends) / Average Outstanding Shares.
      3. Price-Earnings (P/E) Ratio: Market Price per Share / Earnings per Share.
      
      Extract or estimate these values with high precision. If values are missing, use industry averages for that sector and denote appropriately.
    `
  };

  const inputPart: Part = typeof input === 'string' ? { text: `Financial Data Context:\n---\n${input}\n---` } : input;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [textPart, inputPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: performanceDashboardSchema,
      },
    });

    return JSON.parse(response.text) as FinancialPerformanceData;
  } catch (error) {
    console.error("Analysis error:", error);
    throw new Error("Failed to generate analyst report.");
  }
};

export const generateChatResponse = async (
    dashboardData: any | null,
    history: ChatMessage[],
    newMessage: string
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let systemInstruction = `You are 'Marve', a professional financial analyst.`;

    if (dashboardData) {
        systemInstruction += ` You are currently discussing this report: ${JSON.stringify(dashboardData)}. Answer based on these facts.`;
    }

    const contents: Content[] = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: newMessage }] });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                tools: [{googleSearch: {}}],
            },
        });
        return response.text || "No response generated.";
    } catch (error) {
        throw new Error("Chat error.");
    }
};