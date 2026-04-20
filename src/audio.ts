// Minimal audio generation using Web Audio API for atmosphere

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let lfo: OscillatorNode | null = null;
let drone: OscillatorNode | null = null;
let endingOsc: OscillatorNode | null = null;

export function initAudio() {
  if (ctx) return;
  ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = 0; // Fade in
  
  // Drone
  drone = ctx.createOscillator();
  drone.type = 'sawtooth';
  drone.frequency.value = 55; // Deep rumble
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 100;
  
  // LFO to slowly modulate filter for a "breathing" effect
  lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.1; // Very slow
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 50;
  
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  
  drone.connect(filter);
  filter.connect(masterGain);
  
  drone.start();
  lfo.start();
  
  // Fade in master
  masterGain.gain.setTargetAtTime(0.3, ctx.currentTime, 5.0);
}

export function updateAudioIntensity(intensity: number, isEnding: boolean = false) {
   if (!ctx || !lfo || !masterGain || !drone) return;
   
   if (isEnding) {
      if (!endingOsc) {
         endingOsc = ctx.createOscillator();
         endingOsc.type = 'square';
         endingOsc.frequency.value = 120;
         
         const endingFilter = ctx.createBiquadFilter();
         endingFilter.type = 'highpass';
         endingFilter.frequency.value = 1000;
         
         const endingGain = ctx.createGain();
         endingGain.gain.value = 0;
         endingGain.gain.setTargetAtTime(0.5, ctx.currentTime, 2.0); // fade in sharp sound
         
         endingOsc.connect(endingFilter);
         endingFilter.connect(endingGain);
         endingGain.connect(ctx.destination);
         
         endingOsc.start();
      }
      lfo.frequency.setTargetAtTime(5.0, ctx.currentTime, 0.5); // Fast stutter
      drone.frequency.setTargetAtTime(110, ctx.currentTime, 2.0); 
      masterGain.gain.setTargetAtTime(1.0, ctx.currentTime, 2.0);
   } else {
       // As intensity goes up (0 to 1+), increase drone frequency slightly and LFO speed
       lfo.frequency.setTargetAtTime(0.1 + intensity * 0.5, ctx.currentTime, 1.0);
       drone.frequency.setTargetAtTime(55 + intensity * 10, ctx.currentTime, 1.0);
       masterGain.gain.setTargetAtTime(0.3 + intensity * 0.1, ctx.currentTime, 1.0);
   }
}

export function playFootstep() {
   if (!ctx || !masterGain) return;
   
   const osc = ctx.createOscillator();
   const gain = ctx.createGain();
   
   // A quick thud
   osc.type = 'sine';
   osc.frequency.setValueAtTime(150, ctx.currentTime);
   osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
   
   gain.gain.setValueAtTime(0.5, ctx.currentTime);
   gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
   
   osc.connect(gain);
   gain.connect(masterGain);
   
   osc.start();
   osc.stop(ctx.currentTime + 0.2);
}

export function playCollectSound() {
   if (!ctx || !masterGain) return;
   const osc = ctx.createOscillator();
   const gain = ctx.createGain();
   
   osc.type = 'triangle';
   osc.frequency.setValueAtTime(400, ctx.currentTime);
   osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
   
   gain.gain.setValueAtTime(0, ctx.currentTime);
   gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
   gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
   
   osc.connect(gain);
   gain.connect(masterGain);
   
   osc.start();
   osc.stop(ctx.currentTime + 0.6);
}
