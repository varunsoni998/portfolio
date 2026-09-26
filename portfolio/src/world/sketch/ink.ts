/**
 * A tiny procedural "pen & watercolour" engine.
 *
 * Every surface in the world is drawn at runtime onto a canvas by code in
 * this folder — there are no image assets. Each drawing is rendered twice
 * from the same seed: once as a black-ink sketch on paper, once with
 * watercolour washes underneath the same ink lines. The paint-reveal
 * shader (PaintMaterial.ts) blends between the two.
 */

export const INK = "#1c1a17";
export const PAPER = "#f8f6f0";
export const HAND_FONT = "Caveat";
export const PRINT_FONT = "'Patrick Hand'";

export type Mode = "sketch" | "paint";

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface LineOpts {
  w?: number;
  jitter?: number;
  passes?: number;
  alpha?: number;
  color?: string;
  overshoot?: number;
}

type Pt = [number, number];

export class Pen {
  readonly ctx: CanvasRenderingContext2D;
  readonly mode: Mode;
  readonly w: number;
  readonly h: number;
  /** Stroke-weight scale (1 = authored at ~256px per metre). */
  readonly s: number;
  private rnd: () => number;
  private paintRnd: () => number;

  /** True when drawing onto a transparent canvas (cut-out props). */
  transparentBg = false;

  constructor(ctx: CanvasRenderingContext2D, mode: Mode, seed: number, scale = 1, size?: { w: number; h: number }) {
    this.ctx = ctx;
    this.mode = mode;
    this.w = size?.w ?? ctx.canvas.width;
    this.h = size?.h ?? ctx.canvas.height;
    this.s = scale;
    this.rnd = mulberry32(seed);
    // Paint uses its own stream so sketch & painted versions keep identical ink lines.
    this.paintRnd = mulberry32(seed ^ 0x9e3779b9);
  }

  get painting() {
    return this.mode === "paint";
  }

  r(min = 0, max = 1) {
    return min + (max - min) * this.rnd();
  }

  pr(min = 0, max = 1) {
    return min + (max - min) * this.paintRnd();
  }

  // ---------------------------------------------------------------- lines

  /** A hand-drawn line: a gently wobbling stroke, drawn in 1-2 passes. */
  line(x1: number, y1: number, x2: number, y2: number, o: LineOpts = {}) {
    const { w = 2.2, jitter = 1.4, passes = 2, alpha = 0.92, color = INK, overshoot = 0 } = o;
    const ctx = this.ctx;
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const dx = (x2 - x1) / len;
    const dy = (y2 - y1) / len;
    const nx = -dy;
    const ny = dx;
    const os = overshoot * this.s;
    const ax = x1 - dx * os * this.r(0.2, 1);
    const ay = y1 - dy * os * this.r(0.2, 1);
    const bx = x2 + dx * os * this.r(0.2, 1);
    const by = y2 + dy * os * this.r(0.2, 1);
    const segs = Math.max(2, Math.round(len / (60 * this.s)));
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    for (let p = 0; p < passes; p++) {
      const pts: Pt[] = [];
      const bow = this.r(-1, 1) * jitter * this.s * 1.5;
      for (let i = 0; i <= segs; i++) {
        const t = i / segs;
        const off = Math.sin(t * Math.PI) * bow + this.r(-1, 1) * jitter * this.s * 0.6;
        pts.push([ax + (bx - ax) * t + nx * off, ay + (by - ay) * t + ny * off]);
      }
      ctx.globalAlpha = alpha * (p === 0 ? 1 : 0.55);
      ctx.lineWidth = w * this.s * (p === 0 ? 1 : 0.7);
      this.smoothPath(pts, false);
      ctx.stroke();
    }
    ctx.restore();
  }

  private smoothPath(pts: Pt[], closed: boolean) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2;
      const my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last[0], last[1]);
    if (closed) ctx.closePath();
  }

  poly(points: Pt[], closed = true, o: LineOpts = {}) {
    for (let i = 0; i < points.length - (closed ? 0 : 1); i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      this.line(a[0], a[1], b[0], b[1], { overshoot: 4, ...o });
    }
  }

  rect(x: number, y: number, w: number, h: number, o: LineOpts = {}) {
    this.poly(
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ],
      true,
      { overshoot: 5, ...o },
    );
  }

  /** Wobbly ellipse with the characteristic overlapping start/end of a hand-drawn circle. */
  ellipse(cx: number, cy: number, rx: number, ry: number, o: LineOpts = {}) {
    const { w = 2.2, alpha = 0.92, color = INK, passes = 2, jitter = 1.2 } = o;
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    for (let p = 0; p < passes; p++) {
      const start = this.r(0, Math.PI * 2);
      const sweep = Math.PI * 2 + this.r(0.1, 0.35);
      const n = 28;
      const pts: Pt[] = [];
      const wob = this.r(0.02, 0.05);
      for (let i = 0; i <= n; i++) {
        const t = start + (sweep * i) / n;
        const k = 1 + Math.sin(t * 3 + p) * wob + this.r(-1, 1) * 0.008 * jitter;
        pts.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k]);
      }
      ctx.globalAlpha = alpha * (p === 0 ? 1 : 0.5);
      ctx.lineWidth = w * this.s * (p === 0 ? 1 : 0.7);
      this.smoothPath(pts, false);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** Freehand curve through points. */
  curve(points: Pt[], o: LineOpts = {}) {
    const { w = 2.2, alpha = 0.92, color = INK, jitter = 1 } = o;
    const pts = points.map(([x, y]) => [x + this.r(-1, 1) * jitter * this.s, y + this.r(-1, 1) * jitter * this.s] as Pt);
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = alpha;
    ctx.lineWidth = w * this.s;
    this.smoothPath(pts, false);
    ctx.stroke();
    ctx.restore();
  }

  /** Parallel hatching clipped to a polygon — the sketch's only form of shading. */
  hatch(points: Pt[], o: { angle?: number; gap?: number; w?: number; alpha?: number; color?: string } = {}) {
    const { angle = -Math.PI / 4, gap = 9, w = 1.1, alpha = 0.45, color = INK } = o;
    const ctx = this.ctx;
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const R = Math.hypot(maxX - minX, maxY - minY) / 2 + 4;
    ctx.save();
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.clip();
    const g = gap * this.s;
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    for (let d = -R; d <= R; d += g * this.r(0.8, 1.2)) {
      const px = cx - sa * d;
      const py = cy + ca * d;
      this.line(px - ca * R, py - sa * R, px + ca * R, py + sa * R, { w, alpha, color, passes: 1, jitter: 0.8 });
    }
    ctx.restore();
  }

  hatchRect(x: number, y: number, w: number, h: number, o: Parameters<Pen["hatch"]>[1] = {}) {
    this.hatch(
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ],
      o,
    );
  }

  /** Random short scribble strokes — texture for foliage, hair, rough surfaces. */
  scribble(cx: number, cy: number, rx: number, ry: number, n = 30, o: LineOpts = {}) {
    for (let i = 0; i < n; i++) {
      const a = this.r(0, Math.PI * 2);
      const rr = Math.sqrt(this.r());
      const x = cx + Math.cos(a) * rx * rr;
      const y = cy + Math.sin(a) * ry * rr;
      const l = this.r(6, 16) * this.s;
      const b = this.r(0, Math.PI);
      this.line(x, y, x + Math.cos(b) * l, y + Math.sin(b) * l, { w: 1.4, passes: 1, alpha: 0.7, ...o });
    }
  }

  dots(x: number, y: number, w: number, h: number, n: number, o: { r?: number; alpha?: number; color?: string } = {}) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = o.color ?? INK;
    ctx.globalAlpha = o.alpha ?? 0.35;
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.arc(x + this.r() * w, y + this.r() * h, (o.r ?? 1.2) * this.s * this.r(0.5, 1.2), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- text

  text(
    str: string,
    x: number,
    y: number,
    o: { size?: number; font?: string; weight?: number; align?: CanvasTextAlign; color?: string; rotate?: number; alpha?: number; maxWidth?: number } = {},
  ) {
    const { size = 48, font = HAND_FONT, weight = 700, align = "center", color = INK, rotate = 0, alpha = 0.95, maxWidth } = o;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.font = `${weight} ${size * this.s}px ${font}, cursive`;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fillText(str, 0, 0, maxWidth);
    ctx.restore();
  }

  // ---------------------------------------------------------------- paint

  /**
   * Watercolour wash inside a polygon. Only drawn in "paint" mode — in the
   * sketch version the same area is left as bare paper, which is exactly
   * what the reveal shader then fills in.
   */
  wash(points: Pt[], color: string, o: { alpha?: number; bleed?: number; always?: boolean } = {}) {
    const ctx = this.ctx;
    const s = this.s;
    if (this.transparentBg) {
      // cut-outs need an opaque paper body underneath, in both versions
      ctx.save();
      ctx.fillStyle = PAPER;
      ctx.beginPath();
      points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    if (!this.painting && !o.always) return;
    const { alpha = 0.78, bleed = this.transparentBg ? 0 : 4 } = o;
    const jitterPoly = (amt: number) =>
      points.map(([x, y]) => [x + this.pr(-amt, amt) * s, y + this.pr(-amt, amt) * s] as Pt);
    const fillPoly = (pts: Pt[]) => {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
    };
    ctx.save();
    ctx.fillStyle = color;
    // body of the wash, built up in a few slightly misregistered layers
    ctx.globalAlpha = alpha * 0.55;
    fillPoly(jitterPoly(bleed));
    ctx.fill();
    for (let i = 0; i < 2; i++) {
      ctx.globalAlpha = alpha * 0.22;
      fillPoly(jitterPoly(bleed * 1.6));
      ctx.fill();
    }
    // pigment pooling at the edge — the tell-tale watercolour rim
    ctx.globalAlpha = alpha * 0.35;
    ctx.lineWidth = 3.2 * s;
    ctx.strokeStyle = color;
    fillPoly(jitterPoly(bleed * 0.6));
    ctx.stroke();
    // blooms: darker and lighter blotches inside the shape
    fillPoly(points);
    ctx.clip();
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const area = (maxX - minX) * (maxY - minY);
    const blooms = Math.min(40, 4 + Math.round(area / (9000 * s * s)));
    for (let i = 0; i < blooms; i++) {
      const bx = this.pr(minX, maxX);
      const by = this.pr(minY, maxY);
      const br = this.pr(0.05, 0.25) * Math.min(maxX - minX, maxY - minY) + 4 * s;
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      const dark = this.pr() > 0.5;
      g.addColorStop(0, dark ? color : "rgba(255,255,255,0.9)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalAlpha = dark ? 0.16 : 0.2;
      ctx.fillStyle = g;
      ctx.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    ctx.restore();
  }

  washRect(x: number, y: number, w: number, h: number, color: string, o: Parameters<Pen["wash"]>[2] = {}) {
    this.wash(
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ],
      color,
      o,
    );
  }

  washEllipse(cx: number, cy: number, rx: number, ry: number, color: string, o: Parameters<Pen["wash"]>[2] = {}) {
    const pts: Pt[] = [];
    for (let i = 0; i < 24; i++) {
      const t = (i / 24) * Math.PI * 2;
      pts.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]);
    }
    this.wash(pts, color, o);
  }

  // ---------------------------------------------------------------- materials

  /** Paper background with fine grain & fibres. */
  paper(tint = PAPER) {
    const ctx = this.ctx;
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, this.w, this.h);
    this.dots(0, 0, this.w, this.h, Math.round((this.w * this.h) / 900), { r: 0.8, alpha: 0.06 });
    for (let i = 0; i < (this.w * this.h) / 20000; i++) {
      const x = this.r(0, this.w);
      const y = this.r(0, this.h);
      const a = this.r(0, Math.PI);
      const l = this.r(4, 14) * this.s;
      this.line(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, { w: 0.6, passes: 1, alpha: 0.08 });
    }
  }

  /** Long wavy wood-grain lines, with the odd knot. */
  woodGrain(x: number, y: number, w: number, h: number, o: { vertical?: boolean; density?: number; alpha?: number } = {}) {
    const { vertical = false, density = 1, alpha = 0.5 } = o;
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    const across = vertical ? w : h;
    const along = vertical ? h : w;
    const n = Math.max(3, Math.round((across / (11 * this.s)) * density));
    for (let i = 0; i < n; i++) {
      const base = (i + this.r(-0.3, 0.3)) * (across / n);
      const pts: Pt[] = [];
      const steps = 8;
      const amp = this.r(1, 4) * this.s;
      const ph = this.r(0, 6);
      const start = this.r(-0.2, 0.3) * along;
      const end = along * this.r(0.7, 1.2);
      for (let k = 0; k <= steps; k++) {
        const t = start + ((end - start) * k) / steps;
        const off = Math.sin(t / (40 * this.s) + ph) * amp;
        pts.push(vertical ? [x + base + off, y + t] : [x + t, y + base + off]);
      }
      this.curve(pts, { w: this.r(0.7, 1.3), alpha: alpha * this.r(0.5, 1) });
    }
    const knots = Math.round((w * h) / (160000 * this.s * this.s) * density);
    for (let i = 0; i < knots; i++) {
      const kx = x + this.r(0.1, 0.9) * w;
      const ky = y + this.r(0.1, 0.9) * h;
      const kr = this.r(5, 12) * this.s;
      this.ellipse(kx, ky, vertical ? kr * 0.6 : kr * 1.8, vertical ? kr * 1.8 : kr * 0.6, { w: 1, passes: 1, alpha: alpha * 0.9 });
      this.ellipse(kx, ky, vertical ? kr * 0.3 : kr, vertical ? kr : kr * 0.3, { w: 0.9, passes: 1, alpha: alpha * 0.8 });
    }
    ctx.restore();
  }

  /** Strip of masking tape (paint: soft blue) — used to "stick" drawings onto doors & walls. */
  tape(cx: number, cy: number, len: number, angle: number, color = "#7fa4d9") {
    const ctx = this.ctx;
    const hw = len / 2;
    const hh = len * 0.16;
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    const pt = (u: number, v: number): Pt => [cx + ca * u - sa * v, cy + sa * u + ca * v];
    const pts = [pt(-hw, -hh), pt(hw, -hh), pt(hw, hh), pt(-hw, hh)];
    ctx.save();
    ctx.fillStyle = this.painting ? color : "#e9e6de";
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    this.poly(pts, true, { w: 1.3, passes: 1, alpha: 0.7 });
  }
}
