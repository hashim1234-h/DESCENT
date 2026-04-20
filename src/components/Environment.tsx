import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

export default function Environment() {
   const { camera } = useThree();
   const groupRef = useRef<THREE.Group>(null);
   const numSegments = 30; // Further distance
   const segmentLength = 10;
   
   useFrame(() => {
     if (groupRef.current) {
         groupRef.current.children.forEach(child => {
             if (child.position.z > camera.position.z + 5) {
                child.position.z -= numSegments * segmentLength;
             }
         });
     }
   });

   return (
      <group ref={groupRef}>
         {Array.from({ length: numSegments }).map((_, i) => {
            const z = -i * segmentLength;
            return (
               <group key={i} position={[0, 0, z]}>
                 {/* Left Wall */}
                 <mesh position={[-4.5, 2.5, 0]}>
                    <boxGeometry args={[1, 5, segmentLength]} />
                    <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
                 </mesh>
                 {/* Right Wall */}
                 <mesh position={[4.5, 2.5, 0]}>
                    <boxGeometry args={[1, 5, segmentLength]} />
                    <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
                 </mesh>
                 {/* Floor */}
                 <mesh position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]}>
                    <planeGeometry args={[10, segmentLength]} />
                    <meshStandardMaterial color="#050505" roughness={1} />
                 </mesh>
                 {/* Ceiling */}
                 <mesh position={[0, 5, 0]} rotation={[Math.PI/2, 0, 0]}>
                    <planeGeometry args={[10, segmentLength]} />
                    <meshStandardMaterial color="#020202" roughness={1} />
                 </mesh>
                 
                 {/* Arch details every 2 segments */}
                 {i % 2 === 0 && (
                   <>
                     <mesh position={[-3.8, 2.5, 0]}>
                       <boxGeometry args={[0.5, 5, 1]} />
                       <meshStandardMaterial color="#020202" roughness={0.8} />
                     </mesh>
                     <mesh position={[3.8, 2.5, 0]}>
                       <boxGeometry args={[0.5, 5, 1]} />
                       <meshStandardMaterial color="#020202" roughness={0.8} />
                     </mesh>
                   </>
                 )}
               </group>
            )
         })}
      </group>
   )
}
