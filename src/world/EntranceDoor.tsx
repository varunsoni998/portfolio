import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

export interface EntranceDoorHandle {
  hinge: THREE.Group | null;
}

const FRAME_WIDTH = 2.5;
const FRAME_HEIGHT = 3.6;
const DOOR_WIDTH = 2.2;
const DOOR_HEIGHT = 3.3;

/**
 * The main entrance — outside and before the corridor, per the brief's
 * explicit requirement that the visitor not already be standing inside
 * the corridor on load.
 *
 * Fixes after seeing it rendered: the name was previously placed at
 * y=3.35 which sat *on top of* the frame (the frame's top edge reaches
 * y≈3.35 too), so the text visually collided with the door. It now lives
 * on a proper wall above the frame with real clearance. The door slab
 * also got recessed panels and a kick plate so it reads as a built
 * object rather than one flat grey rectangle.
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
  const hingeRef = useRef<THREE.Group | null>(null);

  const slabGeometry = useMemo(() => new THREE.BoxGeometry(DOOR_WIDTH, DOOR_HEIGHT, 0.12), []);
  const slabEdges = useMemo(() => new THREE.EdgesGeometry(slabGeometry), [slabGeometry]);
  const panelGeometry = useMemo(() => new THREE.BoxGeometry(0.78, 1.15, 0.03), []);
  const panelEdges = useMemo(() => new THREE.EdgesGeometry(panelGeometry), [panelGeometry]);
  const handleGeometry = useMemo(() => new THREE.CapsuleGeometry(0.035, 0.26, 4, 8), []);
  const plateGeometry = useMemo(() => new THREE.BoxGeometry(0.1, 0.34, 0.04), []);

  const doorColor = hovered ? "#e8d9c0" : "#efebe1";

  // Recessed panel positions on the slab — two columns, two rows.
  const panels: [number, number][] = [
    [-0.48, 2.28],
    [0.48, 2.28],
    [-0.48, 1.0],
    [0.48, 1.0],
  ];

  return (
    <group position={[0, 0, 6]}>
      {/* Facade wall the doorway is cut into — gives the entrance somewhere
          to *be*, so the door isn't floating in empty space, and gives the
          signage a real surface to sit on. Built as four pieces around the
          opening rather than one plane with a hole. */}
      <group position={[0, 0, -0.12]}>
        {/* above the doorway */}
        <mesh position={[0, FRAME_HEIGHT + 1.2, 0]}>
          <boxGeometry args={[14, 2.4, 0.3]} />
          <meshStandardMaterial color="#ded7c6" roughness={0.95} />
        </mesh>
        {/* left of the doorway */}
        <mesh position={[-(FRAME_WIDTH / 2 + 3), FRAME_HEIGHT / 2, 0]}>
          <boxGeometry args={[6, FRAME_HEIGHT, 0.3]} />
          <meshStandardMaterial color="#ded7c6" roughness={0.95} />
        </mesh>
        {/* right of the doorway */}
        <mesh position={[FRAME_WIDTH / 2 + 3, FRAME_HEIGHT / 2, 0]}>
          <boxGeometry args={[6, FRAME_HEIGHT, 0.3]} />
          <meshStandardMaterial color="#ded7c6" roughness={0.95} />
        </mesh>
      </group>

      {/* door frame / casing */}
      <mesh position={[0, FRAME_HEIGHT / 2, 0]}>
        <boxGeometry args={[FRAME_WIDTH, FRAME_HEIGHT, 0.2]} />
        <meshStandardMaterial color="#cbc3b0" roughness={0.85} />
      </mesh>
      {/* lintel above the frame, a bit of built detail */}
      <mesh position={[0, FRAME_HEIGHT + 0.12, 0.06]}>
        <boxGeometry args={[FRAME_WIDTH + 0.34, 0.16, 0.3]} />
        <meshStandardMaterial color="#c2b9a4" roughness={0.9} />
      </mesh>

      <group
        ref={(g) => {
          hingeRef.current = g;
          registerRef({ hinge: hingeRef.current });
        }}
        position={[-(DOOR_WIDTH / 2), 0, 0.04]}
      >
        <mesh
          position={[DOOR_WIDTH / 2, DOOR_HEIGHT / 2 + 0.06, 0]}
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
          <meshStandardMaterial color={doorColor} roughness={0.9} />
        </mesh>
        <lineSegments position={[DOOR_WIDTH / 2, DOOR_HEIGHT / 2 + 0.06, 0]} geometry={slabEdges}>
          <lineBasicMaterial color="#2a2621" transparent opacity={0.5} />
        </lineSegments>

        {/* recessed panels — the difference between "a door" and "a grey box" */}
        {panels.map(([px, py], i) => (
          <group key={i} position={[DOOR_WIDTH / 2 + px, py, 0.07]}>
            <mesh geometry={panelGeometry}>
              <meshStandardMaterial color={hovered ? "#dfcfb4" : "#e6e1d5"} roughness={0.92} />
            </mesh>
            <lineSegments geometry={panelEdges}>
              <lineBasicMaterial color="#2a2621" transparent opacity={0.4} />
            </lineSegments>
          </group>
        ))}

        {/* handle + backplate */}
        <mesh position={[DOOR_WIDTH - 0.22, 1.62, 0.1]} geometry={plateGeometry}>
          <meshStandardMaterial color="#3a352e" roughness={0.45} metalness={0.45} />
        </mesh>
        <mesh
          position={[DOOR_WIDTH - 0.22, 1.62, 0.16]}
          geometry={handleGeometry}
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshStandardMaterial color={hovered ? "#c98a3d" : "#2a2621"} roughness={0.4} metalness={0.5} />
        </mesh>
      </group>

      {/* Signage — now on the facade well above the frame, with real
          clearance, instead of overlapping the door as it did before. */}
      <Text
        position={[0, FRAME_HEIGHT + 1.45, 0.06]}
        fontSize={0.34}
        color="#3a352e"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.16}
      >
        VARUN DHANAK
      </Text>
      <Text
        position={[0, FRAME_HEIGHT + 0.95, 0.06]}
        fontSize={0.13}
        color="#7d7768"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.24}
      >
        AI &amp; DATA SCIENCE ENGINEER
      </Text>

      {!disabled && (
        <Text
          position={[0, 0.42, 0.22]}
          fontSize={0.13}
          color={hovered ? "#c98a3d" : "#8a8578"}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.2}
        >
          {hovered ? "OPEN" : "ENTER"}
        </Text>
      )}
    </group>
  );
}
