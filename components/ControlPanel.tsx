'use client';

import { motion } from 'motion/react';

interface ControlPanelProps {
  bombCount: number;
  setBombCount: (count: number) => void;
  onSignal: () => void;
  disabled: boolean;
  isAnalyzing: boolean;
  isAutoPrediction: boolean;
  onToggleAuto: () => void;
}

export default function ControlPanel({ 
  bombCount, 
  setBombCount, 
  onSignal, 
  disabled,
  isAnalyzing,
  isAutoPrediction,
  onToggleAuto
}: ControlPanelProps) {
  const options = [1, 3, 5, 7];

  return (
    <div className="space-y-6 w-full max-w-sm">
      {/* Auto Prediction Toggle */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/90 uppercase tracking-widest leading-none mb-1">
                Auto Predictor
            </span>
            <span className="text-[8px] text-white/30 uppercase tracking-wider font-bold">
                Algoritmo Inteligente
            </span>
        </div>
        <button 
          id="auto-toggle"
          onClick={onToggleAuto}
          className={`
            relative w-12 h-6 rounded-full transition-all duration-500 flex items-center px-1
            ${isAutoPrediction ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-[#1c212e] border border-white/10'}
          `}
        >
          <motion.div 
            animate={{ x: isAutoPrediction ? 24 : 0 }}
            className={`w-4 h-4 rounded-full ${isAutoPrediction ? 'bg-white' : 'bg-white/20'}`}
          />
        </button>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold block text-center">
          Cantidad de Minas
        </label>
        <div className="grid grid-cols-4 gap-2">
          {options.map((count) => (
            <button
              key={count}
              id={`bomb-select-${count}`}
              onClick={() => !disabled && setBombCount(count)}
              className={`
                h-10 rounded-xl border font-bold transition-all duration-300
                ${bombCount === count 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                  : 'bg-[#1c212e] border-white/5 text-white/40 hover:border-white/20'}
              `}
              disabled={disabled}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <motion.button
        id="signal-button"
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={onSignal}
        disabled={disabled}
        className={`
          w-full py-4 rounded-2xl font-display font-black text-lg tracking-[0.1em] uppercase transition-all
          ${disabled 
            ? 'bg-orange-900/30 text-orange-200/20 cursor-not-allowed border border-orange-500/10' 
            : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-[#0b0e14] shadow-[0_10px_30px_rgba(249,115,22,0.3)] border-b-4 border-orange-700/50'}
        `}
      >
        {isAutoPrediction ? (isAnalyzing ? 'Analizando...' : 'Auto Signal Activo') : 'Signal'}
      </motion.button>
    </div>
  );
}
