import * as THREE from "three";
import { Pen, hashString, type Mode } from "./ink";

export interface Art {
  key: string;
  sketch: THREE.CanvasTexture;
  paint: THREE.CanvasTexture;
  /** width / height of the drawing, handy for sizing planes to match. */
  aspect: number;
  transparent: boolean;
}

export interface ArtSpec {
  /** Unique cache key. */
  key: string;
  /** Canvas size in px. */
  w: number;
  h: number;
  /** Leave the background transparent (cut-out props like plants and lamps). */
  transparent?: boolean;
  /** Tile the texture (walls, floors). */
  repeat?: boolean;
  /** Background tint (ignored for transparent art). */
  tint?: string;
  /** Stroke-weight multiplier for unusually dense/sparse canvases. */
  scale?: number;
  /** Only ever shown as a sketch: skip the painted version (saves memory). */
  sketchOnly?: boolean;
  draw: (pen: Pen) => void;
}

const cache = new Map<string, Art>();
let maxAniso = 4;
/** Global texture resolution multiplier — lowered on small / low-power devices. */
let resolution = 1;

export function setArtResolution(r: number) {
  resolution = r;
}

export function setMaxAnisotropy(v: number) {
  maxAniso = Math.min(8, v);
}

function render(spec: ArtSpec, mode: Mode): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(8, Math.round(spec.w * resolution));
  canvas.height = Math.max(8, Math.round(spec.h * resolution));
  const ctx = canvas.getContext("2d")!;
  ctx.scale(canvas.width / spec.w, canvas.height / spec.h);
  const pen = new Pen(ctx, mode, hashString(spec.key), spec.scale ?? 1, { w: spec.w, h: spec.h });
  if (!spec.transparent) pen.paper(spec.tint);
  else pen.transparentBg = true;
  spec.draw(pen);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  if (spec.repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  }
  return tex;
}

/** Draw (or fetch from cache) a sketch + painted texture pair. */
export function art(spec: ArtSpec): Art {
  const hit = cache.get(spec.key);
  if (hit) return hit;
  const sketch = render(spec, "sketch");
  const a: Art = {
    key: spec.key,
    sketch,
    paint: spec.sketchOnly ? sketch : render(spec, "paint"),
    aspect: spec.w / spec.h,
    transparent: !!spec.transparent,
  };
  cache.set(spec.key, a);
  return a;
}

// ------------------------------------------------------------------ material

const NOISE_GLSL = /* glsl */ `
uniform sampler2D uPaint;
uniform float uReveal;
uniform vec2 uOrigin;
float pr_hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
float pr_noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(pr_hash(i), pr_hash(i+vec2(1,0)), u.x), mix(pr_hash(i+vec2(0,1)), pr_hash(i+vec2(1,1)), u.x), u.y);
}
float pr_fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  for(int i=0;i<4;i++){ v += a*pr_noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
`;

const MAP_GLSL = /* glsl */ `
#ifdef USE_MAP
  vec4 skC = texture2D( map, vMapUv );
  vec4 paC = texture2D( uPaint, vMapUv );
  // Organic, ink-bleed shaped reveal front spreading out from uOrigin.
  float n = pr_fbm(vMapUv * 6.0 + uOrigin * 3.0);
  float d = distance(vMapUv, uOrigin) + (n - 0.5) * 0.45;
  float r = uReveal * 1.75;
  float m = 1.0 - smoothstep(r - 0.14, r, d);
  m *= step(0.001, uReveal);
  vec4 texel = mix(skC, paC, m);
  // a faint darker "wet edge" riding the front of the reveal
  float edge = smoothstep(r - 0.14, r - 0.05, d) * (1.0 - smoothstep(r - 0.05, r, d)) * step(0.001, uReveal) * step(uReveal, 0.999);
  texel.rgb *= 1.0 - edge * 0.12;
  diffuseColor *= texel;
#endif
`;

export interface PaintUniforms {
  uPaint: { value: THREE.Texture };
  uReveal: { value: number };
  uOrigin: { value: THREE.Vector2 };
}

export type PaintMaterial = THREE.MeshBasicMaterial & { userData: { uniforms: PaintUniforms } };

/**
 * An unlit MeshBasicMaterial (so it keeps fog, colour management, alpha
 * testing, etc.) with its map lookup patched to blend between the sketch
 * and the painted version of a drawing.
 */
export function makePaintMaterial(a: Art, o: { side?: THREE.Side; reveal?: number } = {}): PaintMaterial {
  const mat = new THREE.MeshBasicMaterial({
    map: a.sketch,
    transparent: false,
    alphaTest: a.transparent ? 0.35 : 0,
    side: o.side ?? THREE.FrontSide,
  }) as PaintMaterial;
  const uniforms: PaintUniforms = {
    uPaint: { value: a.paint },
    uReveal: { value: o.reveal ?? 0 },
    uOrigin: { value: new THREE.Vector2(0.5, 0.5) },
  };
  mat.userData.uniforms = uniforms;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${NOISE_GLSL}`)
      .replace("#include <map_fragment>", MAP_GLSL);
  };
  mat.customProgramCacheKey = () => "paint-reveal-v1";
  return mat;
}

/** Plain sketch-only material (cheaper — for big surfaces that never paint). */
export function makeSketchMaterial(tex: THREE.Texture, o: { side?: THREE.Side; transparent?: boolean } = {}) {
  return new THREE.MeshBasicMaterial({
    map: tex,
    side: o.side ?? THREE.FrontSide,
    alphaTest: o.transparent ? 0.35 : 0,
  });
}

/** Scale a PlaneGeometry's UVs so a repeating texture tiles at `tileW` x `tileH` world units. */
export function tiledPlane(width: number, height: number, tileW: number, tileH: number, offsetU = 0, offsetV = 0) {
  const g = new THREE.PlaneGeometry(width, height);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getX(i) * (width / tileW) + offsetU, uv.getY(i) * (height / tileH) + offsetV);
  }
  uv.needsUpdate = true;
  return g;
}
