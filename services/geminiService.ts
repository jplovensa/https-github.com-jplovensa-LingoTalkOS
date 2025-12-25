import { GoogleGenAI } from "@google/genai";
import { Message, ChatScenario, CustomScenarioConfig } from "../types";
import { MODEL_TEXT_FAST, MODEL_TEXT_SMART, GEMINI_API_KEY } from "../constants";

let genAI: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return genAI;
};

export const sendMessageWithTools = async (
  history: Message[],
  newMessage: string,
  scenario: ChatScenario,
  userLocation?: { lat: number; lng: number },
  customConfig?: CustomScenarioConfig
): Promise<Message> => {
  const ai = getAIClient();
  
  // Decide model and tools based on corporate scenario
  let model = MODEL_TEXT_FAST; // Default to flash for speed
  const tools: any[] = [];
  let toolConfig: any = undefined;
  let systemInstruction = "You are LingoTalk Workforce, an intelligent corporate assistant.";

  switch (scenario) {
    case ChatScenario.MARKET_INTEL:
        // Search Grounding for real-time market data
        tools.push({ googleSearch: {} });
        systemInstruction = "You are a Market Intelligence Analyst. Use Google Search to provide up-to-date competitor analysis, industry trends, and news. Always cite your sources.";
        break;

    case ChatScenario.FIELD_LOGISTICS:
        // Maps Grounding for client visits
        tools.push({ googleMaps: {} });
        systemInstruction = "You are a Field Operations Manager. Help the user plan client visits, optimize routes, and find locations for business meetings. Use Google Maps to provide concrete locations.";
        if (userLocation) {
            toolConfig = {
                retrievalConfig: {
                    latLng: {
                        latitude: userLocation.lat,
                        longitude: userLocation.lng
                    }
                }
            };
        }
        break;

    case ChatScenario.LEADERSHIP_COACH:
        // Pro model for complex reasoning/soft skills
        model = MODEL_TEXT_SMART;
        systemInstruction = "You are an Executive Leadership Coach. Help the user refine their management style, handle difficult personnel situations, and improve emotional intelligence. Be insightful, professional, and constructive.";
        break;

    case ChatScenario.NEGOTIATION_SIM:
        // Sales simulation
        model = MODEL_TEXT_FAST;
        systemInstruction = "You are a Sales Trainer. Critique the user's pitch scripts, suggest negotiation tactics, and help them prepare for high-stakes objections.";
        break;
    
    case ChatScenario.CUSTOM:
        if (customConfig) {
            systemInstruction = customConfig.systemInstruction;
            // Use smarter model for custom personas to ensure adherence to traits
            model = MODEL_TEXT_SMART; 
        }
        break;
        
    default:
        systemInstruction = "You are a helpful corporate assistant.";
        break;
  }

  // Construct history
  let contentsPayload: any = {
      model: model,
      contents: [
          ...history.map(m => ({
              role: m.role,
              parts: [{ text: m.text }]
          })),
          {
              role: 'user',
              parts: [{ text: newMessage }]
          }
      ]
  };

  const config: any = {
      systemInstruction: systemInstruction
  };

  if (tools.length > 0) {
      config.tools = tools;
  }
  if (toolConfig) {
      config.toolConfig = toolConfig;
  }

  try {
    const response = await ai.models.generateContent({
        ...contentsPayload,
        config
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    
    // Extract search chunks
    const searchChunks = groundingMetadata?.groundingChunks?.filter((c: any) => c.web)?.map((c: any) => c.web);
    // Extract map chunks
    const mapChunks = groundingMetadata?.groundingChunks?.filter((c: any) => c.web?.uri?.includes('google.com/maps') || (c as any).maps);

    return {
      id: Date.now().toString(),
      role: 'model',
      text: response.text || "I processed that information.",
      timestamp: Date.now(),
      groundingMetadata: {
          searchChunks: searchChunks as any,
          mapChunks: mapChunks as any
      }
    };

  } catch (error) {
    console.error("Gemini API Error", error);
    return {
        id: Date.now().toString(),
        role: 'model',
        text: "System Error: Unable to connect to Corporate Intelligence Grid.",
        timestamp: Date.now(),
        isError: true
    };
  }
};