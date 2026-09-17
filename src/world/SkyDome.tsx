import { useMemo } from "react";
import * as THREE from "three";

/**
 * A large inverted sphere with a vertical gradient texture — a cheap
 * "sky dome" so the world reads as an atmosphere rather than a flat
 * single fog color behind everything. Generated the same way as the
 * paper-grain texture (a canvas, not an image asset).
 */
export default function SkyDome() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, "#c9c0a8"); // top — slightly deeper
    gradient.addColorStop(0.55, "#dcd6c6"); // matches fog color at the horizon
    gradient.addColorStop(1, "#e8e2cf"); // bottom, warmer near the ground
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 8, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[90, 24, 24]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} fog={false} />
    </mesh>
  );
}
