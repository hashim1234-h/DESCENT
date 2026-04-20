import { useGameStore } from '../store/gameStore';
import { initAudio } from '../audio';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function UI() {
  const started = useGameStore(s => s.started);
  const setStarted = useGameStore(s => s.setStarted);
  
  const activeNote = useGameStore(s => s.activeNote);
  const dismissNote = useGameStore(s => s.dismissNote);
  const interactTarget = useGameStore(s => s.interactTarget);
  const items = useGameStore(s => s.items);

  const isEnding = useGameStore(s => s.isEnding);
  const [showEndSequence, setShowEndSequence] = useState(false);

  // Auto-trigger sequence on extreme horror event
  useEffect(() => {
     if (isEnding) {
        setTimeout(() => {
           setShowEndSequence(true);
        }, 5000); // 5 seconds after climax starts
     }
  }, [isEnding]);
  
  // Keyboard shortcut to close note
  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'KeyE' && activeNote) {
           dismissNote();
        }
     };
     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNote, dismissNote]);

  const handleStart = () => {
    initAudio();
    setStarted(true);
  };

  const logsFound = items.filter(i => i.collected).length;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {/* Start overlay */}
      {!started && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center pointer-events-auto z-[60]">
          <h1 className="text-white text-5xl tracking-[0.2em] uppercase mb-8 font-serif select-none" style={{ filter: 'blur(1px)'}}>
            Descent
          </h1>
          <button 
             onClick={handleStart}
             className="text-gray-400 hover:text-white uppercase tracking-widest text-sm border border-gray-800 hover:border-gray-500 px-8 py-3 transition-colors duration-500 rounded-sm"
          >
            Click to Begin
          </button>
          
          <div className="absolute bottom-10 flex gap-10 text-xs text-gray-700 uppercase tracking-widest">
            <span>WASD to move</span>
            <span>Shift to run</span>
            <span>E to Interact</span>
          </div>
        </div>
      )}

      {/* Crosshair */}
      {started && !showEndSequence && !activeNote && (
        <div className="w-1 h-1 bg-white rounded-full opacity-30 mix-blend-difference" />
      )}

      {/* Interact Prompt */}
      {started && interactTarget !== null && !activeNote && (
        <div className="absolute bottom-1/3 w-full text-center pointer-events-none text-white tracking-widest opacity-80 text-sm">
           [ E ] Read Note
        </div>
      )}

      {/* activeNote Overlay */}
      <AnimatePresence>
         {activeNote && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               transition={{ duration: 0.3 }}
               className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto z-40 backdrop-blur-sm"
            >
               <div className="max-w-2xl p-12 border border-white/10 bg-black/50 text-white font-serif text-xl leading-loose tracking-wide whitespace-pre-wrap select-none text-center" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)'}}>
                  {activeNote}
                  <div className="mt-12 text-xs font-sans text-white/40 tracking-widest uppercase">
                     Press E to drop
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Stats UI */}
      {started && !showEndSequence && (
         <div className="absolute top-6 left-6 text-white/30 text-xs uppercase tracking-[0.2em]">
            Logs Found: {logsFound} / {items.length}
         </div>
      )}

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{
         boxShadow: 'inset 0 0 150px rgba(0,0,0,0.9)',
      }} />
      
      {/* The End fade in */}
      {showEndSequence && (
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 4 }}
           className="absolute inset-0 bg-black flex items-center justify-center pointer-events-auto z-50"
        >
           <h1 className="text-red-800 text-6xl tracking-[0.5em] uppercase font-serif animate-pulse">
             The End
           </h1>
        </motion.div>
      )}
    </div>
  );
}
