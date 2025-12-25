import React, { useEffect, useState } from 'react';
import { useLiveSession } from '../hooks/useLiveSession';

interface VoiceInterfaceProps {
  onBack: () => void;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onBack }) => {
  const [transcripts, setTranscripts] = useState<{text: string, isUser: boolean}[]>([]);
  
  const { connect, disconnect, isConnected, isSpeaking, error } = useLiveSession({
    onTranscript: (text, isUser) => {
        // Simple append for demo - a real app would likely need debouncing or stream replacement logic
        // For this demo, we rely on the live session hook to give us chunks. 
        // We'll just show the latest status or log.
        // In a real Live API implementation, transcript handling is complex (partial vs final).
        // We will just show a "Listening..." or "Speaking..." state mostly for visual feedback in this demo.
        console.log(`[${isUser ? 'User' : 'Model'}]: ${text}`);
    }
  });

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return (
    <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden">
        {/* Background Ambient Effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-64 h-64 rounded-full blur-[100px] transition-all duration-1000 ${isSpeaking ? 'bg-orange-600/30 scale-150' : 'bg-blue-900/20 scale-100'}`}></div>
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-center">
            <button onClick={onBack} className="bg-slate-900/50 hover:bg-slate-800 text-white rounded-full p-3 backdrop-blur border border-slate-700 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="bg-slate-900/50 backdrop-blur px-4 py-1.5 rounded-full border border-slate-700/50">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Live Session</span>
            </div>
        </div>

        {/* Main Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-center z-10 p-8">
            {error ? (
                <div className="text-red-400 bg-red-900/20 px-6 py-4 rounded-xl border border-red-900/50 text-center max-w-md">
                    <p className="font-semibold mb-2">Connection Failed</p>
                    <p className="text-sm opacity-80">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 text-xs bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-colors">Retry</button>
                </div>
            ) : (
                <div className="relative">
                    {/* Central Avatar / Orb */}
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        {/* Pulse Rings */}
                        {isConnected && (
                            <>
                                <div className={`absolute inset-0 rounded-full border border-orange-500/30 ${isSpeaking ? 'animate-pulse-ring' : ''}`}></div>
                                <div className={`absolute inset-0 rounded-full border border-orange-500/20 ${isSpeaking ? 'animate-pulse-ring' : ''}`} style={{ animationDelay: '1s' }}></div>
                            </>
                        )}
                        
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
                            isConnected 
                                ? isSpeaking 
                                    ? 'bg-gradient-to-br from-orange-400 to-orange-600 scale-110 shadow-[0_0_50px_rgba(249,115,22,0.4)]' 
                                    : 'bg-slate-800 border-2 border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.1)]'
                                : 'bg-slate-900 border border-slate-700'
                        }`}>
                            {isConnected ? (
                                isSpeaking ? (
                                    <svg className="w-12 h-12 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" /></svg>
                                ) : (
                                    <svg className="w-12 h-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" /></svg>
                                )
                            ) : (
                                <svg className="w-10 h-10 text-slate-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-12 text-center">
                        <h3 className="text-2xl font-bold text-white mb-2">
                            {isConnected ? (isSpeaking ? "LingoTalk is speaking..." : "Listening...") : "Connecting..."}
                        </h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto">
                            Speak naturally to practice your conversation skills.
                        </p>
                    </div>
                </div>
            )}
        </div>

        {/* Controls */}
        <div className="p-8 flex justify-center pb-12">
            <button 
                onClick={() => {
                   if (isConnected) disconnect();
                   else connect();
                }}
                className={`px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 transition-all ${
                    isConnected 
                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                }`}
            >
                {isConnected ? (
                    <>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        End Session
                    </>
                ) : (
                    <>
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         Start Speaking
                    </>
                )}
            </button>
        </div>
    </div>
  );
};
