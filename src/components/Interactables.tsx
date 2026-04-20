import { useGameStore } from '../store/gameStore';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Interactables() {
   const items = useGameStore(s => s.items);
   
   return (
     <group>
       {items.map(item => {
          if (item.collected) return null;
          return <NoteMesh key={item.id} position={[item.x, 1.0, item.z]} />
       })}
     </group>
   )
}

function NoteMesh({ position }: { position: [number, number, number] }) {
   const ref = useRef<THREE.Mesh>(null);
   useFrame((state) => {
      if (ref.current) {
         ref.current.rotation.y += 0.01;
         ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      }
   });
   return (
      <mesh ref={ref} position={position}>
        <boxGeometry args={[0.3, 0.4, 0.05]} />
        <meshStandardMaterial color="#88aaff" emissive="#4466aa" roughness={0.1} metalness={0.9} />
        <pointLight distance={5} intensity={10} color="#88aaff" />
      </mesh>
   )
}
