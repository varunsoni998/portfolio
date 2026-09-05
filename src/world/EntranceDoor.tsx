import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

export interface EntranceDoorHandle {
  hinge: THREE.Group | null;
}

/**
 * The main entrance — deliberately its own thing, outside and before the
 * corridor, per the brief's explicit requirement: the visitor should not
 * already be standing inside the corridor when the site loads. Larger and
 * more ceremonial than the room doors, with the visitor's name integrated
 * into the environment rather than as a floating hero headline.
 */
export default function EntranceDoor({
  onSelect,
  registerRef,
  disabled,
}: {
  onSelect: () => void;
  registerRef: (refs: EntranceDoorHandle) => void;
  disabled: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const hingeRef = useRef<THREE.Group>(null);

  const slabGeometry = useMemo(() => new THREE.BoxGeometry(1.9, 3.2, 0.1), []);
  const slabEdges = useMemo(() => new THREE.EdgesGeometry(slabGeometry), [slabGeometry]);
  const handleGeometry = useMemo(() => new THREE.CapsuleGeometry(0.025, 0.22, 4, 8), []);

  return (
    <group position={[0, 0, 6]}>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[2.1, 3.5, 0.16]} />
        <meshStandardMaterial color="#d8d2c4" roughness={0.85} />
      </mesh>

      <group
        ref={(g) => {
          hingeRef.current = g;
          registerRef({ hinge: hingeRef.current });
        }}
        position={[-0.9, 0, 0]}
      >
        <mesh
          position={[0.95, 1.6, 0]}
          geometry={slabGeometry}
          onPointerOver={(e) => {
            if (disabled) return;
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
            if (disabled) return;
            e.stopPropagation();
            onSelect();
          }}
        >
          <meshStandardMaterial color={hovered ? "#c98a3d" : "#efebe1"} roughness={0.9} />
        </mesh>
        <lineSegments position={[0.95, 1.6, 0]} geometry={slabEdges}>
          <lineBasicMaterial color="#2a2621" transparent opacity={0.45} />
        </lineSegments>
        <mesh position={[1.75, 1.6, 0.07]} geometry={handleGeometry} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#2a2621" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>

      <Text position={[0, 3.35, 0.1]} fontSize={0.22} color="#4a453d" anchorX="center" letterSpacing={0.14}>
        VARUN DHANAK
      </Text>
      <Text position={[0, 3.02, 0.1]} fontSize={0.1} color="#8a8578" anchorX="center" letterSpacing={0.2}>
        AI &amp; DATA SCIENCE ENGINEER
      </Text>

      {!disabled && (
        <Text position={[0, -0.35, 0.1]} fontSize={0.11} color={hovered ? "#c98a3d" : "#8a8578"} anchorX="center" letterSpacing={0.18}>
          ENTER
        </Text>
      )}
    </group>
  );
}
