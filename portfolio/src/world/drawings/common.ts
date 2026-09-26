import type { Pen } from "../sketch/ink";
import { art, type Art } from "../sketch/art";

type Pt = [number, number];

/** Watercolour palette — muted, pigment-like tones. */
export const C = {
  wood: "#c9975f",
  woodLight: "#dcb382",
  woodDark: "#976640",
  brick: "#c0654b",
  brickDark: "#a24f3a",
  teal: "#4a8a86",
  navy: "#46639a",
  sky: "#a9cde8",
  mustard: "#e2b44a",
  leaf: "#7fae5c",
  leafDark: "#4f7e3e",
  terracotta: "#cc7a52",
  rose: "#dd8583",
  red: "#cf5a4b",
  sticky: "#f4dc6c",
  stickyPink: "#f2a9b8",
  stickyBlue: "#9fd0e6",
  cream: "#f1e6cc",
  stone: "#b9b3a6",
  grey: "#9d9a93",
  purple: "#8f7cc0",
  brass: "#d4a94c",
  skin: "#f0c9a2",
  hair: "#3b2e28",
  hoodie: "#e0874c",
  denim: "#5875a8",
};

export function rectPts(x: number, y: number, w: number, h: number): Pt[] {
  return [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
}

/** A wooden panel: wash + outline + grain. */
export function woodPanel(p: Pen, x: number, y: number, w: number, h: number, o: { color?: string; vertical?: boolean; grain?: number } = {}) {
  p.washRect(x, y, w, h, o.color ?? C.wood);
  p.woodGrain(x + 4 * p.s, y + 4 * p.s, w - 8 * p.s, h - 8 * p.s, { vertical: o.vertical ?? true, density: o.grain ?? 0.8, alpha: 0.35 });
  p.rect(x, y, w, h, { w: 2.4 });
}

/** A recessed, bevelled panel as on a classic door. */
export function doorPanel(p: Pen, x: number, y: number, w: number, h: number, color = C.wood) {
  const b = Math.min(w, h) * 0.1;
  p.washRect(x, y, w, h, color, { alpha: 0.4 });
  p.rect(x, y, w, h, { w: 2.2 });
  p.rect(x + b, y + b, w - 2 * b, h - 2 * b, { w: 1.8 });
  // bevel corner lines
  p.line(x, y, x + b, y + b, { w: 1.2, passes: 1 });
  p.line(x + w, y, x + w - b, y + b, { w: 1.2, passes: 1 });
  p.line(x, y + h, x + b, y + h - b, { w: 1.2, passes: 1 });
  p.line(x + w, y + h, x + w - b, y + h - b, { w: 1.2, passes: 1 });
  // shade the lower & right bevels
  p.hatch(
    [
      [x + w, y],
      [x + w, y + h],
      [x + w - b, y + h - b],
      [x + w - b, y + b],
    ],
    { gap: 6, alpha: 0.35 },
  );
  p.hatch(
    [
      [x, y + h],
      [x + w, y + h],
      [x + w - b, y + h - b],
      [x + b, y + h - b],
    ],
    { gap: 6, alpha: 0.35, angle: Math.PI / 4 },
  );
}

/** A thick picture frame border around (x, y, w, h). */
export function pictureFrame(p: Pen, x: number, y: number, w: number, h: number, o: { border?: number; color?: string; mat?: boolean } = {}) {
  const b = o.border ?? Math.min(w, h) * 0.08;
  const color = o.color ?? C.woodDark;
  p.wash(
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
      [x, y],
      [x + b, y + b],
      [x + b, y + h - b],
      [x + w - b, y + h - b],
      [x + w - b, y + b],
      [x + b, y + b],
    ],
    color,
    { bleed: 2 },
  );
  p.rect(x, y, w, h, { w: 2.6 });
  p.rect(x + b, y + b, w - 2 * b, h - 2 * b, { w: 2 });
  p.line(x, y, x + b, y + b, { w: 1.2, passes: 1 });
  p.line(x + w, y, x + w - b, y + b, { w: 1.2, passes: 1 });
  p.line(x, y + h, x + b, y + h - b, { w: 1.2, passes: 1 });
  p.line(x + w, y + h, x + w - b, y + h - b, { w: 1.2, passes: 1 });
  p.hatch(
    [
      [x, y + h],
      [x + w, y + h],
      [x + w - b, y + h - b],
      [x + b, y + h - b],
    ],
    { gap: 7, alpha: 0.3 },
  );
  if (o.mat) {
    const m = b * 0.9;
    p.rect(x + b + m, y + b + m, w - 2 * (b + m), h - 2 * (b + m), { w: 1.4, passes: 1 });
  }
  return { ix: x + b, iy: y + b, iw: w - 2 * b, ih: h - 2 * b };
}

export function stickyNote(p: Pen, x: number, y: number, size: number, text: string, color = C.sticky, rot = 0) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const pt = (u: number, v: number): Pt => [x + c * u - s * v, y + s * u + c * v];
  const hs = size / 2;
  const pts = [pt(-hs, -hs), pt(hs, -hs), pt(hs, hs * 0.85), pt(hs * 0.8, hs), pt(-hs, hs)];
  p.wash(pts, color, { alpha: 0.9, always: false });
  p.poly(pts, true, { w: 1.8 });
  p.line(...pt(hs, hs * 0.85), ...pt(hs * 0.8, hs * 0.8), { w: 1.2, passes: 1 });
  p.line(...pt(hs * 0.8, hs * 0.8), ...pt(hs * 0.8, hs), { w: 1.2, passes: 1 });
  const lines = text.split("\n");
  lines.forEach((ln, i) => {
    const off = (i - (lines.length - 1) / 2) * size * 0.26;
    const [tx, ty] = pt(0, off);
    p.text(ln, tx, ty, { size: (size * 0.24) / p.s, rotate: rot, maxWidth: size * 0.9 });
  });
}

/** Simple push-pin head. */
export function pin(p: Pen, x: number, y: number, color = C.red) {
  p.washEllipse(x, y, 9 * p.s, 9 * p.s, color, { alpha: 0.95, bleed: 1 });
  p.ellipse(x, y, 9 * p.s, 9 * p.s, { w: 1.6 });
  p.ellipse(x - 3 * p.s, y - 3 * p.s, 2.5 * p.s, 2.5 * p.s, { w: 1, passes: 1 });
}

/** A taped sheet of paper, returns inner drawing area. */
export function taped(p: Pen, x: number, y: number, w: number, h: number, rot = 0, tint = "#fbfaf5") {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const pt = (u: number, v: number): Pt => [cx + c * u - s * v, cy + s * u + c * v];
  const pts = [pt(-w / 2, -h / 2), pt(w / 2, -h / 2), pt(w / 2, h / 2), pt(-w / 2, h / 2)];
  const ctx = p.ctx;
  ctx.save();
  ctx.fillStyle = tint;
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  p.poly(pts, true, { w: 1.8 });
  const tl = Math.min(w * 0.3, 120);
  p.tape(...pt(-w / 2 + 6 * p.s, -h / 2 + 4 * p.s), tl, rot - 0.7);
  p.tape(...pt(w / 2 - 6 * p.s, -h / 2 + 4 * p.s), tl, rot + 0.7);
  return { cx, cy, pt };
}

/** A generic sketched edge panel, used for the sides of boxes. */
export function edgeArt(color: string = C.wood, key = "edge"): Art {
  return art({
    key: `edge-${key}-${color}`,
    w: 256,
    h: 256,
    draw: (p) => {
      p.washRect(4, 4, 248, 248, color, { alpha: 0.6 });
      p.woodGrain(8, 8, 240, 240, { vertical: false, density: 0.5, alpha: 0.25 });
      p.rect(6, 6, 244, 244, { w: 3.2, jitter: 1 });
      p.hatchRect(6, 180, 244, 70, { gap: 10, alpha: 0.18 });
    },
  });
}

/** Plain paper edge (white objects). */
export function paperEdgeArt(key = "paper"): Art {
  return art({
    key: `paperedge-${key}`,
    w: 256,
    h: 256,
    draw: (p) => {
      p.rect(6, 6, 244, 244, { w: 3.2, jitter: 1 });
      p.hatchRect(6, 200, 244, 50, { gap: 10, alpha: 0.15 });
    },
  });
}

/** The recurring face of the guide character (front view), drawn in the style of the world. */
export function drawFace(p: Pen, cx: number, cy: number, r: number, o: { smile?: boolean; glasses?: boolean } = {}) {
  const s = r / 100;
  p.ctx.save();
  p.ctx.fillStyle = "#f8f6f0";
  p.ctx.beginPath();
  p.ctx.ellipse(cx, cy - 4 * s, r * 0.92, r * 1.08, 0, 0, Math.PI * 2);
  p.ctx.fill();
  p.ctx.restore();
  p.washEllipse(cx, cy + 6 * s, r * 0.82, r * 0.95, C.skin, { alpha: 0.8 });
  p.ellipse(cx, cy + 6 * s, r * 0.82, r * 0.95, { w: 2.4 });
  // hair — a scribbly mop with a tuft
  const hairPts: Pt[] = [];
  for (let i = 0; i <= 14; i++) {
    const t = Math.PI + (i / 14) * Math.PI;
    hairPts.push([cx + Math.cos(t) * r * 0.9, cy - 8 * s + Math.sin(t) * r * 0.86]);
  }
  hairPts.push([cx + r * 0.8, cy - 10 * s], [cx + r * 0.2, cy - 40 * s], [cx - r * 0.4, cy - 30 * s], [cx - r * 0.84, cy - 4 * s]);
  p.wash(hairPts, C.hair, { alpha: 0.9 });
  p.poly(hairPts, true, { w: 2 });
  p.scribble(cx, cy - 60 * s, r * 0.6, r * 0.25, 18, { w: 1.3 });
  p.curve(
    [
      [cx + 10 * s, cy - 95 * s],
      [cx + 26 * s, cy - 118 * s],
      [cx + 40 * s, cy - 112 * s],
    ],
    { w: 2 },
  );
  // eyes
  if (o.glasses) {
    p.ellipse(cx - 30 * s, cy + 4 * s, 20 * s, 16 * s, { w: 2 });
    p.ellipse(cx + 30 * s, cy + 4 * s, 20 * s, 16 * s, { w: 2 });
    p.line(cx - 10 * s, cy + 2 * s, cx + 10 * s, cy + 2 * s, { w: 1.8, passes: 1 });
  }
  p.ctx.save();
  p.ctx.fillStyle = "#1c1a17";
  [cx - 30 * s, cx + 30 * s].forEach((ex) => {
    p.ctx.beginPath();
    p.ctx.arc(ex, cy + 6 * s, 5 * s, 0, Math.PI * 2);
    p.ctx.fill();
  });
  p.ctx.restore();
  // smile & cheeks
  p.curve(
    [
      [cx - 22 * s, cy + 40 * s],
      [cx, cy + 54 * s],
      [cx + 22 * s, cy + 40 * s],
    ],
    { w: 2.2 },
  );
  p.washEllipse(cx - 50 * s, cy + 34 * s, 12 * s, 7 * s, C.rose, { alpha: 0.6 });
  p.washEllipse(cx + 50 * s, cy + 34 * s, 12 * s, 7 * s, C.rose, { alpha: 0.6 });
}

/**
 * Cloud / foliage cluster: outline every circle, then paint over the
 * interiors so only the outer silhouette's ink survives — the classic
 * hand-drawn "bumpy" outline.
 */
export function blobCluster(p: Pen, circles: [number, number, number][], color: string | null, o: { squash?: number; fill?: string } = {}) {
  const sq = o.squash ?? 0.85;
  circles.forEach(([x, y, r]) => p.ellipse(x, y, r, r * sq, { w: 2.4, passes: 1 }));
  const ctx = p.ctx;
  ctx.save();
  ctx.fillStyle = o.fill ?? "#f8f6f0";
  circles.forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, r - 3, r * sq - 3, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
  if (color) circles.forEach(([x, y, r]) => p.washEllipse(x, y, r - 2, r * sq - 2, color, { alpha: 0.45, bleed: 1 }));
}
