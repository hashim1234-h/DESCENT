import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { playFootstep, updateAudioIntensity, playCollectSound } from '../audio';

export default function Player() {
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls();
  const glitchIntensity = useGameStore(s => s.glitchIntensity);
  const started = useGameStore(s => s.started);
  const isEnding = useGameStore(s => s.isEnding);
  
  // New Store Selectors
  const activeNote = useGameStore(s => s.activeNote);
  const items = useGameStore(s => s.items);
  const setInteractTarget = useGameStore(s => s.setInteractTarget);
  const interactTarget = useGameStore(s => s.interactTarget);
  const collectItem = useGameStore(s => s.collectItem);
  const flashlightHealth = useGameStore(s => s.flashlightHealth);
  
  const moveSpeed = 3.5;
  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();
  
  const stepTimer = useRef(0);
  const spotLightRef = useRef<THREE.SpotLight>(null);

  useEffect(() => {
     updateAudioIntensity(glitchIntensity, isEnding);
  }, [glitchIntensity, isEnding]);

  useFrame((state, delta) => {
    if (!started) return;

    // Flashlight logic with health/flicker
    if (spotLightRef.current) {
        const baseIntensity = 300 * flashlightHealth; // Much stronger flashlight
        const flickerScale = Math.random() > 0.95 ? (Math.random() * 0.5 + 0.5) : 1;
        spotLightRef.current.intensity = baseIntensity * flickerScale;
        
        spotLightRef.current.position.copy(camera.position);
        spotLightRef.current.quaternion.copy(camera.quaternion);
        spotLightRef.current.translateX(0.3);
        spotLightRef.current.translateY(-0.3);
        spotLightRef.current.target.position.copy(spotLightRef.current.position);
        spotLightRef.current.target.position.add(
            new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
        );
        spotLightRef.current.target.updateMatrixWorld();
    }

    if (activeNote) return; // Player freezes when reading

    const { forward, backward, left, right, shift, interact } = getKeys();
    
    // Normal FPS movement
    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);
    
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(moveSpeed * delta * (shift ? 1.5 : 1));
    
    // Check if moving
    const moving = direction.lengthSq() > 0;
    
    if (moving) {
       camera.translateX(direction.x);
       camera.translateZ(direction.z);
       
       // Head bobbing
       camera.position.y = 1.6 + Math.sin(state.clock.elapsedTime * (shift ? 10 : 6)) * 0.05;
       
       // Footsteps
       stepTimer.current += delta;
       const stepInterval = shift ? 0.4 : 0.6;
       if (stepTimer.current > stepInterval) {
          playFootstep();
          stepTimer.current = 0;
       }
    } else {
       // Reset head bob gently
       camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.6, 0.1);
       stepTimer.current = 0.5; // Starts almost immediately on next walk
    }
    
    // Walls collision (Corridor is x: -4.5 to 4.5, so keep player within -3.5 to 3.5)
    if (camera.position.x > 3.5) camera.position.x = 3.5;
    if (camera.position.x < -3.5) camera.position.x = -3.5;
    
    // Check for interactables
    let nearestId = null;
    let minDistanceSq = Infinity;
    
    for (const item of items) {
       if (!item.collected) {
          const itemPos = new THREE.Vector3(item.x, 1.0, item.z);
          const distSq = camera.position.distanceToSquared(itemPos);
          if (distSq < 16) { // Distance ~4 units
             if (distSq < minDistanceSq) {
                minDistanceSq = distSq;
                nearestId = item.id;
             }
          }
       }
    }
    
    if (interactTarget !== nearestId) {
        setInteractTarget(nearestId);
    }
    
    if (interact && nearestId) {
        playCollectSound();
        collectItem(nearestId);
    }
  });

  return (
    <spotLight 
      ref={spotLightRef}
      angle={0.6} 
      penumbra={0.4} 
      intensity={300} 
      distance={150} 
      color="#fffffa" 
      castShadow 
    />
  );
}
