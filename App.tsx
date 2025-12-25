import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Target, 
  Building2, 
  Search, 
  Bell, 
  MoreHorizontal, 
  MapPin, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  X, 
  Mic, 
  DollarSign, 
  Map, 
  Globe,
  TrendingUp,
  AlertCircle, 
  BarChart,
  Award,
  BookOpen,
  ArrowUpRight,
  Briefcase,
  ChevronRight,
  ChevronDown,
  CreditCard,
  PieChart,
  UserCheck,
  RefreshCw,
  List,
  Clock,
  MessageSquare,
  Zap,
  Calendar,
  BarChart3,
  TrendingDown,
  Activity,
  ArrowRight,
  LogOut,
  Fingerprint,
  ScanFace,
  Lock,
  FileText,
  ChevronLeft,
  Terminal,
  Power,
  User,
  Mail,
  Phone,
  Camera,
  Edit2,
  Save,
  Plus,
  Cpu
} from 'lucide-react';
import { ChatScenario, CustomScenarioConfig } from './types';
import { ScenarioCard } from './components/ScenarioCard';
import { ChatInterface } from './components/ChatInterface';
import { VoiceInterface } from './components/VoiceInterface';
import { GEMINI_API_KEY } from './constants';

// --- SHARED DATA ---
const EMPLOYEES = [
    { id: 1, name: "Sarah Jenkins", role: "Senior Sales Lead", location: "Jakarta, ID", department: "Sales", skillScore: 88, risk: "Low", skills: [{name: 'Negotiation', level: 92}, {name: 'Leadership', level: 85}, {name: 'Technical', level: 60}, {name: 'Strategy', level: 78}, {name: 'Analytics', level: 65}], learningHours: 120, badges: 8, email: "sarah.j@lingotalk.co", joined: "2021" },
    { id: 2, name: "Michael Chen", role: "Logistics Manager", location: "Ho Chi Minh, VN", department: "Operations", skillScore: 72, risk: "Medium", skills: [{name: 'Logistics', level: 88}, {name: 'Planning', level: 70}, {name: 'Communication', level: 65}, {name: 'Efficiency', level: 82}, {name: 'Budgeting', level: 75}], learningHours: 45, badges: 3, email: "m.chen@lingotalk.co", joined: "2022" },
    { id: 3, name: "Amara Singh", role: "Product Designer", location: "Bangkok, TH", department: "Product", skillScore: 95, risk: "Low", skills: [{name: 'UI/UX', level: 98}, {name: 'Research', level: 90}, {name: 'Prototyping', level: 95}, {name: 'Strategy', level: 80}, {name: 'Coding', level: 45}], learningHours: 210, badges: 12, email: "amara.s@lingotalk.co", joined: "2020" },
    { id: 4, name: "David Wu", role: "Junior Developer", location: "Jakarta, ID", department: "Engineering", skillScore: 65, risk: "High", skills: [{name: 'React', level: 70}, {name: 'Backend', level: 50}, {name: 'DevOps', level: 40}, {name: 'Algorithms', level: 60}, {name: 'Testing', level: 55}], learningHours: 10, badges: 1, email: "d.wu@lingotalk.co", joined: "2023" },
    { id: 5, name: "Elena Rodriguez", role: "HR Specialist", location: "Remote", department: "HR", skillScore: 82, risk: "Low", skills: [{name: 'Recruiting', level: 90}, {name: 'Compliance', level: 85}, {name: 'Empathy', level: 80}, {name: 'Conflict Res', level: 88}, {name: 'Admin', level: 92}], learningHours: 85, badges: 5, email: "elena.r@lingotalk.co", joined: "2019" },
    { id: 6, name: "Kenji Sato", role: "VP of Engineering", location: "Singapore", department: "Engineering", skillScore: 96, risk: "Low", skills: [{name: 'System Arch', level: 98}, {name: 'Leadership', level: 95}, {name: 'AI Strategy', level: 90}, {name: 'Public Speaking', level: 85}, {name: 'Finance', level: 70}], learningHours: 300, badges: 15, email: "kenji@lingotalk.co", joined: "2018" },
];

const NOTIFICATIONS = [
    { id: 1, type: 'alert', title: "Attrition Risk Detected", message: "Engineering Team (Vietnam) shows signs of low engagement.", time: "10 min ago", read: false },
    { id: 2, type: 'success', title: "Training Goal Met", message: "Global Sales has reached 85% completion on Module B-12.", time: "2 hours ago", read: false },
    { id: 3, type: 'info', title: "New Module Available", message: "'AI Ethics for Managers' is now live in the Dojo.", time: "4 hours ago", read: true },
    { id: 4, type: 'system', title: "System Maintenance", message: "Scheduled maintenance tonight at 02:00 UTC.", time: "Yesterday", read: true },
    { id: 5, type: 'info', title: "Quarterly Review", message: "Performance review cycle starts next Monday.", time: "Yesterday", read: true },
];

const AVAILABLE_COURSES = [
    { id: 'c1', title: 'Advanced Negotiation Tactics', duration: '4h 30m', level: 'Advanced' },
    { id: 'c2', title: 'Crisis Leadership', duration: '2h 15m', level: 'Intermediate' },
    { id: 'c3', title: 'Data-Driven Decision Making', duration: '5h 00m', level: 'Advanced' },
    { id: 'c4', title: 'Cross-Cultural Communication', duration: '3h 45m', level: 'Beginner' },
];

const ORG_TREE = {
    name: "CEO",
    role: "Chief Executive Officer",
    type: "root",
    children: [
        {
            name: "VP Sales",
            role: "Global Sales",
            type: "dept",
            children: [
                { name: "Regional Lead (ID)", role: "Sales", type: "lead" },
                { name: "Regional Lead (VN)", role: "Sales", type: "lead" }
            ]
        },
        {
            name: "VP Engineering",
            role: "Technology",
            type: "dept",
            children: [
                { name: "Frontend Lead", role: "Eng", type: "lead" },
                { name: "Backend Lead", role: "Eng", type: "lead" },
                { name: "AI Research", role: "R&D", type: "lead" }
            ]
        },
        {
            name: "Head of Product",
            role: "Product",
            type: "dept",
            children: [
                { name: "Design Lead", role: "Design", type: "lead" }
            ]
        }
    ]
};

const callAI = async (prompt: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Analysis unavailable at this moment.";
  } catch (error) {
    console.error("AI API Error:", error);
    return "Demo Mode: AI Analysis requires a valid API key.";
  }
};

const SidebarItem = ({ icon: Icon, label, id, activeTab, setActiveTab }: any) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-6 py-4 transition-all duration-200 border-l-4 group ${
        isActive 
          ? 'bg-orange-50 border-orange-500 text-orange-700' 
          : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      <Icon size={20} className={`transition-colors ${isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
      <span className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>{label}</span>
    </button>
  );
};

const MetricCard = ({ title, value, subtext, trend, trendUp, icon: Icon }: any) => (
  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{title}</h3>
      {Icon && <Icon size={16} className="text-slate-400 group-hover:text-orange-500 transition-colors" />}
    </div>
    <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
    <div className="flex items-center justify-between">
         <p className="text-xs text-slate-400">{subtext}</p>
         {trend && (
            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trendUp ? <ArrowUpRight size={12} className="mr-1"/> : <TrendingUp size={12} className="mr-1 rotate-180"/>}
            {trend}
            </span>
        )}
    </div>
  </div>
);

// --- VIEWS ---

const IntroVideo = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(0);
    
    useEffect(() => {
        const steps = [
            { t: 0, s: 1 }, // "The way we work is evolving..."
            { t: 3000, s: 2 }, // "Intelligence is no longer just human..."
            { t: 6000, s: 3 }, // "It is symbiotic"
            { t: 9000, s: 4 }, // "Welcome to LingoTalk OS"
            { t: 13500, s: 5 } // End
        ];

        steps.forEach(({t, s}) => {
            setTimeout(() => {
                if (s === 5) onComplete();
                else setStep(s);
            }, t);
        });
    }, [onComplete]);

    const getTextClass = (isActive: boolean) => `transition-all duration-[1200ms] ease-out absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center transform ${isActive ? 'opacity-100 scale-100 blur-none' : 'opacity-0 scale-95 blur-md pointer-events-none'}`;

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden cursor-pointer" onClick={onComplete}>
            <video 
                src="https://assets.mixkit.co/videos/preview/mixkit-man-touching-virtual-screen-futuristic-concept-3343-large.mp4" 
                autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 animate-in fade-in duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
            
            <div className="relative z-10 w-full max-w-5xl h-64 mx-auto">
                <div className={getTextClass(step === 1)}>
                    <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tighter">The way we work is <span className="text-orange-500">evolving...</span></h1>
                </div>
                <div className={getTextClass(step === 2)}>
                     <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tighter">Intelligence is no longer just <span className="text-blue-500">human...</span></h1>
                </div>
                <div className={getTextClass(step === 3)}>
                     <h1 className="text-5xl md:text-7xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-500 tracking-tighter">It is symbiotic.</h1>
                </div>
                <div className={getTextClass(step === 4)}>
                     <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tighter mb-4 text-center">Welcome to <br/><span className="text-orange-500">LingoTalk OS</span></h1>
                     <div className="inline-block px-4 py-1 border border-orange-500/50 rounded-full text-orange-400 text-sm font-mono animate-pulse">
                         INITIALIZING SYSTEM...
                     </div>
                </div>
            </div>
        </div>
    );
};

const LandingPage = ({ onEnter }: { onEnter: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Video */}
        <video 
            autoPlay 
            loop 
            muted 
            playsInline
            key="earth-bg"
            poster="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
            src="https://assets.mixkit.co/videos/preview/mixkit-digital-earth-rotating-loop-2766-large.mp4" 
            className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-slate-950/50"></div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-1000">
            {/* Logo Mark */}
            <div className="w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br from-orange-900/80 to-slate-900/80 backdrop-blur-xl border border-orange-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.3)]">
                <span className="text-4xl font-black text-orange-500">L</span>
            </div>

            {/* Title */}
            <h1 className="text-center flex flex-col items-center leading-none mb-12">
                <span className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-2">LingoTalk <span className="text-orange-500">Workforce</span></span>
                <span className="text-6xl md:text-8xl font-black text-orange-500 tracking-tighter">OS</span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl text-center text-slate-300 text-lg mb-12 leading-relaxed">
                The intelligent corporate training operating system. Upskill your workforce with AI-driven roleplay, real-time market intelligence, and predictive analytics.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md px-6">
                <button 
                    onClick={onEnter}
                    className="flex-1 bg-white hover:bg-slate-100 text-slate-900 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105"
                >
                    <ScanFace size={20} />
                    Biometric Login <ArrowRight size={18} />
                </button>
                <button className="flex-1 bg-slate-900/50 hover:bg-slate-800/80 backdrop-blur text-white border border-slate-700 py-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all">
                    <FileText size={18} />
                    View Documentation
                </button>
            </div>
        </div>

        {/* Footer Status */}
        <div className="absolute bottom-8 flex gap-8 text-[10px] font-mono text-emerald-500 uppercase tracking-widest opacity-80">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Servers Online</span>
            <span>V2.5.0 Stable</span>
            <span>Gemini Neural Engine</span>
        </div>
    </div>
  );
};

const BiometricAuth = ({ onComplete }: { onComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-slate-950 to-slate-950"></div>
             
             <div className="relative z-10 flex flex-col items-center">
                 <div className="relative w-32 h-32 mb-8">
                     <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full"></div>
                     <div className="absolute inset-0 border-t-4 border-orange-500 rounded-full animate-spin"></div>
                     <div className="absolute inset-4 bg-orange-500/10 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                        <Fingerprint size={48} className="text-orange-500" />
                     </div>
                     
                     {/* Scan Line */}
                     <div className="absolute left-0 right-0 h-1 bg-orange-400/80 blur-sm animate-scan"></div>
                 </div>
                 
                 <h2 className="text-2xl font-bold text-white mb-2 tracking-widest uppercase">Authenticating</h2>
                 <p className="text-orange-500 font-mono text-xs">VERIFYING BIOMETRIC SIGNATURE...</p>
                 
                 <div className="mt-8 flex gap-1">
                     <div className="w-16 h-1 bg-orange-900/50 rounded overflow-hidden">
                         <div className="h-full bg-orange-500 animate-[loading_2s_ease-in-out_infinite]"></div>
                     </div>
                     <div className="w-16 h-1 bg-orange-900/50 rounded overflow-hidden">
                         <div className="h-full bg-orange-500 animate-[loading_2s_ease-in-out_infinite_0.2s]"></div>
                     </div>
                     <div className="w-16 h-1 bg-orange-900/50 rounded overflow-hidden">
                         <div className="h-full bg-orange-500 animate-[loading_2s_ease-in-out_infinite_0.4s]"></div>
                     </div>
                 </div>
             </div>
        </div>
    );
};

const RegionalHeatmap = () => {
    return (
        <div className="relative w-full h-[400px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner group">
             {/* Map Grid Background */}
             <div className="absolute inset-0 opacity-20" 
                  style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(to right, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
             </div>
             
             {/* World Map SVG Abstract */}
             <svg className="absolute inset-0 w-full h-full text-slate-700 opacity-30" fill="currentColor" viewBox="0 0 100 50" preserveAspectRatio="none">
                 <path d="M20,15 Q30,5 50,15 T80,15 T90,30" stroke="currentColor" strokeWidth="0.5" fill="none" />
                 <path d="M10,25 Q40,15 60,35 T90,25" stroke="currentColor" strokeWidth="0.5" fill="none" />
             </svg>

             {/* Nodes */}
             {/* Indonesia (HQ) */}
             <div className="absolute top-[60%] left-[70%] group/node cursor-pointer">
                 <div className="relative">
                     <div className="w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-pulse"></div>
                     <div className="absolute -inset-4 border border-orange-500/30 rounded-full animate-ping"></div>
                 </div>
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur px-3 py-2 rounded-lg border border-orange-500/50 text-center w-32 opacity-0 group-hover/node:opacity-100 transition-opacity z-10">
                     <div className="text-orange-400 text-xs font-bold uppercase">Indonesia (HQ)</div>
                     <div className="text-white text-[10px]">850 Employees</div>
                     <div className="text-emerald-400 text-[10px]">92% Efficiency</div>
                 </div>
             </div>

             {/* Vietnam */}
             <div className="absolute top-[45%] left-[65%] group/node cursor-pointer">
                 <div className="relative">
                     <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
                     <div className="absolute -inset-2 border border-blue-500/30 rounded-full"></div>
                 </div>
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur px-3 py-2 rounded-lg border border-blue-500/50 text-center w-32 opacity-0 group-hover/node:opacity-100 transition-opacity z-10">
                     <div className="text-blue-400 text-xs font-bold uppercase">Vietnam</div>
                     <div className="text-white text-[10px]">240 Employees</div>
                     <div className="text-yellow-400 text-[10px]">Risk: High</div>
                 </div>
             </div>

             {/* Thailand */}
             <div className="absolute top-[50%] left-[60%] group/node cursor-pointer">
                 <div className="relative">
                     <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
                 </div>
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur px-3 py-2 rounded-lg border border-emerald-500/50 text-center w-32 opacity-0 group-hover/node:opacity-100 transition-opacity z-10">
                     <div className="text-emerald-400 text-xs font-bold uppercase">Thailand</div>
                     <div className="text-white text-[10px]">158 Employees</div>
                     <div className="text-emerald-400 text-[10px]">Growing</div>
                 </div>
             </div>

             {/* Connection Lines */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none">
                 <path d="M700,600 L650,450" stroke="#f97316" strokeWidth="1" strokeOpacity="0.3" fill="none" vectorEffect="non-scaling-stroke" />
             </svg>

             <div className="absolute top-4 left-4">
                 <h3 className="text-white font-bold flex items-center gap-2"><Globe size={16} className="text-slate-400"/> Regional Activity</h3>
             </div>
        </div>
    );
};

const SkillRadarChart = ({ skills }: { skills: {name: string, level: number}[] }) => {
    // Simplified Radar Chart visualization using SVG
    const size = 200;
    const center = size / 2;
    const radius = 80;
    const angleStep = (Math.PI * 2) / skills.length;

    const points = skills.map((s, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = (s.level / 100) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    const bgPoints = skills.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="relative flex justify-center items-center py-4">
             <svg width={size} height={size} className="overflow-visible">
                 {/* Grid */}
                 <polygon points={bgPoints} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                 <polygon points={points} fill="rgba(249, 115, 22, 0.2)" stroke="#f97316" strokeWidth="2" />
                 
                 {/* Labels */}
                 {skills.map((s, i) => {
                     const angle = i * angleStep - Math.PI / 2;
                     const labelR = radius + 20;
                     const x = center + labelR * Math.cos(angle);
                     const y = center + labelR * Math.sin(angle);
                     return (
                         <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-slate-500 font-medium uppercase">
                             {s.name}
                         </text>
                     );
                 })}
             </svg>
        </div>
    );
};

const TrendChart = ({ data, labels }: any) => {
    const chartData = data || [65, 80, 75, 90, 85, 95];
    const chartLabels = labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return (
        <div className="h-full flex flex-col justify-center w-full">
            <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><BarChart3 size={16}/> Performance vs Target</h4>
            <div className="flex items-end justify-between flex-1 gap-4 px-2 pb-2 border-b border-slate-200 min-h-[160px]">
                {chartData.map((h: number, i: number) => (
                    <div key={i} className="w-full bg-slate-100 rounded-t-lg relative group h-full">
                        <div 
                            className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-orange-500 to-orange-400 transition-all duration-500 group-hover:from-orange-600 group-hover:to-orange-500" 
                            style={{height: `${h}%`}}
                        ></div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            ${h}k
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2 px-2">
                {chartLabels.map((l: string, i: number) => <span key={i}>{l}</span>)}
            </div>
        </div>
    );
};

// --- MODALS ---

const PersonaGeneratorModal = ({ isOpen, onClose, onLaunch }: any) => {
    const [role, setRole] = useState('Skeptical Client');
    const [trait, setTrait] = useState('Impatience');
    const [situation, setSituation] = useState('Contract Renewal Negotiation');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        // Simulating AI call for demo purposes, or use real one
        setTimeout(() => {
            const config: CustomScenarioConfig = {
                role: role,
                objective: `Navigate ${situation}`,
                focus: `Handling ${trait}`,
                difficulty: 'Advanced',
                systemInstruction: `You are a ${role} who is ${trait}. The user is trying to ${situation}. Be challenging but realistic.`
            };
            setIsGenerating(false);
            onLaunch(config);
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="bg-slate-900 p-6 flex justify-between items-center">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Sparkles size={18} className="text-orange-500" />
                        Generate AI Persona
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-white"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Base Role</label>
                        <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={role} onChange={e => setRole(e.target.value)}>
                            <option>Skeptical Client</option>
                            <option>Demanding Executive</option>
                            <option>Supportive Coach</option>
                            <option>Frustrated Employee</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dominant Trait</label>
                        <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={trait} onChange={e => setTrait(e.target.value)}>
                            <option>Impatience</option>
                            <option>Detail-Obsessed</option>
                            <option>Cost-Conscious</option>
                            <option>Visionary</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Context / Situation</label>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            value={situation}
                            onChange={e => setSituation(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all mt-4"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Cpu size={18} />}
                        {isGenerating ? 'Generating Persona...' : 'Initialize Simulation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SkillPassportModal = ({ employee, onClose }: any) => {
    const [growthPlan, setGrowthPlan] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showTraining, setShowTraining] = useState(false);
    const [assignedCourses, setAssignedCourses] = useState<string[]>([]);

    const handleGeneratePlan = async () => {
        setIsGenerating(true);
        const prompt = `Create a 3-step growth plan for ${employee.name}, a ${employee.role}. 
        Skills: ${employee.skills.map((s:any) => `${s.name} (${s.level}%)`).join(', ')}.
        Keep it concise.`;
        const result = await callAI(prompt);
        setGrowthPlan(result);
        setIsGenerating(false);
    };

    const handleAssign = (courseId: string) => {
        setAssignedCourses([...assignedCourses, courseId]);
    };

    // Identify skills below 80% as gaps
    const lowSkills = employee ? employee.skills.filter((s: any) => s.level < 80) : [];

    if (!employee) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col md:flex-row">
                
                {/* Left: Passport Card */}
                <div className="w-full md:w-1/3 bg-slate-50 p-6 border-r border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-orange-500 to-orange-600"></div>
                    <div className="relative z-10 w-24 h-24 bg-white rounded-full p-1 shadow-lg mb-4 mt-12">
                         <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-400">
                             {employee.name.split(' ').map((n:string) => n[0]).join('')}
                         </div>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">{employee.name}</h2>
                    <p className="text-sm text-slate-500 mb-4">{employee.role}</p>
                    
                    <div className="w-full space-y-3 text-left bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Department</span>
                            <span className="font-semibold text-slate-700">{employee.department}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Location</span>
                            <span className="font-semibold text-slate-700">{employee.location}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Joined</span>
                            <span className="font-semibold text-slate-700">{employee.joined}</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setShowTraining(!showTraining)}
                        className="mt-6 w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <BookOpen size={16} /> Assign Training
                    </button>

                    {/* Verification Badge with Barcode */}
                    <div className="mt-auto w-full pt-6 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Verification</span>
                             <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                 <CheckCircle2 size={10} /> Verified
                             </span>
                        </div>
                        {/* Mock Barcode */}
                        <div className="h-8 bg-slate-100 w-full flex items-end justify-between px-2 pb-1 rounded opacity-70">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="bg-slate-800 h-full" style={{width: Math.random() > 0.5 ? '2px' : '4px', height: Math.random() > 0.5 ? '100%' : '80%'}}></div>
                            ))}
                        </div>
                        <div className="text-[9px] font-mono text-center text-slate-400 mt-1">
                            {Math.random().toString(36).substring(7).toUpperCase()}-{Date.now().toString().slice(-6)}
                        </div>
                    </div>
                </div>

                {/* Right: Skills & AI Plan */}
                <div className="flex-1 p-8 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24}/></button>
                    
                    {showTraining ? (
                        <div className="animate-in slide-in-from-right duration-300 h-full flex flex-col">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Briefcase className="text-orange-500"/> Assign Modules</h3>
                            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                                {AVAILABLE_COURSES.map(course => (
                                    <div key={course.id} className="p-4 border border-slate-200 rounded-xl hover:border-orange-300 transition-all flex justify-between items-center group">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{course.title}</h4>
                                            <div className="flex gap-3 text-xs text-slate-500 mt-1">
                                                <span className="flex items-center gap-1"><Clock size={12}/> {course.duration}</span>
                                                <span className={`px-2 py-0.5 rounded-full ${course.level === 'Advanced' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{course.level}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleAssign(course.id)}
                                            disabled={assignedCourses.includes(course.id)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                                assignedCourses.includes(course.id) 
                                                ? 'bg-emerald-100 text-emerald-600' 
                                                : 'bg-slate-900 text-white group-hover:bg-orange-500'
                                            }`}
                                        >
                                            {assignedCourses.includes(course.id) ? 'Assigned' : 'Select'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setShowTraining(false)} className="mt-4 text-sm text-slate-500 hover:text-slate-800 underline">Back to Profile</button>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Target className="text-orange-500"/> Skill Matrix</h3>
                            <SkillRadarChart skills={employee.skills} />
                            
                            {/* Skill Gaps Section */}
                            {lowSkills.length > 0 && (
                                <div className="mb-6 bg-orange-50 rounded-xl p-4 border border-orange-100">
                                    <h4 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2">
                                        <AlertCircle size={16}/> Skill Gaps Detected
                                    </h4>
                                    <div className="space-y-2">
                                        {lowSkills.map((s: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg border border-orange-200/50">
                                                 <div className="flex items-center gap-2">
                                                     <span className="text-xs font-bold text-slate-700">{s.name}</span>
                                                     <span className="text-xs text-orange-600 font-medium">({s.level}%)</span>
                                                 </div>
                                                 <button 
                                                    onClick={() => setShowTraining(true)}
                                                    className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors"
                                                 >
                                                    Assign Training
                                                 </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2"><Sparkles className="text-purple-500"/> AI Growth Plan</h3>
                                    {!growthPlan && (
                                        <button onClick={handleGeneratePlan} disabled={isGenerating} className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition-colors font-medium">
                                            {isGenerating ? 'Analyzing...' : 'Generate Plan'}
                                        </button>
                                    )}
                                </div>
                                
                                {growthPlan ? (
                                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-sm text-slate-700 leading-relaxed whitespace-pre-line animate-in fade-in">
                                        {growthPlan}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
                                        Click 'Generate Plan' to create a personalized upskilling path.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const DepartmentAnalyticsModal = ({ dept, onClose }: any) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [insight, setInsight] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateInsight = async () => {
        setIsLoading(true);
        const prompt = `Provide a strategic SWOT analysis for a corporate ${dept.name} department. Keep it to 3 bullet points.`;
        const res = await callAI(prompt);
        setInsight(res);
        setIsLoading(false);
    };

    if (!dept) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">
                            {dept.name[0]}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{dept.name}</h2>
                            <p className="text-sm text-slate-500">{dept.role}</p>
                        </div>
                    </div>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600"/></button>
                </div>

                <div className="flex border-b border-slate-100">
                    {['overview', 'trends', 'ai-insight'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                        </button>
                    ))}
                </div>

                <div className="p-6 h-80 overflow-y-auto">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Total Headcount</h4>
                                <p className="text-2xl font-bold text-slate-800">124</p>
                                <p className="text-xs text-emerald-600 flex items-center gap-1"><ArrowUpRight size={12}/> +4 this month</p>
                            </div>
                            <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Budget Utilization</h4>
                                <p className="text-2xl font-bold text-slate-800">88%</p>
                                <p className="text-xs text-slate-400">On track for Q4</p>
                            </div>
                            <div className="col-span-2 p-4 border border-slate-100 rounded-xl">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Key Personnel</h4>
                                <div className="flex gap-2">
                                    {dept.children?.map((child:any, i:number) => (
                                        <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                                            {child.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'trends' && (
                         <div className="h-full">
                            <TrendChart />
                         </div>
                    )}

                    {activeTab === 'ai-insight' && (
                        <div className="space-y-4">
                            {!insight ? (
                                <div className="text-center py-10">
                                    <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-3"/>
                                    <p className="text-sm text-slate-500 mb-4">Generate AI strategic analysis for {dept.name}</p>
                                    <button 
                                        onClick={generateInsight}
                                        disabled={isLoading}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin w-4 h-4"/> : 'Run Analysis'}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                    <h4 className="text-xs font-bold text-purple-700 uppercase mb-2">Gemini Analysis</h4>
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{insight}</p>
                                    <button onClick={() => setInsight(null)} className="mt-4 text-xs text-purple-600 hover:underline">Reset</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- NEW VIEWS ---

const SkillPassportView = ({ onSelect }: any) => {
    const [filter, setFilter] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

    const filtered = EMPLOYEES.filter(e => 
        e.name.toLowerCase().includes(filter.toLowerCase()) || 
        e.skills.some(s => s.name.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
             <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><ShieldCheck className="text-orange-500"/> Skill Passport</h2>
                    <p className="text-slate-500">Digital credential repository and expert search.</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500" size={16}/>
                    <input 
                        type="text" 
                        placeholder="Search skills (e.g. Negotiation)..." 
                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:border-orange-500 transition-all shadow-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filtered.map(emp => (
                     <div key={emp.id} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                         <div className="h-20 bg-slate-900 relative">
                             <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-bl-full"></div>
                             <div className="absolute top-4 right-4">
                                 <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${emp.risk === 'Low' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                     {emp.risk === 'Low' ? 'Top Talent' : 'Monitor'}
                                 </span>
                             </div>
                         </div>
                         <div className="px-6 pb-6 pt-12 relative">
                             <div className="w-16 h-16 rounded-full bg-white p-1 absolute -top-8 left-6 shadow-md">
                                 <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                     {emp.name.split(' ').map((n:string) => n[0]).join('')}
                                 </div>
                             </div>
                             
                             <div className="mt-1">
                                 <h3 className="font-bold text-slate-800 text-lg">{emp.name}</h3>
                                 <p className="text-sm text-slate-500 mb-4">{emp.role}</p>
                                 
                                 <div className="flex flex-wrap gap-2 mb-6">
                                     {emp.skills.slice(0, 3).map((s:any, i:number) => (
                                         <span key={i} className="text-[10px] font-medium px-2 py-1 rounded bg-slate-50 text-slate-600 border border-slate-100">
                                             {s.name}
                                         </span>
                                     ))}
                                     {emp.skills.length > 3 && (
                                         <span className="text-[10px] px-2 py-1 text-slate-400">+{emp.skills.length - 3}</span>
                                     )}
                                 </div>
                                 
                                 <button 
                                    onClick={() => setSelectedEmployee(emp)}
                                    className="w-full py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-600 hover:border-orange-200 transition-all flex items-center justify-center gap-2 group-hover:bg-orange-50 group-hover:border-orange-200"
                                 >
                                     View Passport <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                                 </button>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>

             {selectedEmployee && (
                 <SkillPassportModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
             )}
        </div>
    );
};

const OrganizationView = () => {
    const [selectedDept, setSelectedDept] = useState<any>(null);

    const renderTree = (node: any, level = 0) => (
        <div key={node.name} className="flex flex-col items-center relative animate-in fade-in duration-500">
             <button 
                onClick={() => setSelectedDept(node)}
                className={`
                    relative z-10 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all w-48 shadow-sm hover:shadow-md
                    ${node.type === 'root' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 hover:border-orange-300'}
                `}
             >
                 <div className="font-bold text-sm mb-1">{node.name}</div>
                 <div className={`text-xs ${node.type === 'root' ? 'text-slate-400' : 'text-slate-500'}`}>{node.role}</div>
                 {node.type !== 'root' && (
                     <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white -mt-1 -mr-1"></div>
                 )}
             </button>
             
             {node.children && (
                 <div className="flex gap-8 mt-8 relative">
                     {/* Connector Lines */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-300 -mt-4"></div>
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-slate-300 -mt-4 hidden"></div> {/* Horizontal line logic handled differently in strict tree, keeping simple here */}
                     
                     {node.children.map((child: any) => (
                         <div key={child.name} className="relative pt-4">
                             {/* Top vertical connector for child */}
                             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-300"></div>
                             {renderTree(child, level + 1)}
                         </div>
                     ))}
                 </div>
             )}
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
             <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Building2 className="text-orange-500"/> Organization</h2>
                    <p className="text-slate-500">Interactive hierarchy and department analytics.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg shadow-sm text-slate-600">Export Chart</button>
                </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-8">
                 <MetricCard title="Total Departments" value="8" subtext="Across 3 Regions" icon={Building2} />
                 <MetricCard title="Total Headcount" value="1,248" subtext="+12 this week" trend="+3%" trendUp={true} icon={Users} />
                 <MetricCard title="Open Roles" value="24" subtext="Critical: Engineering" trend="High Demand" icon={Briefcase} />
             </div>

             {/* Organization-wide Trend Chart */}
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
                 <div className="h-64">
                    <TrendChart data={[72, 78, 85, 82, 90, 94]} />
                 </div>
             </div>

             <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 overflow-x-auto min-h-[500px] flex justify-center items-start">
                 {renderTree(ORG_TREE)}
             </div>

             {selectedDept && (
                 <DepartmentAnalyticsModal dept={selectedDept} onClose={() => setSelectedDept(null)} />
             )}
        </div>
    );
};

// --- PREVIOUS VIEWS (Restored) ---

const GlobalHubView = ({ showHeatmap, setShowHeatmap }: any) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="relative bg-white p-8 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Globe size={120} className="text-orange-500" />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Globe className="text-orange-500" /> Global Intelligence Hub
                        </h2>
                        <p className="text-slate-500 mt-1">Real-time workforce distribution and sentiment analysis.</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        All Systems Normal
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Total Headcount" value="1,248" subtext="+45 this month" trend="3.8%" trendUp={true} />
                <MetricCard title="Learning Engagement" value="78%" subtext="Active monthly users" trend="1.2%" trendUp={true} />
                <MetricCard title="Skill Index" value="7.2" subtext="Avg competency score (0-10)" trend="0.4%" trendUp={true} />
                <MetricCard title="Retention Risk" value="Low" subtext="3 depts flagged" trend="Stable" trendUp={true} />
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Regional Performance</h3>
                    <button 
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                    >
                        {showHeatmap ? <><List size={16}/> View List</> : <><Map size={16}/> View Full Map</>}
                    </button>
                </div>
                
                <div className="p-6 bg-slate-50/50 min-h-[400px]">
                    {showHeatmap ? (
                        <RegionalHeatmap />
                    ) : (
                        <div className="space-y-4">
                            {/* Simple List Fallback */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center hover:border-orange-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">I</div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Indonesia (HQ)</h4>
                                        <p className="text-xs text-slate-500">850 Employees</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-slate-800">92% Efficiency</div>
                                    <div className="text-xs text-emerald-500">Stable</div>
                                </div>
                            </div>
                            {/* ... more items ... */}
                             <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center hover:border-orange-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">V</div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Vietnam</h4>
                                        <p className="text-xs text-slate-500">240 Employees</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-slate-800">78% Efficiency</div>
                                    <div className="text-xs text-orange-500">Growing</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TalentMatrixView = () => {
    const [analyzing, setAnalyzing] = useState(false);
    
    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Users className="text-orange-500"/> Talent Matrix</h2>
                    <p className="text-slate-500">Identify high-potential leaders and flight risks.</p>
                </div>
                <button 
                    onClick={() => setAnalyzing(!analyzing)}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                >
                    <Sparkles size={16} className={analyzing ? "text-orange-500 animate-spin" : "text-orange-500"} />
                    {analyzing ? "Analyzing Data..." : "Run AI Analysis"}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Skill Score</th>
                            <th className="px-6 py-4">Learning Velocity</th>
                            <th className="px-6 py-4">Development Focus</th>
                            <th className="px-6 py-4">Risk Factor</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {EMPLOYEES.map((emp) => {
                             const lowestSkill = [...emp.skills].sort((a,b) => a.level - b.level)[0];
                             return (
                                <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-slate-900">{emp.name}</td>
                                    <td className="px-6 py-4 text-slate-500">{emp.role}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${emp.skillScore > 80 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{width: `${emp.skillScore}%`}}></div>
                                            </div>
                                            <span className="font-bold text-slate-700">{emp.skillScore}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{emp.learningHours} hrs</td>
                                    <td className="px-6 py-4">
                                        {lowestSkill.level < 75 ? (
                                            <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs font-bold border border-orange-100">
                                                <AlertCircle size={12}/> Gap: {lowestSkill.name}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold border border-emerald-100">
                                                <Zap size={12}/> Ready for Growth
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            emp.risk === 'High' ? 'bg-red-50 text-red-600' : 
                                            emp.risk === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 
                                            'bg-emerald-50 text-emerald-600'
                                        }`}>
                                            {emp.risk}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16}/></button>
                                    </td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const UserProfileView = () => (
    <div className="animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
         {/* Profile Header */}
         <div className="relative mb-8">
             <div className="h-48 bg-slate-800 rounded-t-2xl md:rounded-2xl overflow-hidden relative">
                 <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                 <div className="absolute bottom-4 right-4">
                     <button className="bg-white/90 backdrop-blur text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-white transition-colors flex items-center gap-2">
                         <Camera size={16}/> Change Cover
                     </button>
                 </div>
             </div>
             
             {/* Avatar & Info Wrapper */}
             <div className="px-8 pb-4 relative flex flex-col md:flex-row items-start md:items-end -mt-12 md:-mt-10 gap-6">
                 {/* Avatar */}
                 <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-200 shadow-lg overflow-hidden shrink-0 z-10">
                      <div className="w-full h-full bg-slate-300 flex items-center justify-center text-4xl font-bold text-slate-500">
                          AB
                      </div>
                 </div>
                 
                 {/* Text Info */}
                 <div className="pt-2 md:pt-0 md:pb-2">
                     <h1 className="text-3xl font-bold text-slate-800">Andre Benito</h1>
                     <p className="text-slate-500 font-medium flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-500"/> Global Workforce Administrator
                     </p>
                 </div>
             </div>
         </div>

         <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Left Column */}
             <div className="space-y-6">
                 <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><User size={18} className="text-orange-500"/> Personal Info</h3>
                     <div className="space-y-4 text-sm">
                         <div>
                             <label className="text-xs text-slate-400 font-bold uppercase">Role</label>
                             <div className="font-medium text-slate-700 flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500"/> Admin (Superuser)</div>
                         </div>
                         <div>
                             <label className="text-xs text-slate-400 font-bold uppercase">Department</label>
                             <div className="font-medium text-slate-700">People Operations</div>
                         </div>
                         <div>
                             <label className="text-xs text-slate-400 font-bold uppercase">Location</label>
                             <div className="font-medium text-slate-700 flex items-center gap-2"><MapPin size={14}/> San Francisco, CA</div>
                         </div>
                     </div>
                 </div>
                 
                 <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                     <h3 className="font-bold text-slate-800 mb-4">Contact</h3>
                     <div className="space-y-4 text-sm">
                         <div className="flex items-center gap-3">
                             <Mail size={16} className="text-slate-400"/>
                             <span className="text-slate-600">andre.benito@lingotalk.co</span>
                         </div>
                         <div className="flex items-center gap-3">
                             <Phone size={16} className="text-slate-400"/>
                             <span className="text-slate-600">+1 (555) 012-3456</span>
                         </div>
                     </div>
                 </div>
             </div>

             {/* Right Column (Edit Form) */}
             <div className="md:col-span-2 space-y-6">
                 <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                     <div className="flex justify-between items-center mb-6">
                         <h3 className="font-bold text-slate-800 flex items-center gap-2"><Edit2 size={18} className="text-orange-500"/> Edit Profile</h3>
                         <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-orange-500 transition-colors shadow-lg shadow-orange-900/10">
                             <Save size={16}/> Save Changes
                         </button>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                         <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                             <input type="text" defaultValue="Andre" className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"/>
                         </div>
                         <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                             <input type="text" defaultValue="Benito" className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"/>
                         </div>
                     </div>
                     <div className="mb-4">
                         <label className="block text-sm font-bold text-slate-700 mb-1">Bio</label>
                         <textarea className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 h-24" defaultValue="Experienced Workforce Administrator focused on leveraging AI to drive organizational efficiency and employee growth."></textarea>
                     </div>
                 </div>
                 
                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Lock size={18} className="text-orange-500"/> Security</h3>
                     <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200 mb-2">
                         <div className="flex items-center gap-3">
                             <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><Fingerprint size={20}/></div>
                             <div>
                                 <p className="font-bold text-sm text-slate-800">Biometric Login</p>
                                 <p className="text-xs text-slate-500">Enabled on this device</p>
                             </div>
                         </div>
                         <button className="text-sm font-bold text-red-500 hover:text-red-600">Disable</button>
                     </div>
                  </div>
             </div>
         </div>
    </div>
);

const NotificationPanel = ({ isOpen, onClose }: any) => {
    return (
        <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 border-l border-slate-100 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2"><Bell size={16} className="text-orange-500"/> Notifications</h3>
                 <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
             </div>
             <div className="overflow-y-auto h-full pb-20">
                 <div className="p-4 space-y-4">
                     {NOTIFICATIONS.map(notif => (
                         <div key={notif.id} className={`p-3 rounded-xl border transition-all hover:bg-slate-50 ${notif.read ? 'bg-white border-slate-100' : 'bg-orange-50/30 border-orange-100'}`}>
                             <div className="flex justify-between items-start mb-1">
                                 <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                     notif.type === 'alert' ? 'bg-red-100 text-red-600' :
                                     notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                     'bg-blue-100 text-blue-600'
                                 }`}>
                                     {notif.type}
                                 </span>
                                 <span className="text-[10px] text-slate-400">{notif.time}</span>
                             </div>
                             <h4 className="text-sm font-bold text-slate-800 mb-0.5">{notif.title}</h4>
                             <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                         </div>
                     ))}
                 </div>
                 <div className="p-4 text-center">
                     <button className="text-xs font-bold text-slate-500 hover:text-orange-600">Mark all as read</button>
                 </div>
             </div>
        </div>
    );
};

// --- MAIN APP ---

const App = () => {
  const [viewState, setViewState] = useState<'LANDING' | 'INTRO' | 'BIOMETRICS' | 'DASHBOARD'>('LANDING');
  const [activeTab, setActiveTab] = useState('hub');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activeScenario, setActiveScenario] = useState<ChatScenario | null>(null);
  const [customConfig, setCustomConfig] = useState<CustomScenarioConfig | null>(null);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Transitions
  const handleLandingEnter = () => setViewState('INTRO');
  const handleIntroComplete = () => setViewState('BIOMETRICS');
  const handleAuthComplete = () => {
      setViewState('DASHBOARD');
      setActiveTab('hub'); // Ensure we land on Global Hub
  };
  const handleLogout = () => {
      setViewState('LANDING');
      setActiveTab('hub');
      setActiveScenario(null);
  };

  const handleLaunchScenario = (scenario: ChatScenario, config?: CustomScenarioConfig) => {
      if (scenario === ChatScenario.CUSTOM && !config) {
          setShowPersonaModal(true);
      } else {
          setActiveScenario(scenario);
          if (config) setCustomConfig(config);
      }
  };

  const renderContent = () => {
    // If in a simulation (Text or Voice)
    if (activeScenario) {
        if (activeScenario === ChatScenario.CUSTOM || activeScenario === ChatScenario.NEGOTIATION_SIM || activeScenario === ChatScenario.MARKET_INTEL || activeScenario === ChatScenario.FIELD_LOGISTICS || activeScenario === ChatScenario.LEADERSHIP_COACH) {
            return <ChatInterface scenario={activeScenario} customConfig={customConfig} onBack={() => { setActiveScenario(null); setCustomConfig(null); }} />;
        }
    }
    // Live Voice Mode (Generic for now, or could be a specific scenario)
    if (activeTab === 'live') {
        return <VoiceInterface onBack={() => setActiveTab('dojo')} />;
    }

    switch (activeTab) {
        case 'hub':
            return <GlobalHubView showHeatmap={showHeatmap} setShowHeatmap={setShowHeatmap} />;
        case 'matrix':
            return <TalentMatrixView />;
        case 'passport':
            return <SkillPassportView />;
        case 'org':
            return <OrganizationView />;
        case 'profile':
            return <UserProfileView />;
        case 'dojo':
            return (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                             <Target className="text-orange-500"/> AI Dojo
                        </h2>
                        <p className="text-slate-500">Select a training module or generate a custom simulation.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ScenarioCard 
                            scenario={ChatScenario.NEGOTIATION_SIM}
                            description="Practice high-stakes contract renewals with a difficult client."
                            icon={<DollarSign size={24} />}
                            difficulty="Advanced"
                            duration="15 min"
                            image="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1600"
                            onClick={() => handleLaunchScenario(ChatScenario.NEGOTIATION_SIM)}
                        />
                        <ScenarioCard 
                            scenario={ChatScenario.MARKET_INTEL}
                            description="Use Search Grounding to analyze real-time competitor data."
                            icon={<Search size={24} />}
                            difficulty="Intermediate"
                            duration="10 min"
                            image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1600"
                            onClick={() => handleLaunchScenario(ChatScenario.MARKET_INTEL)}
                        />
                        <ScenarioCard 
                            scenario={ChatScenario.FIELD_LOGISTICS}
                            description="Optimize client visit routes using Maps Grounding."
                            icon={<Map size={24} />}
                            difficulty="Beginner"
                            duration="20 min"
                            image="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&q=80&w=1600"
                            onClick={() => handleLaunchScenario(ChatScenario.FIELD_LOGISTICS)}
                        />
                         <ScenarioCard 
                            scenario={ChatScenario.LEADERSHIP_COACH}
                            description="Refine your management style with an AI executive coach."
                            icon={<Users size={24} />}
                            difficulty="Expert"
                            duration="30 min"
                            image="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1600"
                            onClick={() => handleLaunchScenario(ChatScenario.LEADERSHIP_COACH)}
                        />
                        {/* Custom Persona Generator Card */}
                        <button 
                            onClick={() => setShowPersonaModal(true)}
                            className="group relative flex flex-col h-80 w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 hover:border-orange-500 hover:bg-orange-50/50 transition-all text-left"
                        >
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors">
                                <div className="p-4 rounded-full bg-slate-100 group-hover:bg-orange-100 mb-4 transition-colors">
                                    <Sparkles size={32} />
                                </div>
                                <h3 className="font-bold text-lg">Create Custom Sim</h3>
                                <p className="text-xs mt-2">Define traits & scenario</p>
                            </div>
                        </button>
                    </div>
                    {/* Live Voice Fab */}
                    <button 
                        onClick={() => setActiveTab('live')}
                        className="fixed bottom-8 right-8 bg-orange-600 hover:bg-orange-500 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center gap-2 z-40 group"
                    >
                        <Mic size={24} />
                        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold whitespace-nowrap">Voice Mode</span>
                    </button>
                </div>
            );
        default:
            return <div className="p-10 text-center text-slate-500">Module Under Construction</div>;
    }
  };

  // State Routing
  if (viewState === 'LANDING') return <LandingPage onEnter={handleLandingEnter} />;
  if (viewState === 'INTRO') return <IntroVideo onComplete={handleIntroComplete} />;
  if (viewState === 'BIOMETRICS') return <BiometricAuth onComplete={handleAuthComplete} />;

  // Dashboard Layout
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`w-64 bg-white border-r border-slate-200 flex flex-col z-20 transition-all duration-300 ${activeScenario ? '-ml-64' : ''}`}>
        <div className="p-6 flex items-center space-x-2 border-b border-slate-100 h-16">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
            <span className="text-orange-500">L</span>
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">LingoTalk <span className="text-orange-600">OS</span></span>
        </div>
        
        <div className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            <div className="px-6 mb-2">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Growth Engine</p>
            </div>
            <SidebarItem icon={Globe} label="Global Hub" id="hub" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SidebarItem icon={Target} label="AI Dojo" id="dojo" activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <div className="px-6 mb-2 mt-8">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Intelligence</p>
            </div>
            <SidebarItem icon={Users} label="Talent Matrix" id="matrix" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SidebarItem icon={ShieldCheck} label="Skill Passport" id="passport" activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <div className="px-6 mb-2 mt-8">
                 <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Admin</p>
            </div>
            <SidebarItem icon={Building2} label="Organization" id="org" activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
             <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-3 w-full p-2 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-orange-50' : 'hover:bg-slate-100'}`}
             >
                <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold shadow-sm">
                    AB
                </div>
                <div className="flex-1 overflow-hidden text-left">
                    <p className="text-sm font-bold text-slate-700 truncate">Andre Benito</p>
                    <p className="text-xs text-slate-500 truncate">Workforce Admin</p>
                </div>
                <MoreHorizontal size={16} className="text-slate-400" />
             </button>
             <button 
                onClick={handleLogout}
                className="mt-2 w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 py-2 hover:bg-red-50 rounded-lg transition-all"
             >
                 <LogOut size={14} /> Sign Out
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0 bg-slate-50 relative">
         {/* Top Header (only show if not in scenario to avoid clutter) */}
         {!activeScenario && (
             <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex justify-between items-center">
                <div className="flex items-center text-slate-400 text-sm gap-2">
                    <span className="hover:text-slate-600 cursor-pointer">LingoTalk OS</span>
                    <span className="text-slate-300">/</span>
                    <span className="font-medium text-slate-600 capitalize">{activeTab.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={handleLogout} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                        <Lock size={14}/> Lock System
                    </button>
                    <div className="w-px h-6 bg-slate-200 mx-2"></div>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                    >
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
                    </button>
                </div>
            </header>
         )}

         {/* View Content */}
         <div className={`flex-1 overflow-y-auto ${!activeScenario ? 'p-8' : ''}`}>
             {renderContent()}
         </div>
         
         {/* Notification Panel Overlay */}
         <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
         
         {/* Modals */}
         <PersonaGeneratorModal 
            isOpen={showPersonaModal} 
            onClose={() => setShowPersonaModal(false)}
            onLaunch={handleLaunchScenario}
         />
      </main>
    </div>
  );
};

export default App;