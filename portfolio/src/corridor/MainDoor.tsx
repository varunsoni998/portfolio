import { useMemo, useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { pointAt, tangentAt } from "./corridorPath";

/**
 * The bright doorway centered at the far end of the hallway — distinct
 * from the side doors (Work/AI Lab/About/Contact): it's not set into a
 * wall, it's the literal end of the corridor, glowing rather than paper-
 * toned, matching the lit archway visible at the end of the hall in the
 * reference. Reaching it (or clicking it) exits into the homepage, same
 * as scrolling to the very end.
 */
export default function MainDoor({ progress, onSelect }: { progress: number; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  const position = pointAt(progress);
  const tangent = tangentAt(progress);
  const yaw = Math.atan2(tangent.x, tangent.z);

  const frameGeometry = useMemo(() => new THREE.BoxGeometry(2.6, 3.4, 0.1), []);
  const frameEdges = useMemo(() => new THREE.EdgesGeometry(frameGeometry), [frameGeometry]);

  return (
    <group
      position={[position.x, 0, position.z]}
      rotation={[0, yaw + Math.PI, 0]}
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
        onSelect();
      }}
    >
      {/* warm glow filling the doorway, brighter on hover */}
      <pointLight position={[0, 1.7, -0.3]} intensity={hovered ? 3.5 : 2.2} color="#fff4e0" distance={6} />
      <mesh position={[0, 1.7, -0.05]}>
        <planeGeometry args={[2.3, 3.1]} />
        <meshBasicMaterial color="#fff8ec" />
      </mesh>

      <mesh position={[0, 1.7, 0]} geometry={frameGeometry}>
        <meshStandardMaterial color={hovered ? "#c98a3d" : "#d8d2c4"} roughness={0.8} />
      </mesh>
      <lineSegments position={[0, 1.7, 0.06]} geometry={frameEdges}>
        <lineBasicMaterial color="#2a2621" transparent opacity={0.5} />
      </lineSegments>

      <Text
        position={[0, 3.55, 0.07]}
        fontSize={0.24}
        color={hovered ? "#c98a3d" : "#4a453d"}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        ENTER
      </Text>
    </group>
  );
}
