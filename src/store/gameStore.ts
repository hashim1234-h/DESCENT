import { create } from 'zustand';

export interface Interactable {
  id: number;
  z: number;
  x: number;
  type: 'note';
  text: string;
  collected: boolean;
}

interface GameState {
  started: boolean;
  setStarted: (s: boolean) => void;
  items: Interactable[];
  activeNote: string | null;
  interactTarget: number | null;
  setInteractTarget: (id: number | null) => void;
  collectItem: (id: number) => void;
  dismissNote: () => void;
  glitchIntensity: number;
  isEnding: boolean;
  flashlightHealth: number;
}

export const useGameStore = create<GameState>((set, get) => ({
  started: false,
  setStarted: (started) => set({ started }),
  items: [
     { id: 1, z: -30, x: -3, type: 'note', text: "SUBJECT: EXPEDITION 4\nThey sealed the entrance behind us. The architecture here doesn't follow Euclidean geometry. I'm leaving this log for whoever follows.", collected: false },
     { id: 2, z: -100, x: 2.5, type: 'note', text: "SUBJECT: MEDICAL LOG\nThree team members are missing. They walked around a corner and just... vanished. The heavy breathing we hear isn't human.", collected: false },
     { id: 3, z: -180, x: 0, type: 'note', text: "SUBJECT: EQUIPMENT FAILURE\nThe darkness here eats light. My flashlight battery drains exponentially fast. If I lose light completely, I am dead.", collected: false },
     { id: 4, z: -250, x: -2, type: 'note', text: "SUBJECT: THEY LISTEN\nThe entities... they react to sound. I have to walk slowly. Too much noise draws them near.", collected: false },
     { id: 5, z: -350, x: 3, type: 'note', text: "SUBJECT: FINAL TERMINAL\nThere is no end to the corridor. Only the descent. WAKE UP WAKE UP WAKE UP", collected: false },
  ],
  activeNote: null,
  interactTarget: null,
  setInteractTarget: (id) => set({ interactTarget: id }),
  collectItem: (id) => {
     const item = get().items.find(i => i.id === id);
     if (!item || item.collected) return;
     
     const updatedItems = get().items.map(i => i.id === id ? { ...i, collected: true } : i);
     const collectedCount = updatedItems.filter(i => i.collected).length;
     
     set({ 
        items: updatedItems, 
        activeNote: item.text,
        interactTarget: null,
        glitchIntensity: collectedCount * 0.2, // Increases as you collect
        flashlightHealth: Math.max(0.3, 1.0 - (collectedCount * 0.15)) // Flashlight dims
     });
     
     if (collectedCount === 5) {
        setTimeout(() => {
           set({ isEnding: true });
        }, 4000);
     }
  },
  dismissNote: () => set({ activeNote: null }),
  glitchIntensity: 0,
  isEnding: false,
  flashlightHealth: 1.0,
}));
