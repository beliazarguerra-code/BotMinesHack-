'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Star, Bomb } from 'lucide-react';

interface MinesGridProps {
  predictedIndices: number[];
  isAnalyzing: boolean;
}

export default function MinesGrid({ predictedIndices, isAnalyzing }: MinesGridProps) {
  return (
    <div className="relative p-2 bg-[#121620] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-blue-500/5 blur-3xl pointer-events-none" />
      
      <div className="grid grid-cols-5 gap-2 relative z-10">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            id={`cell-${i}`}
            className="aspect-square w-full rounded-lg bg-[#1c212e] border border-white/5 flex items-center justify-center relative overflow-hidden"
          >
            <AnimatePresence>
              {predictedIndices.includes(i) && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, rotate: -45 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-blue-500/10"
                >
                  <Star className="w-6 h-6 text-blue-400 fill-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                  
                  {/* Particle effect */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-blue-400/20 rounded-full blur-md"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Cell inner shadow/style */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-white/10" />
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-black/40" />
          </div>
        ))}
      </div>

      {/* Analyzing Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="font-display text-blue-400 text-xs tracking-widest uppercase font-bold animate-pulse">
              Analizando...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
