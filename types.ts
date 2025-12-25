export enum AppMode {
  HOME = 'HOME',
  CHAT = 'CHAT',
  LIVE_VOICE = 'LIVE_VOICE'
}

export enum ChatScenario {
  NEGOTIATION_SIM = 'Sales & Negotiation Sim',
  MARKET_INTEL = 'Market Intelligence (Search)',
  FIELD_LOGISTICS = 'Client Visit Planning (Maps)',
  LEADERSHIP_COACH = 'Executive Leadership Coach',
  CUSTOM = 'Custom Persona Simulation'
}

export interface CustomScenarioConfig {
  role: string;
  objective: string;
  focus: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  systemInstruction: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
  groundingMetadata?: {
    searchChunks?: Array<{
      web: { uri: string; title: string };
    }>;
    mapChunks?: Array<{
      source: { uri: string };
    }>;
  };
}

export interface AudioConfig {
  sampleRate: number;
  numChannels: number;
}