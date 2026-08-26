import type { MutableRefObject } from "react";
import { Canvas } from "@react-three/fiber";
import CorridorShell from "./CorridorShell";
import CorridorCamera from "./CorridorCamera";
import Door from "./Door";
import { CORRIDOR_DOORS, type CorridorDoor } from "./corridorConfig";

interface CorridorSceneProps {
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
  onSelectDoor: (door: CorridorDoor) => void;
}

export default function CorridorScene({ progressRef, reducedMotion, onSelectDoor }: CorridorSceneProps) {
  return (
    <Canvas
      shadows={false}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "low-power" }}
      camera={{ fov: 62, near: 0.1, far: 100 }}
    >
      <color attach="background" args={["#dcd6c6"]} />
      <fog attach="fog" args={["#dcd6c6", 8, 34]} />

      <ambientLight intensity={0.65} />
      <directionalLight position={[2, 6, 2]} intensity={0.5} />

      <CorridorShell />
      {CORRIDOR_DOORS.map((door) => (
        <Door key={door.id} door={door} onSelect={onSelectDoor} />
      ))}
      <CorridorCamera progressRef={progressRef} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
