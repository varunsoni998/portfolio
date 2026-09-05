import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import type { RoomDef } from "./worldConfig";
import { doorPosition, doorYaw } from "./worldPath";

export interface PhysicalDoorHandle {
  group: THREE.Group | null;
  hinge: THREE.Group | null;
  handle: THREE.Mesh | null;
}

interface DoorProps {
  room: RoomDef;
  onSelect: (room: RoomDef) => void;
  registerRef: (id: string, refs: PhysicalDoorHandle) => void;
}

/**
 * A physical door: a hinge group (rotates open, driven by GSAP from the
 * camera state machine — see WorldCameraRig.tsx) holding the door slab and
 * a handle. Doors don't animate themselves on click; they expose their
 * hinge/handle via `registerRef` so the state machine can drive the open
 * animation in lockstep with the camera's approach and traversal.
 */
export default function Door({ room, onSelect, registerRef }: DoorProps) {
  const [hovered, setHovered] = useState(false);
  const position = doorPosition(room.progress, room.side);
  const yaw = doorYaw(room.progress, room.side);

  const groupRef = useRef<THREE.Group>(null);
  const hingeRef = useRef<THREE.Group>(null);
  const handleRef = useRef<THREE.Mesh>(null);

  const slabGeometry = useMemo(() => new THREE.BoxGeometry(1.5, 2.6, 0.08), []);
  const slabEdges = useMemo(() => new THREE.EdgesGeometry(slabGeometry), [slabGeometry]);
  const handleGeometry = useMemo(() => new THREE.CapsuleGeometry(0.02, 0.18, 4, 8), []);

  return (
    <group
      ref={(g) => {
        groupRef.current = g;
        registerRef(room.id, { group: groupRef.current, hinge: hingeRef.current, handle: handleRef.current });
      }}
      position={[position.x, 0, position.z]}
      rotation={[0, yaw, 0]}
    >
      {/* door frame, fixed to the wall */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[1.68, 2.8, 0.14]} />
        <meshStandardMaterial color="#d8d2c4" roughness={0.85} />
      </mesh>

      {/* hinge pivot sits at the left edge of the doorway so the slab swings like a real door */}
      <group ref={hingeRef} position={[-0.72, 0, 0]}>
        <mesh
          position={[0.75, 1.3, 0]}
          geometry={slabGeometry}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(room);
          }}
        >
          <meshStandardMaterial color={hovered ? "#c98a3d" : "#efebe1"} roughness={0.9} />
        </mesh>
        <lineSegments position={[0.75, 1.3, 0]} geometry={slabEdges}>
          <lineBasicMaterial color="#2a2621" transparent opacity={0.45} />
        </lineSegments>

        <mesh ref={handleRef} position={[1.35, 1.3, 0.06]} geometry={handleGeometry} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#2a2621" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>

      <Text
        position={[0, 2.55, 0.08]}
        fontSize={0.2}
        color={hovered ? "#c98a3d" : "#4a453d"}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        {room.label}
      </Text>
    </group>
  );
}
