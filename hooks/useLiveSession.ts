import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { MODEL_LIVE, AUDIO_SAMPLE_RATE_INPUT, AUDIO_SAMPLE_RATE_OUTPUT, GEMINI_API_KEY } from '../constants';
import { createPCMBlob, decodeAudio, decodeAudioData } from '../services/audioUtils';

interface UseLiveSessionProps {
  onTranscript?: (text: string, isUser: boolean) => void;
}

export const useLiveSession = ({ onTranscript }: UseLiveSessionProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Model is speaking
  const [error, setError] = useState<string | null>(null);
  
  // Refs for audio context and session
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const disconnect = useCallback(() => {
    // Close session
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => {
            try { session.close(); } catch(e) {}
        });
        sessionPromiseRef.current = null;
    }

    // Stop all playing audio
    sourcesRef.current.forEach(source => {
        try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();

    // Close contexts
    if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }

    // Stop mic stream
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }

    // Disconnect nodes
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
    }

    setIsConnected(false);
    setIsSpeaking(false);
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      
      // Initialize Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: AUDIO_SAMPLE_RATE_INPUT });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: AUDIO_SAMPLE_RATE_OUTPUT });
      
      // Reset timing
      nextStartTimeRef.current = 0;

      // Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const config = {
          model: MODEL_LIVE,
          config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
              },
              // Corporate Roleplay System Instruction
              systemInstruction: "You are a professional roleplay partner for corporate training. You can act as a skeptical client, a demanding executive, or a supportive coach depending on what the user initiates. Start by asking: 'What scenario would you like to simulate today? Sales, negotiation, or leadership?' Keep the conversation professional, realistic, and challenging.",
              inputAudioTranscription: {},
              outputAudioTranscription: {},
          }
      };

      const sessionPromise = ai.live.connect({
        ...config,
        callbacks: {
            onopen: () => {
                setIsConnected(true);
                // Start streaming input
                if (!inputAudioContextRef.current || !streamRef.current) return;
                
                const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                sourceNodeRef.current = source;
                
                const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                processorRef.current = processor;
                
                processor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmBlob = createPCMBlob(inputData, AUDIO_SAMPLE_RATE_INPUT);
                    
                    if (sessionPromiseRef.current) {
                        sessionPromiseRef.current.then(session => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    }
                };

                source.connect(processor);
                processor.connect(inputAudioContextRef.current.destination);
            },
            onmessage: async (msg: LiveServerMessage) => {
                const outputCtx = outputAudioContextRef.current;
                if (!outputCtx) return;

                // Handle Audio
                const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64Audio) {
                    setIsSpeaking(true);
                    
                    // Sync start time
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                    
                    const audioBuffer = await decodeAudioData(
                        decodeAudio(base64Audio),
                        outputCtx,
                        AUDIO_SAMPLE_RATE_OUTPUT,
                        1
                    );

                    const source = outputCtx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputCtx.destination);
                    
                    source.onended = () => {
                        sourcesRef.current.delete(source);
                        if (sourcesRef.current.size === 0) setIsSpeaking(false);
                    };

                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    sourcesRef.current.add(source);
                }

                // Handle Transcriptions
                if (msg.serverContent?.modelTurn?.parts?.[0]?.text) {
                     // Sometimes text comes in parts for display
                }

                // Handling Transcription updates (accumulated logic usually needed, but simplified here)
                if (msg.serverContent?.outputTranscription?.text) {
                     onTranscript?.(msg.serverContent.outputTranscription.text, false);
                }
                 if (msg.serverContent?.inputTranscription?.text) {
                     onTranscript?.(msg.serverContent.inputTranscription.text, true);
                }

                // Handle Interruption
                if (msg.serverContent?.interrupted) {
                    sourcesRef.current.forEach(s => s.stop());
                    sourcesRef.current.clear();
                    nextStartTimeRef.current = 0;
                    setIsSpeaking(false);
                }
            },
            onclose: () => {
                setIsConnected(false);
            },
            onerror: (err) => {
                console.error("Live API Error:", err);
                setError("Connection error. Please try again.");
                disconnect();
            }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (e) {
      console.error(e);
      setError("Failed to start session.");
      disconnect();
    }
  }, [disconnect, onTranscript]);

  return {
    connect,
    disconnect,
    isConnected,
    isSpeaking,
    error
  };
};