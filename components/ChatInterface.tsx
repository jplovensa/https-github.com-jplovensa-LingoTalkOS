import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatScenario, CustomScenarioConfig } from '../types';
import { sendMessageWithTools } from '../services/geminiService';
import { 
    Target, 
    ChevronRight, 
    Search,
    Map,
    MessageSquare,
    Zap,
    ShieldAlert,
    Activity,
    BarChart3,
    Terminal
} from 'lucide-react';

interface ChatInterfaceProps {
  scenario: ChatScenario;
  customConfig?: CustomScenarioConfig | null;
  onBack: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ scenario, customConfig, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
        id: 'init',
        role: 'model',
        text: `**TACTICAL SIMULATION INITIALIZED.**\nScenario: ${customConfig ? customConfig.role : scenario}\n\nSystem is ready. Awaiting user input to begin training sequence.`,
        timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.log('Geo permission denied or error', err)
        );
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        text: input,
        timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.filter(m => m.id !== 'init');
    const response = await sendMessageWithTools(history, userMsg.text, scenario, userLoc, customConfig || undefined);
    
    setMessages(prev => [...prev, response]);
    setIsLoading(false);
  };

  const getMissionData = () => {
    if (customConfig) {
        return {
            obj: customConfig.objective,
            focus: customConfig.focus,
            diff: customConfig.difficulty,
            color: customConfig.difficulty === 'Expert' ? "text-purple-400" : customConfig.difficulty === 'Advanced' ? "text-red-400" : "text-orange-400"
        };
    }

    switch (scenario) {
        case ChatScenario.NEGOTIATION_SIM:
            return {
                obj: "Secure contract renewal > $50k",
                focus: "Objection Handling",
                diff: "Hard",
                color: "text-red-400"
            };
        case ChatScenario.MARKET_INTEL:
             return {
                obj: "Gather Competitor Pricing Data",
                focus: "Search Synthesis",
                diff: "Medium",
                color: "text-orange-400"
            };
        case ChatScenario.FIELD_LOGISTICS:
             return {
                obj: "Plan Multi-Site Client Visit",
                focus: "Route Optimization",
                diff: "Medium",
                color: "text-emerald-400"
            };
        default:
             return {
                obj: "Executive Leadership Alignment",
                focus: "Emotional Intelligence",
                diff: "Advanced",
                color: "text-purple-400"
            };
    }
  };

  const mission = getMissionData();

  return (
    <div className="flex h-full bg-slate-950 font-sans overflow-hidden">
      
      {/* LEFT: SIMULATION VIEW */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/50 relative">
          {/* Header */}
          <div className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
                 <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white border border-transparent hover:border-slate-700">
                    <ChevronRight className="rotate-180" size={20} />
                 </button>
                 <div>
                     <h2 className="font-bold text-white tracking-tight flex items-center gap-2">
                         <Terminal size={18} className="text-orange-500" />
                         <span className="uppercase tracking-widest text-sm">{customConfig ? customConfig.role : scenario}</span>
                     </h2>
                     <div className="text-[10px] text-orange-500 font-mono flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                        LIVE SIMULATION ENVIRONMENT
                     </div>
                 </div>
             </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide" ref={scrollRef}>
             {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-5 shadow-lg border backdrop-blur-sm ${
                    msg.role === 'user' 
                        ? 'bg-orange-600 text-white border-orange-500 shadow-orange-900/20' 
                        : 'bg-slate-800/80 border-slate-700 text-slate-200'
                    }`}>
                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70 flex items-center gap-2 ${msg.role === 'user' ? 'text-orange-200' : 'text-slate-400'}`}>
                        {msg.role === 'user' ? 'Operator' : 'AI System'}
                        {msg.role === 'model' && <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>}
                    </div>

                    <div className="prose prose-sm prose-invert leading-relaxed whitespace-pre-line text-current">
                        {msg.text}
                    </div>

                    {/* Grounding Chips */}
                    {msg.groundingMetadata && (
                        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                            {msg.groundingMetadata.searchChunks?.map((chunk, idx) => (
                                <a key={idx} href={chunk.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs bg-slate-900/50 hover:bg-slate-800 border border-slate-600 rounded px-3 py-1.5 transition-all text-blue-400 hover:text-blue-300">
                                    <Search className="w-3 h-3" />
                                    <span className="truncate max-w-[150px] font-medium">{chunk.title || 'Source'}</span>
                                </a>
                            ))}
                            {msg.groundingMetadata.mapChunks?.map((chunk, idx) => (
                                <a key={idx} href={chunk.source.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs bg-slate-900/50 hover:bg-slate-800 border border-slate-600 rounded px-3 py-1.5 transition-all text-emerald-400 hover:text-emerald-300">
                                    <Map className="w-3 h-3" />
                                    <span className="font-medium">View Location</span>
                                </a>
                            ))}
                        </div>
                    )}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-150"></span>
                        </div>
                        <span className="text-xs font-bold text-slate-500 font-mono">PROCESSING...</span>
                    </div>
                </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-slate-900 border-t border-slate-800 z-20">
             <div className="relative group">
                 <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                 <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Enter tactical response..."
                    className="relative w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-32 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-all font-medium font-mono"
                 />
                 <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-2 bottom-2 bg-slate-800 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-6 font-bold text-sm transition-all flex items-center gap-2 border border-slate-700 hover:border-orange-500"
                 >
                    TRANSMIT <ChevronRight size={16}/>
                 </button>
             </div>
          </div>
      </div>

      {/* RIGHT: MISSION CONTROL HUD */}
      <div className="w-80 bg-slate-950 border-l border-slate-800 flex flex-col hidden md:flex shrink-0">
         <div className="p-6 border-b border-slate-800">
             <div className="flex items-center gap-2 mb-2">
                 <Target size={16} className="text-orange-500" />
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Mission Objective</span>
             </div>
             <div className="font-bold text-white leading-tight font-mono text-sm border-l-2 border-orange-500 pl-3">
                 {mission.obj}
             </div>
         </div>

         <div className="flex-1 p-6 space-y-6">
             <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                 <div className="flex items-center gap-2 mb-4">
                     <ShieldAlert size={16} className="text-blue-500" />
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Parameters</span>
                 </div>
                 <div className="space-y-4">
                     <div>
                         <div className="flex justify-between text-xs mb-1">
                             <span className="text-slate-500">Focus Area</span>
                             <span className="text-slate-300 font-bold">{mission.focus}</span>
                         </div>
                         <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 w-3/4"></div>
                         </div>
                     </div>
                     <div>
                         <div className="flex justify-between text-xs mb-1">
                             <span className="text-slate-500">Difficulty</span>
                             <span className={`font-bold ${mission.color}`}>{mission.diff}</span>
                         </div>
                         <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                             <div className={`h-full w-full ${mission.diff === 'Hard' || mission.diff === 'Expert' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                         </div>
                     </div>
                 </div>
             </div>

             <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                 <div className="flex items-center gap-2 mb-4">
                     <Activity size={16} className="text-emerald-500" />
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Live Analytics</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                     <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                         <div className="text-[10px] text-slate-500 uppercase">Confidence</div>
                         <div className="text-lg font-bold text-emerald-400">94%</div>
                     </div>
                     <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                         <div className="text-[10px] text-slate-500 uppercase">Pacing</div>
                         <div className="text-lg font-bold text-white">Optimal</div>
                     </div>
                 </div>
             </div>

             <div className="bg-orange-950/20 rounded-xl p-4 border border-orange-500/20">
                 <div className="flex items-center gap-2 mb-2">
                     <Zap size={16} className="text-orange-500" />
                     <span className="text-xs font-bold text-orange-500 uppercase tracking-widest font-mono">AI Coach Tip</span>
                 </div>
                 <p className="text-xs text-slate-400 leading-relaxed font-mono">
                     > Analysis indicates user tone is steady. <br/>
                     > Suggest using open-ended questions to probe for client constraints.
                 </p>
             </div>
         </div>
      </div>
    </div>
  );
};