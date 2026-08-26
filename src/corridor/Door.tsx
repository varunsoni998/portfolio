import { useMemo, useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import type { CorridorDoor } from "./corridorConfig";
import { doorPosition, doorYaw } from "./corridorPath";

export default function Door({ door, onSelect }: { door: CorridorDoor; onSelect: (door: CorridorDoor) => void }) {
  const [hovered, setHovered] = useState(false);
  const position = doorPosition(door.progress, door.side);
  const yaw = doorYaw(door.progress, door.side);
  const frameGeometry = useMemo(() => new THREE.BoxGeometry(1.5, 2.6, 0.08), []);
  const frameEdges = useMemo(() => new THREE.EdgesGeometry(frameGeometry), [frameGeometry]);

  return (
    <group
      position={[position.x, 0, position.z]}
      rotation={[0, yaw, 0]}
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
        onSelect(door);
      }}
    >
      {/* door frame */}
      <mesh position={[0, 1.3, 0]} geometry={frameGeometry}>
        <meshStandardMaterial color={hovered ? "#c98a3d" : "#d8d2c4"} roughness={0.85} />
      </mesh>
      <lineSegments position={[0, 1.3, 0.05]} geometry={frameEdges}>
        <lineBasicMaterial color="#2a2621" transparent opacity={0.5} />
      </lineSegments>

      <Text
        position={[0, 2.85, 0.06]}
        fontSize={0.22}
        color={hovered ? "#c98a3d" : "#4a453d"}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        {door.label}
      </Text>
    </group>
  );
}
