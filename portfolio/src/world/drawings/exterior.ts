import { art } from "../sketch/art";
import { PRINT_FONT } from "../sketch/ink";
import { C, blobCluster, doorPanel, rectPts } from "./common";

type Pt = [number, number];

export const FACADE = { w: 18, h: 6.5, doorW: 2.8, doorH: 3.35 };

/** Brick facade with a real door opening; the drawing maps 1:1 onto the facade geometry. */
export function facadeArt() {
  const W = 2048;
  const H = Math.round((W * FACADE.h) / FACADE.w);
  const k = W / FACADE.w; // px per metre
  const X = (x: number) => (x + FACADE.w / 2) * k;
  const Y = (y: number) => (FACADE.h - y) * k;
  return art({
    key: "facade",
    w: W,
    h: H,
    scale: 0.75,
    draw: (p) => {
      const dx0 = X(-FACADE.doorW / 2 - 0.3);
      const dx1 = X(FACADE.doorW / 2 + 0.3);
      const dTop = Y(FACADE.doorH + 0.45);
      // wall base wash
      p.washRect(0, Y(6.0), W, Y(0.35) - Y(6.0), C.brick, { alpha: 0.55, bleed: 6 });
      // bricks
      const bh = 0.15 * k;
      const bw = 0.44 * k;
      let row = 0;
      for (let y = Y(0.35); y > Y(6.0) + 1; y -= bh, row++) {
        const top = Math.max(Y(6.0), y - bh);
        const inDoorBand = top < Y(0) && y > dTop;
        // mortar line
        if (!inDoorBand) p.line(0, top, W, top, { w: 1.1, passes: 1, jitter: 1.2, alpha: 0.55 });
        else {
          p.line(0, top, dx0, top, { w: 1.1, passes: 1, alpha: 0.55 });
          p.line(dx1, top, W, top, { w: 1.1, passes: 1, alpha: 0.55 });
        }
        const off = row % 2 ? bw / 2 : 0;
        for (let x = -off; x < W; x += bw) {
          const jx = x + bw;
          const inDoor = jx > dx0 && jx < dx1 && top > dTop - 2;
          if (!inDoor && jx > 0 && jx < W) p.line(jx, top, jx, y, { w: 1.1, passes: 1, jitter: 0.6, alpha: 0.55 });
          const inside = x + bw > dx0 && x < dx1 && top > dTop - 2;
          if (inside) continue;
          // brick-to-brick tone variation (paint), and the odd hatched brick (sketch)
          const rr = p.r();
          if (p.painting) {
            const ctx = p.ctx;
            ctx.save();
            ctx.globalAlpha = p.pr(0.04, 0.22);
            ctx.fillStyle = p.pr() > 0.5 ? C.brickDark : "#e8b39a";
            ctx.fillRect(x + 2, top + 2, bw - 4, bh - 4);
            ctx.restore();
          }
          if (rr < 0.05) p.hatchRect(x + 3, top + 3, bw - 6, bh - 6, { gap: 5, alpha: 0.35 });
        }
      }
      // plinth
      p.washRect(0, Y(0.35), W, Y(0) - Y(0.35), C.stone, { alpha: 0.8 });
      p.line(0, Y(0.35), W, Y(0.35), { w: 2.4 });
      for (let x = 0; x < W; x += 0.9 * k) if (x < dx0 || x > dx1) p.line(x, Y(0.35), x, Y(0), { w: 1.4, passes: 1 });
      p.hatchRect(0, Y(0.12), W, Y(0) - Y(0.12), { gap: 6, alpha: 0.3 });
      // cornice
      p.washRect(0, 0, W, Y(6.0), C.cream, { alpha: 0.85 });
      p.line(0, Y(6.0), W, Y(6.0), { w: 2.6 });
      p.line(0, Y(6.12), W, Y(6.12), { w: 1.6 });
      p.line(0, Y(6.35), W, Y(6.35), { w: 2 });
      for (let x = 10; x < W; x += 0.3 * k) p.rect(x, Y(6.12), 0.14 * k, Y(6.0) - Y(6.12), { w: 1.1, passes: 1 });
      p.hatchRect(0, Y(6.12), W, Y(6.0) - Y(6.12), { gap: 5, alpha: 0.25 });
      // stone door surround: quoins either side + a lintel with keystone
      const qW = 0.32 * k;
      const edgeL = X(-FACADE.doorW / 2);
      const edgeR = X(FACADE.doorW / 2);
      for (let i = 0; i < 6; i++) {
        const y1 = Y((i * FACADE.doorH) / 6);
        const y0 = Y(((i + 1) * FACADE.doorH) / 6);
        const wide = i % 2 ? qW : qW * 0.72;
        [
          [edgeL - wide, y0, wide, y1 - y0],
          [edgeR, y0, wide, y1 - y0],
        ].forEach(([x, y, w, h]) => {
          p.washRect(x, y, w, h, C.stone, { alpha: 0.85, bleed: 2 });
          p.rect(x, y, w, h, { w: 2 });
          p.dots(x + 4, y + 4, w - 8, h - 8, 10, { alpha: 0.3 });
        });
      }
      const lintelY = Y(FACADE.doorH + 0.42);
      const lintelPts: Pt[] = rectPts(edgeL - qW, lintelY, edgeR - edgeL + 2 * qW, Y(FACADE.doorH) - lintelY);
      p.wash(lintelPts, C.stone, { alpha: 0.85 });
      p.poly(lintelPts, true, { w: 2.2 });
      const kx = (edgeL + edgeR) / 2;
      const key: Pt[] = [
        [kx - 0.22 * k, lintelY - 0.08 * k],
        [kx + 0.22 * k, lintelY - 0.08 * k],
        [kx + 0.15 * k, Y(FACADE.doorH)],
        [kx - 0.15 * k, Y(FACADE.doorH)],
      ];
      p.wash(key, C.cream, { alpha: 0.9 });
      p.poly(key, true, { w: 2.2 });
      p.text("01", kx, (lintelY + Y(FACADE.doorH)) / 2 - 2, { size: 26, font: PRINT_FONT, weight: 400 });
      // shadow inside the opening's top edge
      p.hatchRect(edgeL, Y(FACADE.doorH), edgeR - edgeL, 0.12 * k, { gap: 5, alpha: 0.4 });
      // drainpipe
      const px = X(8.2);
      p.washRect(px - 8, Y(6.1), 16, Y(0.2) - Y(6.1), C.grey, { alpha: 0.8 });
      p.line(px - 8, Y(6.1), px - 8, Y(0.2), { w: 2 });
      p.line(px + 8, Y(6.1), px + 8, Y(0.2), { w: 2 });
      for (let y = 1; y < 6; y += 1.2) p.rect(px - 11, Y(y), 22, 8, { w: 1.4, passes: 1 });
      // a chalk doodle on the plinth, like a kid passed by
      p.text("hi :)", X(5.8), Y(0.6), { size: 30, rotate: -0.1, alpha: 0.6 });
      p.curve(
        [
          [X(5.2), Y(0.47)],
          [X(5.8), Y(0.44)],
          [X(6.4), Y(0.48)],
        ],
        { w: 1.4, alpha: 0.5 },
      );
    },
  });
}

/** One leaf of the main double door. The right leaf is the mirror image. */
export function mainDoorArt(side: "left" | "right") {
  const W = 448;
  const H = 1056;
  return art({
    key: `main-door-${side}`,
    w: W,
    h: H,
    draw: (p) => {
      const ctx = p.ctx;
      if (side === "right") {
        ctx.translate(W, 0);
        ctx.scale(-1, 1);
      }
      // stiles & rails as one teal-painted slab
      p.washRect(0, 0, W, H, C.teal, { alpha: 0.85, bleed: 1 });
      p.woodGrain(10, 10, W - 20, H - 20, { vertical: true, density: 0.6, alpha: 0.22 });
      p.rect(4, 4, W - 8, H - 8, { w: 3 });
      // arched glazing: the two leaves together form one arch
      const gx0 = 60;
      const gx1 = W - 40;
      const gBottom = 430;
      const cx = W; // arch centre sits on the meeting edge
      const R = W - 60;
      const cy = 110 + R * 0.55;
      const arch: Pt[] = [[gx0, gBottom]];
      for (let i = 0; i <= 20; i++) {
        const a = Math.PI + (i / 20) * (Math.PI / 2 - 0.02);
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R * 0.62;
        if (x <= gx1) arch.push([x, y]);
      }
      arch.push([gx1, gBottom]);
      p.wash(arch, C.sky, { alpha: 0.9 });
      if (!p.painting) p.hatch(arch, { gap: 16, alpha: 0.12, angle: -1.1 });
      p.poly(arch, true, { w: 2.6 });
      // reflection streaks
      p.line(gx0 + 50, gBottom - 40, gx0 + 150, gBottom - 190, { w: 3, alpha: 0.35 });
      p.line(gx0 + 90, gBottom - 30, gx0 + 170, gBottom - 150, { w: 2, alpha: 0.3 });
      // glazing bars
      p.line((gx0 + gx1) / 2, 150, (gx0 + gx1) / 2, gBottom, { w: 3 });
      p.line(gx0, 300, gx1, 300, { w: 3 });
      // mid rail with a letter slot
      p.rect(90, 520, 230, 36, { w: 2.2 });
      p.washRect(96, 526, 218, 24, C.brass, { alpha: 0.9 });
      p.hatchRect(100, 530, 210, 16, { gap: 4, alpha: 0.5 });
      // two raised panels
      doorPanel(p, 60, 610, W - 100, 170, C.teal);
      doorPanel(p, 60, 810, W - 100, 190, C.teal);
      // long brass pull on the meeting edge
      const hx = W - 26;
      p.washRect(hx - 9, 420, 18, 260, C.brass, { alpha: 0.95 });
      p.rect(hx - 9, 420, 18, 260, { w: 2.2 });
      p.line(hx + 3, 430, hx + 3, 670, { w: 1.2, alpha: 0.5, passes: 1 });
      // kick plate
      p.washRect(20, H - 70, W - 40, 50, C.brass, { alpha: 0.7 });
      p.rect(20, H - 70, W - 40, 50, { w: 2 });
      p.dots(24, H - 66, W - 48, 42, 30, { alpha: 0.25 });
    },
  });
}

export function signArt(name: string, role: string) {
  return art({
    key: `sign-${name}`,
    w: 1024,
    h: 300,
    draw: (p) => {
      const pts: Pt[] = [
        [30, 40],
        [994, 30],
        [1000, 262],
        [24, 270],
      ];
      p.wash(pts, C.wood, { alpha: 0.85 });
      p.woodGrain(34, 44, 956, 216, { density: 0.9, alpha: 0.28 });
      p.poly(pts, true, { w: 3.4 });
      p.poly(
        [
          [52, 60],
          [972, 52],
          [976, 242],
          [48, 248],
        ],
        true,
        { w: 1.6, passes: 1 },
      );
      p.text(name, 512, 130, { size: 132 });
      p.text(role, 512, 212, { size: 44, font: PRINT_FONT, weight: 400 });
      // screws
      [
        [70, 80],
        [954, 74],
        [956, 228],
        [68, 232],
      ].forEach(([x, y]) => {
        p.ellipse(x, y, 8, 8, { w: 1.6 });
        p.line(x - 5, y - 5, x + 5, y + 5, { w: 1.2, passes: 1 });
      });
    },
  });
}

export function windowArt() {
  return art({
    key: "window-front",
    w: 560,
    h: 720,
    transparent: true,
    draw: (p) => {
      // shutters
      const shutter = (x: number) => {
        p.washRect(x, 40, 90, 500, C.leafDark, { alpha: 0.8 });
        p.rect(x, 40, 90, 500, { w: 2.4 });
        for (let y = 70; y < 520; y += 26) p.line(x + 10, y, x + 80, y + 8, { w: 1.4, passes: 1 });
      };
      shutter(8);
      shutter(462);
      // frame + sill
      p.washRect(100, 30, 360, 520, C.cream, { alpha: 0.95 });
      p.rect(100, 30, 360, 520, { w: 3 });
      // glass
      const g = rectPts(126, 56, 308, 468);
      p.wash(g, C.sky, { alpha: 0.75 });
      const ctx = p.ctx;
      if (!p.painting) {
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 0.9;
        ctx.fillRect(126, 56, 308, 468);
        ctx.restore();
      }
      p.poly(g, true, { w: 2.2 });
      // inside: a curtain and a little robot on the sill
      p.wash(
        [
          [130, 60],
          [220, 60],
          [200, 300],
          [228, 520],
          [130, 520],
        ],
        C.rose,
        { alpha: 0.75 },
      );
      p.curve(
        [
          [220, 60],
          [196, 180],
          [206, 300],
          [228, 520],
        ],
        { w: 2 },
      );
      for (let i = 0; i < 4; i++)
        p.curve(
          [
            [150 + i * 16, 64],
            [146 + i * 14, 300],
            [150 + i * 18, 516],
          ],
          { w: 1.1, alpha: 0.5 },
        );
      // robot
      p.washRect(310, 430, 70, 60, C.grey, { alpha: 0.8 });
      p.rect(310, 430, 70, 60, { w: 2 });
      p.washRect(318, 380, 54, 46, C.stone, { alpha: 0.8 });
      p.rect(318, 380, 54, 46, { w: 2 });
      p.ellipse(333, 400, 6, 6, { w: 1.6 });
      p.ellipse(357, 400, 6, 6, { w: 1.6 });
      p.line(345, 380, 345, 360, { w: 1.6 });
      p.washEllipse(345, 356, 6, 6, C.red, { alpha: 1 });
      p.ellipse(345, 356, 6, 6, { w: 1.6 });
      p.curve(
        [
          [335, 414],
          [345, 419],
          [355, 414],
        ],
        { w: 1.4 },
      );
      // glazing bars
      p.line(280, 56, 280, 524, { w: 3.2 });
      p.line(126, 290, 434, 290, { w: 3.2 });
      p.line(150, 480, 260, 120, { w: 2, alpha: 0.25 });
      // sill
      p.washRect(80, 540, 400, 30, C.stone, { alpha: 0.9 });
      p.rect(80, 540, 400, 30, { w: 2.4 });
      p.hatchRect(84, 560, 392, 10, { gap: 4, alpha: 0.4 });
      // flower box
      p.washRect(110, 600, 340, 90, C.terracotta, { alpha: 0.85 });
      p.rect(110, 600, 340, 90, { w: 2.4 });
      p.line(110, 620, 450, 620, { w: 1.4, passes: 1 });
      for (let i = 0; i < 9; i++) {
        const fx = 130 + i * 37;
        const fy = 590 - (i % 3) * 18;
        p.line(fx, 600, fx + p.r(-6, 6), fy, { w: 1.4, passes: 1 });
        p.washEllipse(fx, fy, 14, 14, i % 2 ? C.red : C.mustard, { alpha: 0.9 });
        p.ellipse(fx, fy, 14, 14, { w: 1.6, passes: 1 });
        p.ellipse(fx, fy, 4, 4, { w: 1.2, passes: 1 });
      }
      p.washEllipse(280, 598, 170, 20, C.leaf, { alpha: 0.8 });
      p.scribble(280, 598, 160, 14, 40, { w: 1.2 });
    },
  });
}

export function treeArt() {
  return art({
    key: "tree",
    w: 768,
    h: 1152,
    transparent: true,
    draw: (p) => {
      const trunk: Pt[] = [
        [350, 1140],
        [340, 800],
        [300, 640],
        [330, 620],
        [372, 760],
        [400, 600],
        [436, 612],
        [420, 820],
        [430, 1140],
      ];
      p.wash(trunk, C.woodDark, { alpha: 0.9 });
      p.poly(trunk, false, { w: 2.6 });
      for (let i = 0; i < 12; i++) p.line(360 + p.r(0, 50), 820 + i * 26, 368 + p.r(0, 50), 840 + i * 26, { w: 1.1, passes: 1 });
      blobCluster(
        p,
        [
          [384, 400, 230],
          [200, 470, 150],
          [570, 470, 150],
          [270, 250, 160],
          [500, 250, 160],
          [384, 160, 140],
          [300, 580, 130],
          [470, 580, 130],
        ],
        C.leaf,
      );
      p.washEllipse(470, 500, 150, 110, C.leafDark, { alpha: 0.5 });
      for (let i = 0; i < 26; i++) {
        const a = p.r(0, Math.PI * 2);
        const rr = p.r(40, 240);
        const x = 384 + Math.cos(a) * rr;
        const y = 400 + Math.sin(a) * rr * 0.75;
        p.curve(
          [
            [x - 16, y],
            [x, y + 10],
            [x + 16, y],
          ],
          { w: 1.5, alpha: 0.7 },
        );
      }
      p.hatch(
        [
          [120, 520],
          [650, 520],
          [560, 690],
          [220, 690],
        ],
        { gap: 12, alpha: 0.2 },
      );
    },
  });
}

export function lampPostArt() {
  return art({
    key: "lamp-post",
    w: 320,
    h: 1280,
    transparent: true,
    draw: (p) => {
      p.washRect(146, 260, 28, 980, "#3d4a52", { alpha: 0.85 });
      p.line(146, 260, 146, 1240, { w: 2.4 });
      p.line(174, 260, 174, 1240, { w: 2.4 });
      p.washRect(120, 1200, 80, 60, "#3d4a52", { alpha: 0.85 });
      p.rect(120, 1200, 80, 60, { w: 2.4 });
      p.rect(132, 860, 56, 30, { w: 2 });
      // lantern
      const lamp: Pt[] = [
        [100, 110],
        [220, 110],
        [196, 250],
        [124, 250],
      ];
      p.wash(lamp, C.mustard, { alpha: 0.75 });
      p.poly(lamp, true, { w: 2.6 });
      p.line(160, 110, 160, 250, { w: 1.6 });
      p.wash(
        [
          [84, 110],
          [160, 50],
          [236, 110],
        ],
        "#3d4a52",
      );
      p.poly(
        [
          [84, 110],
          [160, 50],
          [236, 110],
        ],
        true,
        { w: 2.6 },
      );
      p.rect(110, 250, 100, 16, { w: 2 });
      p.ellipse(160, 40, 10, 10, { w: 2 });
      if (p.painting) {
        const g = p.ctx.createRadialGradient(160, 180, 10, 160, 180, 150);
        g.addColorStop(0, "rgba(255,226,140,0.55)");
        g.addColorStop(1, "rgba(255,226,140,0)");
        p.ctx.fillStyle = g;
        p.ctx.fillRect(0, 20, 320, 320);
      }
    },
  });
}

export function bushArt(i: number) {
  return art({
    key: `bush-${i}`,
    w: 512,
    h: 280,
    transparent: true,
    draw: (p) => {
      blobCluster(
        p,
        [
          [110, 190, 90],
          [220, 150, 110],
          [320, 160, 105],
          [410, 195, 90],
          [260, 210, 90],
        ],
        i % 2 ? C.leafDark : C.leaf,
      );
      p.ctx.save();
      p.ctx.clearRect(0, 262, 512, 30);
      p.ctx.restore();
      p.line(10, 262, 502, 262, { w: 2.2 });
      p.scribble(256, 190, 200, 60, 40, { w: 1.2 });
      if (i % 2 === 0)
        for (let k = 0; k < 6; k++) {
          const x = 100 + k * 60 + p.r(-10, 10);
          const y = 140 + p.r(-30, 40);
          p.washEllipse(x, y, 9, 9, C.rose, { alpha: 1 });
          p.ellipse(x, y, 9, 9, { w: 1.4, passes: 1 });
        }
    },
  });
}

export function cloudArt(i: number) {
  return art({
    key: `cloud-${i}`,
    w: 640,
    h: 280,
    transparent: true,
    draw: (p) => {
      blobCluster(
        p,
        [
          [150, 180, 80],
          [260, 130, 110],
          [380, 140, 100],
          [490, 180, 80],
          [320, 190, 70],
        ].map(([x, y, r]) => [x + (i % 2) * 10, y, r] as [number, number, number]),
        "#dfeaf3",
        { fill: "#fbfaf6" },
      );
      p.ctx.clearRect(0, 228, 640, 60);
      p.line(40, 226, 600, 226, { w: 2 });
      p.hatchRect(80, 190, 480, 34, { gap: 9, alpha: 0.15 });
    },
  });
}

export function groundArt() {
  return art({
    key: "ground",
    sketchOnly: true,
    w: 1024,
    h: 1024,
    repeat: true,
    tint: "#f6f4ec",
    draw: (p) => {
      p.washRect(-20, -20, 1064, 1064, "#dfe8c9", { alpha: 0.7, bleed: 0 });
      for (let i = 0; i < 70; i++) {
        const x = p.r(20, 1004);
        const y = p.r(20, 1004);
        for (let k = -1; k <= 1; k++) p.line(x, y, x + k * 7 + p.r(-2, 2), y - p.r(10, 20), { w: 1.2, passes: 1, alpha: 0.55 });
      }
      for (let i = 0; i < 14; i++) {
        const x = p.r(40, 980);
        const y = p.r(40, 980);
        const r = p.r(5, 11);
        p.washEllipse(x, y, r * 1.4, r, C.stone, { alpha: 0.8 });
        p.ellipse(x, y, r * 1.4, r, { w: 1.3, passes: 1 });
      }
    },
  });
}

export function pathArt() {
  return art({
    key: "stone-path",
    w: 512,
    h: 1024,
    transparent: true,
    draw: (p) => {
      let y = 20;
      let row = 0;
      while (y < 1000) {
        const h = p.r(80, 120);
        const n = row % 2 ? 2 : 3;
        const w = (440 - (n - 1) * 14) / n;
        for (let i = 0; i < n; i++) {
          const x = 36 + i * (w + 14) + p.r(-6, 6);
          const pts: Pt[] = [
            [x + p.r(0, 10), y + p.r(0, 8)],
            [x + w - p.r(0, 10), y + p.r(0, 8)],
            [x + w - p.r(0, 6), y + h - p.r(0, 10)],
            [x + p.r(0, 6), y + h - p.r(0, 10)],
          ];
          p.ctx.save();
          p.ctx.fillStyle = "#f3f1ea";
          p.ctx.beginPath();
          pts.forEach(([px, py], k) => (k ? p.ctx.lineTo(px, py) : p.ctx.moveTo(px, py)));
          p.ctx.closePath();
          p.ctx.fill();
          p.ctx.restore();
          p.wash(pts, C.stone, { alpha: 0.75 });
          p.poly(pts, true, { w: 2 });
          p.dots(x + 10, y + 10, w - 20, h - 20, 8, { alpha: 0.35 });
          if (p.r() < 0.3) p.hatch(pts, { gap: 9, alpha: 0.2 });
        }
        y += h + 14;
        row++;
      }
    },
  });
}

export function doormatArt() {
  return art({
    key: "doormat",
    w: 640,
    h: 256,
    draw: (p) => {
      p.washRect(10, 10, 620, 236, C.terracotta, { alpha: 0.75 });
      p.rect(10, 10, 620, 236, { w: 3 });
      p.rect(30, 30, 580, 196, { w: 1.6, passes: 1 });
      p.dots(14, 14, 612, 228, 300, { alpha: 0.25 });
      p.text("come in!", 320, 132, { size: 96 });
    },
  });
}

export function bubbleArt(text: string, sub?: string) {
  return art({
    key: `bubble-${text}`,
    w: 640,
    h: 360,
    transparent: true,
    draw: (p) => {
      const pts: Pt[] = [];
      for (let i = 0; i <= 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        pts.push([320 + Math.cos(a) * 290, 150 + Math.sin(a) * 120]);
      }
      const ctx = p.ctx;
      ctx.save();
      ctx.fillStyle = "#fffdf7";
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(210, 250);
      ctx.lineTo(150, 345);
      ctx.lineTo(270, 262);
      ctx.fill();
      ctx.restore();
      p.ellipse(320, 150, 290, 120, { w: 3 });
      ctx.save();
      ctx.fillStyle = "#fffdf7";
      ctx.fillRect(214, 254, 52, 20);
      ctx.restore();
      p.line(212, 254, 150, 345, { w: 3, passes: 1 });
      p.line(150, 345, 268, 262, { w: 3, passes: 1 });
      p.text(text, 320, sub ? 125 : 150, { size: 66, maxWidth: 500 });
      if (sub) p.text(sub, 320, 200, { size: 40, font: PRINT_FONT, weight: 400, alpha: 0.75 });
    },
  });
}

export function pottedShrubArt() {
  return art({
    key: "potted-shrub",
    w: 384,
    h: 640,
    transparent: true,
    draw: (p) => {
      const pot: Pt[] = [
        [80, 420],
        [304, 420],
        [270, 630],
        [114, 630],
      ];
      p.wash(pot, C.terracotta, { alpha: 0.9 });
      p.poly(pot, true, { w: 2.6 });
      p.washRect(64, 400, 256, 40, C.terracotta, { alpha: 0.9 });
      p.rect(64, 400, 256, 40, { w: 2.4 });
      p.hatch(
        [
          [240, 440],
          [300, 440],
          [270, 630],
          [230, 630],
        ],
        { gap: 8, alpha: 0.35 },
      );
      // topiary ball
      p.washEllipse(192, 230, 150, 160, C.leafDark, { alpha: 0.8 });
      if (!p.painting) {
        p.ctx.save();
        p.ctx.fillStyle = "#f8f6f0";
        p.ctx.beginPath();
        p.ctx.ellipse(192, 230, 150, 160, 0, 0, Math.PI * 2);
        p.ctx.fill();
        p.ctx.restore();
      }
      p.line(192, 390, 192, 400, { w: 3 });
      const pts: Pt[] = [];
      for (let i = 0; i <= 44; i++) {
        const a = (i / 44) * Math.PI * 2;
        const r = 1 + Math.sin(a * 11) * 0.05;
        pts.push([192 + Math.cos(a) * 150 * r, 230 + Math.sin(a) * 160 * r]);
      }
      p.poly(pts, false, { w: 2.2 });
      p.scribble(192, 230, 120, 130, 50, { w: 1.2 });
      p.hatch(
        [
          [100, 300],
          [300, 280],
          [260, 380],
          [150, 380],
        ],
        { gap: 10, alpha: 0.2 },
      );
    },
  });
}

export function sconceArt() {
  return art({
    key: "sconce",
    w: 256,
    h: 384,
    transparent: true,
    draw: (p) => {
      if (p.painting) {
        const g = p.ctx.createRadialGradient(128, 200, 10, 128, 200, 128);
        g.addColorStop(0, "rgba(255,222,130,0.6)");
        g.addColorStop(1, "rgba(255,222,130,0)");
        p.ctx.fillStyle = g;
        p.ctx.fillRect(0, 60, 256, 280);
      }
      p.washRect(100, 300, 56, 70, "#3d4a52");
      p.rect(100, 300, 56, 70, { w: 2.2 });
      p.line(128, 300, 128, 260, { w: 2.4 });
      const lamp: Pt[] = [
        [80, 120],
        [176, 120],
        [160, 260],
        [96, 260],
      ];
      p.wash(lamp, C.mustard, { alpha: 0.7 });
      p.poly(lamp, true, { w: 2.4 });
      p.wash(
        [
          [70, 120],
          [128, 70],
          [186, 120],
        ],
        "#3d4a52",
      );
      p.poly(
        [
          [70, 120],
          [128, 70],
          [186, 120],
        ],
        true,
        { w: 2.4 },
      );
      p.line(128, 120, 128, 260, { w: 1.4 });
    },
  });
}
