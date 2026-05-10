'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import MinesGrid from '@/components/MinesGrid';
import ControlPanel from '@/components/ControlPanel';
import { motion } from 'motion/react';
import { Star, Zap } from 'lucide-react';

export default function MinesPredictorPage() {
  const [bombCount, setBombCount] = useState(3);
  const [predictedIndices, setPredictedIndices] = useState<number[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAutoPrediction, setIsAutoPrediction] = useState(false);
  const [accuracy, setAccuracy] = useState<string | null>(null);
  const [serverInfo, setServerIp] = useState<string | null>(null);
  const [handshake, setHandshake] = useState<{ gateway: string, algorithm: string, status: string } | null>(null);
  const [gameActivity, setGameActivity] = useState<{ heatIndex: string, activeUsers: number } | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // Keep bombCount ref for the socket listener to always have latest value
  const bombCountRef = useRef(bombCount);
  useEffect(() => { bombCountRef.current = bombCount; }, [bombCount]);

  const handleSignal = () => {
    if (!socketRef.current) return;
    
    setIsAnalyzing(true);
    setPredictedIndices([]);
    setAccuracy(null);
    
    socketRef.current.emit('request-prediction', { bombCount: bombCountRef.current });
  };

  useEffect(() => {
    // Expand Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

    // Connect to the socket server
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to predictor server');
    });

    socket.on('system-handshake', (data: { gateway: string, algorithm: string, status: string }) => {
      setHandshake(data);
      setServerIp(data.gateway);
    });

    socket.on('game-activity', (data: { heatIndex: string, activeUsers: number }) => {
      setGameActivity(data);
    });

    socket.on('game-state-change', (data: any) => {
      console.log('Game state change detected:', data);
      // If auto-prediction is ON, request a new signal immediately
      // Use the ref to check the state inside the listener
      if (typeof window !== 'undefined') {
        const autoOn = localStorage.getItem('auto_prediction') === 'true';
        if (autoOn) {
          handleSignal();
        }
      }
    });

    socket.on('prediction-response', (data: { recommendedIndices: number[], accuracy: string, serverIp?: string }) => {
      setPredictedIndices(data.recommendedIndices);
      setAccuracy(data.accuracy);
      if (data.serverIp) setServerIp(data.serverIp);
      setIsAnalyzing(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleAutoPrediction = () => {
    const newVal = !isAutoPrediction;
    setIsAutoPrediction(newVal);
    localStorage.setItem('auto_prediction', String(newVal));
  };

  // Sync state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('auto_prediction') === 'true';
    setIsAutoPrediction(saved);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0b0e14] relative overflow-hidden font-sans">
      {/* Immersive Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Real-time Status Bar */}
        <div className="flex justify-between items-center px-3 py-1.5 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_#22c55e] ${handshake ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest leading-none">
                   {handshake ? `Secure Gateway: ${handshake.status}` : 'Connecting...'}
                </span>
            </div>
            <div className="flex items-center gap-3">
                {handshake && (
                    <span className="text-[7px] font-mono text-blue-500/50 uppercase tracking-tighter">
                        {handshake.algorithm}
                    </span>
                )}
                {gameActivity && (
                    <>
                        <span className="text-[8px] font-bold text-blue-400/80 uppercase tracking-widest leading-none">
                            Heat: {gameActivity.heatIndex}%
                        </span>
                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest leading-none">
                            Users: {gameActivity.activeUsers}
                        </span>
                    </>
                )}
            </div>
        </div>

        {/* Header */}
        <header className="text-center space-y-1">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center gap-3 mb-2"
          >
            <div className="bg-blue-600 p-2 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-400/30">
              <Zap className="w-6 h-6 text-white shrink-0" fill="white" />
            </div>
            <h1 className="text-3xl font-display font-black tracking-tighter italic">
              SPARK <span className="text-blue-500">MINES</span>
            </h1>
          </motion.div>
          <div className="flex justify-center items-center gap-2">
            <p className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-bold">
                Algorithm 1Win V3.1
            </p>
            {serverInfo && (
                 <span className="text-[8px] text-blue-500/60 font-mono bg-blue-500/5 px-1.5 rounded border border-blue-500/10 italic">
                    {serverInfo}
                 </span>
            )}
          </div>
        </header>

        {/* Prediction Accuracy Display */}
        <div className="h-6 flex justify-center">
            {accuracy && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
                >
                    <Star className="w-3 h-3 text-blue-400 fill-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                        Fiabilidad: {accuracy}%
                    </span>
                </motion.div>
            )}
        </div>

        {/* Grid Area */}
        <MinesGrid predictedIndices={predictedIndices} isAnalyzing={isAnalyzing} />

        {/* Info Box */}
        <motion.div 
            whileHover={{ y: -2 }}
            className="bg-[#121620]/80 backdrop-blur-md border border-white/5 p-4 rounded-2xl flex items-center gap-4 transition-all hover:bg-[#161b29] cursor-default"
        >
            <div className="bg-yellow-500/10 p-2 rounded-xl border border-yellow-500/20">
                <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
            </div>
            <div className="space-y-0.5">
                <p className="text-xs font-bold text-white/90 uppercase tracking-tight font-display">Gateway de Seguridad 1Win</p>
                <p className="text-[10px] text-white/30 font-medium italic leading-tight">Canal encriptado vía 149.154.167.50:443. Verificación de hash RSA procesada exitosamente para sincronización en vivo.</p>
            </div>
        </motion.div>

        {/* Controls */}
        <div className="flex justify-center pt-2">
            <ControlPanel 
                bombCount={bombCount} 
                setBombCount={setBombCount} 
                onSignal={handleSignal}
                disabled={isAnalyzing}
                isAnalyzing={isAnalyzing}
                isAutoPrediction={isAutoPrediction}
                onToggleAuto={toggleAutoPrediction}
            />
        </div>

        {/* Footer */}
        <footer className="text-center pt-10">
            <p className="text-[8px] text-white/10 uppercase tracking-[0.25em] font-bold leading-relaxed max-w-[200px] mx-auto opacity-50">
                AI BOT SOLUTIONS © 2026
                <br />
                VIRTUAL SIGNAL INFRASTRUCTURE
            </p>
        </footer>
      </div>
    </main>
  );
}
