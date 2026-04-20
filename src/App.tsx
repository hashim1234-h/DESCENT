import { KeyboardControls } from '@react-three/drei';
import Game from './components/Game';
import UI from './components/UI';

export default function App() {
  return (
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
        { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'right', keys: ['ArrowRight', 'KeyD'] },
        { name: 'shift', keys: ['Shift'] },
        { name: 'interact', keys: ['KeyE'] }
      ]}
    >
       <div className="w-full h-screen bg-black overflow-hidden relative cursor-none">
          <Game />
          <UI />
       </div>
    </KeyboardControls>
  );
}
