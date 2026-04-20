import { Canvas, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { EffectComposer, Noise, Vignette, Glitch } from '@react-three/postprocessing';
import { GlitchMode, BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';
import * as THREE from 'three';
import Player from './Player';
import Environment from './Environment';
import Interactables from './Interactables'; // New addition
import { useGameStore } from '../store/gameStore';
import { useRef, useEffect } from 'react';

function PostProcess() {
  const glitchIntensity = useGameStore(s => s.glitchIntensity);
  const isEnding = useGameStore(s => s.isEnding);
  
  const intensity = isEnding ? 10.0 : glitchIntensity;
  
  return (
    <EffectComposer>
       <Noise opacity={0.06 + (intensity * 0.05)} blendFunction={BlendFunction.OVERLAY} />
       <Vignette eskil={false} offset={0.1} darkness={1.1} blendFunction={BlendFunction.NORMAL} />
       {intensity > 0 && (
         <Glitch 
           delay={new Vector2(isEnding ? 0.1 : 1.5, isEnding ? 0.5 : 3.5)} 
           duration={new Vector2(isEnding ? 0.5 : 0.1, isEnding ? 1.0 : 0.3)} 
           strength={new Vector2(intensity * 0.1, intensity * 0.3)} 
           mode={GlitchMode.SPORADIC} 
         />
       )}
    </EffectComposer>
  );
}

function Controls() {
  const started = useGameStore(s => s.started);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (started && controlsRef.current) {
      controlsRef.current.lock();
    }
  }, [started]);

  return <PointerLockControls ref={controlsRef} />;
}

function SceneEffects() {
  const isEnding = useGameStore(s => s.isEnding);

  useFrame(({ scene }) => {
     if (isEnding && scene.fog) {
       (scene.fog as THREE.FogExp2).color.lerp(new THREE.Color('#330000'), 0.05);
       (scene.fog as THREE.FogExp2).density = THREE.MathUtils.lerp((scene.fog as THREE.FogExp2).density, 0.15, 0.05);
     }
  });

  return (
      <ambientLight intensity={isEnding ? 0.5 : 0.01} color={isEnding ? "#ff0000" : "#ffffff"} />
  );
}

export default function Game() {
  return (
    <Canvas
      shadows
      camera={{ fov: 75, near: 0.1, far: 50, position: [0, 1.6, 5] }}
      onCreated={({ gl, scene }) => {
        scene.fog = new THREE.FogExp2('#000000', 0.08); // Dense fog
        gl.setClearColor('#000000');
      }}
    >
      <SceneEffects />
      <Controls />
      <Player />
      <Environment />
      <Interactables />
      <PostProcess />
    </Canvas>
  );
}
