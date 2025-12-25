import React from 'react';
import { ChatScenario } from '../types';
import { ArrowRight, Clock, Trophy, Play } from 'lucide-react';

interface ScenarioCardProps {
  scenario: ChatScenario;
  description: string;
  icon: React.ReactNode;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  image?: string;
  onClick: () => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ 
  scenario, 
  description, 
  icon, 
  difficulty, 
  duration, 
  image,
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col h-80 w-full overflow-hidden rounded-2xl border border-slate-800 shadow-2xl transition-all hover:scale-[1.02] text-left"
    >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
            <img src={image || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1600"} alt="bg" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/40"></div>
        </div>

        <div className="relative z-10 flex h-full flex-col p-6">
            <div className="flex justify-between items-start mb-4">
                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    {icon}
                 </div>
                 <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${
                     difficulty === 'Advanced' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                     difficulty === 'Intermediate' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' :
                     'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                 }`}>
                     {difficulty}
                 </div>
            </div>

            <div className="mt-auto">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors drop-shadow-md">
                    {scenario}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-2 mb-6">
                    {description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-orange-500"/> {duration}</span>
                        <span className="flex items-center gap-1.5"><Trophy size={14} className="text-yellow-500"/> +150 XP</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-lg transition-all shadow-lg shadow-orange-900/20">
                        INITIALIZE <Play size={12} fill="currentColor" />
                    </div>
                </div>
            </div>
        </div>
    </button>
  );
};