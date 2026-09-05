import * as THREE from "three";

/**
 * Generates a paper-grain texture on a canvas (subtle noise + faint fibers)
 * instead of loading a scanned/hand-drawn asset — there is no art pipeline
 * here, so this is a procedural stand-in aimed at the same "paper, not
 * plastic" feel. Cached per call size since it's only built a handful of
 * times (walls, floor, ceiling).
 */
export function makePaperTexture(size = 512, tint = "#efebe1"): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, size, size);

  // Fine grain noise
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 14;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);

  // Faint fiber strokes for a "paper" rather than "plastic" read
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = "#000000";
  for (let i = 0; i < 120; i++) {
    ctx.beginPath();
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 6 + Math.random() * 18;
    const angle = Math.random() * Math.PI * 2;
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
