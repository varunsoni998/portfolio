import { art } from "../sketch/art";
import { PRINT_FONT, type Pen } from "../sketch/ink";
import { C, doorPanel, drawFace, pictureFrame, pin, rectPts, stickyNote, taped } from "./common";
import type { RoomId } from "../worldConfig";

type Pt = [number, number];

// ------------------------------------------------------------------ shell tiles (4m x 4m)

export function wallArt(tag = "corridor", tint = "#f9f7f1") {
  return art({
    key: `wall-${tag}`,
    sketchOnly: true,
    w: 1024,
    h: 1024,
    repeat: true,
    tint,
    draw: (p) => {
      const rail = 1024 - 256; // 1.0 m
      // wainscot panels below the rail
      p.line(-10, rail, 1034, rail, { w: 2.4 });
      p.line(-10, rail + 12, 1034, rail + 12, { w: 1.4, passes: 1 });
      p.hatchRect(0, rail + 2, 1024, 10, { gap: 5, alpha: 0.3 });
      for (let i = 0; i < 4; i++) {
        const x = i * 256 + 26;
        p.rect(x, rail + 44, 204, 150, { w: 1.6, passes: 1 });
        p.hatchRect(x + 180, rail + 48, 20, 142, { gap: 6, alpha: 0.18 });
      }
      // skirting board
      p.line(-10, 1024 - 36, 1034, 1024 - 36, { w: 2.2 });
      p.hatchRect(0, 1024 - 34, 1024, 34, { gap: 7, alpha: 0.28 });
      // a few plaster marks on the upper wall
      for (let i = 0; i < 6; i++) {
        const x = p.r(30, 990);
        const y = p.r(40, rail - 60);
        p.line(x, y, x + p.r(10, 30), y + p.r(-4, 4), { w: 1, passes: 1, alpha: 0.18 });
      }
      // ceiling cove shadow
      p.hatchRect(0, 0, 1024, 26, { gap: 6, alpha: 0.22, angle: 0.3 });
      p.line(-10, 26, 1034, 26, { w: 1.6, passes: 1 });
    },
  });
}

export function floorArt(tag = "corridor") {
  return art({
    key: `floor-${tag}`,
    sketchOnly: true,
    w: 1024,
    h: 1024,
    repeat: true,
    tint: "#f7f3ea",
    draw: (p) => {
      const pw = 64; // 0.25 m planks
      for (let i = 0; i <= 16; i++) p.line(i * pw, -10, i * pw, 1034, { w: 1.8, passes: 1, jitter: 0.8 });
      for (let i = 0; i < 16; i++) {
        const x = i * pw;
        const joint = ((i * 389) % 1024) + p.r(-20, 20);
        p.line(x, joint, x + pw, joint, { w: 1.6, passes: 1 });
        p.woodGrain(x + 3, 0, pw - 6, 1024, { vertical: true, density: 0.45, alpha: 0.3 });
        if (i % 5 === 2) p.hatchRect(x, joint - 60, pw, 60, { gap: 8, alpha: 0.12 });
      }
    },
  });
}

export function ceilingArt(tag = "corridor") {
  return art({
    key: `ceiling-${tag}`,
    sketchOnly: true,
    w: 512,
    h: 512,
    repeat: true,
    tint: "#f4f1e9",
    draw: (p) => {
      for (let i = 0; i <= 4; i++) {
        p.line(i * 128, -5, i * 128, 517, { w: 1.6, passes: 1 });
        p.line(-5, i * 128, 517, i * 128, { w: 1.6, passes: 1 });
      }
      p.dots(0, 0, 512, 512, 120, { alpha: 0.12 });
    },
  });
}

// ------------------------------------------------------------------ doors

export const DOOR_THEME: Record<RoomId, { color: string; label: string }> = {
  about: { color: C.mustard, label: "About me" },
  projects: { color: C.wood, label: "Projects" },
  "ai-lab": { color: C.teal, label: "AI Lab" },
  skills: { color: C.navy, label: "Skills" },
  experience: { color: C.terracotta, label: "Experience" },
  contact: { color: C.rose, label: "Contact" },
};

function doorBase(p: Pen, W: number, H: number, color: string) {
  p.washRect(0, 0, W, H, color, { alpha: 0.8, bleed: 1 });
  p.woodGrain(8, 8, W - 16, H - 16, { vertical: true, density: 0.55, alpha: 0.22 });
  p.rect(4, 4, W - 8, H - 8, { w: 3 });
  // handle & escutcheon
  const hx = W - 60;
  const hy = H * 0.52;
  p.washRect(hx - 12, hy - 50, 24, 110, C.brass, { alpha: 0.95 });
  p.rect(hx - 12, hy - 50, 24, 110, { w: 2 });
  p.washRect(hx - 44, hy - 8, 44, 16, C.brass, { alpha: 0.95 });
  p.rect(hx - 44, hy - 8, 44, 16, { w: 2 });
  p.ellipse(hx, hy + 36, 5, 9, { w: 1.6 });
  // bottom panel always present
  doorPanel(p, 50, H - 300, W - 100, 240, color);
}

/** The themed side doors — each one says what's behind it before you open it. */
export function roomDoorArt(id: RoomId) {
  const W = 448;
  const H = 832; // 1.4 x 2.6 m
  const theme = DOOR_THEME[id];
  return art({
    key: `door-${id}`,
    w: W,
    h: H,
    draw: (p) => {
      doorBase(p, W, H, theme.color);
      if (id === "about") {
        const t = taped(p, 70, 90, 250, 290, -0.06);
        const [fx, fy] = t.pt(0, -20);
        drawFace(p, fx, fy, 88, { glasses: true });
        p.text("that's me!", ...t.pt(0, 118), { size: 34, rotate: -0.06 });
        // name tag sticker
        const tag = rectPts(150, 420, 220, 120);
        p.wash(tag, C.red, { alpha: 0.9 });
        p.poly(tag, true, { w: 2 });
        p.ctx.save();
        p.ctx.fillStyle = "#fffdf7";
        p.ctx.fillRect(162, 462, 196, 66);
        p.ctx.restore();
        p.rect(162, 462, 196, 66, { w: 1.4, passes: 1 });
        p.text("HELLO my name is", 260, 441, { size: 22, font: PRINT_FONT, weight: 400, color: p.painting ? "#fff" : "#1c1a17" });
        p.text("Varun", 260, 496, { size: 52 });
      }
      if (id === "projects") {
        const a = taped(p, 60, 80, 230, 170, -0.08);
        // wireframe browser window
        const [x0, y0] = a.pt(-100, -70);
        p.rect(x0, y0, 200, 140, { w: 1.6, passes: 1 });
        p.line(x0, y0 + 20, x0 + 200, y0 + 20, { w: 1.4, passes: 1 });
        [8, 18, 28].forEach((dx) => p.ellipse(x0 + dx, y0 + 10, 3, 3, { w: 1, passes: 1 }));
        p.washRect(x0 + 10, y0 + 30, 80, 50, C.stickyBlue, { alpha: 0.9 });
        p.rect(x0 + 10, y0 + 30, 80, 50, { w: 1.2, passes: 1 });
        for (let i = 0; i < 4; i++) p.line(x0 + 100, y0 + 36 + i * 14, x0 + 188, y0 + 36 + i * 14, { w: 1.2, passes: 1 });
        [30, 55, 45, 75, 65].forEach((v, i) => {
          p.washRect(x0 + 12 + i * 34, y0 + 132 - v * 0.6, 22, v * 0.6, C.mustard, { alpha: 0.9 });
          p.rect(x0 + 12 + i * 34, y0 + 132 - v * 0.6, 22, v * 0.6, { w: 1.1, passes: 1 });
        });
        const b = taped(p, 180, 250, 220, 190, 0.07);
        const [bx, by] = b.pt(-90, -70);
        // phone wireframe
        p.rect(bx + 10, by, 70, 130, { w: 1.6, passes: 1 });
        p.washEllipse(bx + 45, by + 50, 22, 22, C.leaf, { alpha: 0.9 });
        p.ellipse(bx + 45, by + 50, 22, 22, { w: 1.2, passes: 1 });
        p.line(bx + 20, by + 95, bx + 70, by + 95, { w: 1.2, passes: 1 });
        p.line(bx + 20, by + 110, bx + 60, by + 110, { w: 1.2, passes: 1 });
        // arrows
        p.curve(
          [
            [bx + 90, by + 60],
            [bx + 120, by + 40],
            [bx + 150, by + 60],
          ],
          { w: 1.6 },
        );
        p.text("ship it", bx + 140, by + 110, { size: 30, rotate: 0.07 });
        stickyNote(p, 110, 510, 110, "v1.0\nshipped!", C.sticky, -0.12);
      }
      if (id === "ai-lab") {
        // hazard tape
        const tapePts: Pt[] = [
          [0, 150],
          [W, 110],
          [W, 170],
          [0, 210],
        ];
        p.wash(tapePts, C.mustard, { alpha: 0.95 });
        p.ctx.save();
        p.ctx.beginPath();
        tapePts.forEach(([x, y], i) => (i ? p.ctx.lineTo(x, y) : p.ctx.moveTo(x, y)));
        p.ctx.closePath();
        p.ctx.clip();
        for (let x = -60; x < W + 60; x += 50) {
          p.ctx.fillStyle = "#1c1a17";
          p.ctx.globalAlpha = 0.85;
          p.ctx.beginPath();
          p.ctx.moveTo(x, 220);
          p.ctx.lineTo(x + 22, 220);
          p.ctx.lineTo(x + 72, 100);
          p.ctx.lineTo(x + 50, 100);
          p.ctx.fill();
        }
        p.ctx.restore();
        p.poly(tapePts, true, { w: 2 });
        const s = taped(p, 70, 250, 300, 230, 0.04);
        // neural net
        const layers = [3, 4, 4, 2];
        const nodes: Pt[][] = layers.map((n, li) =>
          Array.from({ length: n }, (_, ni) => s.pt(-110 + li * 73, (ni - (n - 1) / 2) * 42)),
        );
        for (let li = 0; li < nodes.length - 1; li++)
          nodes[li].forEach((a) => nodes[li + 1].forEach((b) => p.line(a[0], a[1], b[0], b[1], { w: 0.9, passes: 1, alpha: 0.6 })));
        nodes.flat().forEach(([x, y], i) => {
          p.washEllipse(x, y, 12, 12, i % 3 ? C.stickyBlue : C.stickyPink, { alpha: 1 });
          p.ellipse(x, y, 12, 12, { w: 1.6, passes: 1 });
        });
        // flask
        const f: Pt[] = [
          [300, 520],
          [330, 520],
          [330, 580],
          [380, 670],
          [250, 670],
          [300, 580],
        ];
        p.wash(
          [
            [274, 625],
            [356, 625],
            [380, 670],
            [250, 670],
          ],
          C.leaf,
          { alpha: 0.9 },
        );
        p.poly(f, true, { w: 2.4 });
        [0, 1, 2].forEach((i) => p.ellipse(300 + i * 16, 500 - i * 22, 6 + i * 2, 6 + i * 2, { w: 1.2, passes: 1 }));
        p.text("experiments!", 150, 560, { size: 36, rotate: -0.1 });
      }
      if (id === "skills") {
        const s = taped(p, 60, 80, 320, 220, -0.03);
        // gear + wrench
        const [gx, gy] = s.pt(-70, 0);
        const gear: Pt[] = [];
        for (let i = 0; i < 32; i++) {
          const a = (i / 32) * Math.PI * 2;
          const r = i % 4 < 2 ? 62 : 48;
          gear.push([gx + Math.cos(a) * r, gy + Math.sin(a) * r]);
        }
        p.wash(gear, C.grey, { alpha: 0.8 });
        p.poly(gear, true, { w: 1.6 });
        p.ellipse(gx, gy, 20, 20, { w: 1.8 });
        const [wx, wy] = s.pt(70, 0);
        const wrench: Pt[] = [
          [wx - 60, wy + 50],
          [wx + 30, wy - 40],
          [wx + 40, wy - 30],
          [wx - 50, wy + 60],
        ];
        p.wash(wrench, C.stone);
        p.poly(wrench, true, { w: 1.8 });
        p.ellipse(wx + 44, wy - 44, 22, 22, { w: 1.8 });
        stickyNote(p, 120, 380, 110, "Python", C.sticky, -0.1);
        stickyNote(p, 260, 400, 110, "React", C.stickyBlue, 0.08);
        stickyNote(p, 170, 510, 110, "PyTorch", C.stickyPink, 0.04);
      }
      if (id === "experience") {
        const s = taped(p, 50, 80, 340, 400, 0.03);
        // winding roadmap with flags
        const path: Pt[] = [s.pt(-130, 150), s.pt(-40, 110), s.pt(-120, 40), s.pt(20, 0), s.pt(110, -40), s.pt(20, -100), s.pt(110, -150)];
        p.curve(path, { w: 3 });
        p.curve(
          path.map(([x, y]) => [x + 10, y + 8] as Pt),
          { w: 1.2, alpha: 0.5 },
        );
        [path[0], path[2], path[4], path[6]].forEach(([x, y], i) => {
          p.line(x, y, x, y - 44, { w: 2 });
          const flag: Pt[] = [
            [x, y - 44],
            [x + 34, y - 36],
            [x, y - 26],
          ];
          p.wash(flag, i === 3 ? C.red : C.leaf, { alpha: 0.95 });
          p.poly(flag, true, { w: 1.6 });
        });
        p.text("the road so far", ...s.pt(0, 180), { size: 32, rotate: 0.03 });
      }
      if (id === "contact") {
        // envelope
        const e = rectPts(80, 110, 290, 190);
        p.ctx.save();
        p.ctx.fillStyle = "#fffdf7";
        p.ctx.fillRect(80, 110, 290, 190);
        p.ctx.restore();
        p.wash(e, C.cream, { alpha: 0.9 });
        p.poly(e, true, { w: 2.4 });
        p.line(80, 110, 225, 215, { w: 2 });
        p.line(370, 110, 225, 215, { w: 2 });
        p.washRect(300, 124, 52, 60, C.red, { alpha: 0.9 });
        p.rect(300, 124, 52, 60, { w: 1.6, passes: 1 });
        p.ellipse(326, 154, 14, 14, { w: 1.2, passes: 1 });
        p.tape(90, 116, 80, -0.6);
        p.tape(360, 116, 80, 0.6);
        // mail slot
        p.washRect(110, 400, 230, 50, C.brass, { alpha: 0.95 });
        p.rect(110, 400, 230, 50, { w: 2.4 });
        p.hatchRect(126, 416, 198, 18, { gap: 4, alpha: 0.6 });
        p.text("LETTERS", 225, 470, { size: 22, font: PRINT_FONT, weight: 400 });
        // paper airplane
        const plane: Pt[] = [
          [120, 540],
          [330, 500],
          [180, 590],
        ];
        p.wash(plane, "#fffdf7", { alpha: 1 });
        p.poly(plane, true, { w: 2 });
        p.line(330, 500, 190, 560, { w: 1.4 });
        p.curve(
          [
            [110, 548],
            [70, 560],
            [60, 520],
            [30, 530],
          ],
          { w: 1.4, alpha: 0.6 },
        );
      }
    },
  });
}

export function doorBackArt(id: RoomId) {
  const theme = DOOR_THEME[id];
  return art({
    key: `door-back-${id}`,
    w: 448,
    h: 832,
    draw: (p) => {
      doorBase(p, 448, 832, theme.color);
      doorPanel(p, 50, 80, 348, 380, theme.color);
    },
  });
}

/** Casing around a door opening; drawn as one texture for a thin box. */
export function trimArt() {
  return art({
    key: "trim",
    sketchOnly: true,
    w: 128,
    h: 1024,
    draw: (p) => {
      p.washRect(0, 0, 128, 1024, "#efe7d6", { alpha: 0.9 });
      p.rect(6, 4, 116, 1016, { w: 2.6 });
      p.line(40, 4, 40, 1020, { w: 1.4, passes: 1 });
      p.line(88, 4, 88, 1020, { w: 1.4, passes: 1 });
      p.hatchRect(88, 4, 34, 1016, { gap: 7, alpha: 0.25 });
    },
  });
}

export function plateArt(text: string, color: string) {
  return art({
    key: `plate-${text}`,
    w: 640,
    h: 180,
    transparent: true,
    draw: (p) => {
      const pts: Pt[] = [
        [20, 24],
        [620, 20],
        [624, 160],
        [16, 158],
      ];
      p.ctx.save();
      p.ctx.fillStyle = "#fbf9f3";
      p.ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? p.ctx.lineTo(x, y) : p.ctx.moveTo(x, y)));
      p.ctx.closePath();
      p.ctx.fill();
      p.ctx.restore();
      p.wash(pts, color, { alpha: 0.55 });
      p.poly(pts, true, { w: 3 });
      p.poly(
        [
          [38, 40],
          [602, 36],
          [604, 142],
          [36, 142],
        ],
        true,
        { w: 1.4, passes: 1 },
      );
      p.text(text, 320, 92, { size: 92 });
      [
        [52, 90],
        [588, 88],
      ].forEach(([x, y]) => {
        p.ellipse(x, y, 7, 7, { w: 1.4 });
      });
    },
  });
}

// ------------------------------------------------------------------ props

export function pendantLampArt() {
  return art({
    key: "pendant-lamp",
    w: 256,
    h: 512,
    transparent: true,
    draw: (p) => {
      p.line(128, 0, 128, 300, { w: 2, passes: 1 });
      p.rect(116, 290, 24, 24, { w: 1.8 });
      const shade: Pt[] = [
        [128, 312],
        [220, 420],
        [36, 420],
      ];
      const s2: Pt[] = [
        [116, 314],
        [140, 314],
        [226, 420],
        [30, 420],
      ];
      p.wash(s2, C.teal, { alpha: 0.85 });
      p.ctx.save();
      if (!p.painting) {
        p.ctx.fillStyle = "#f8f6f0";
        p.ctx.beginPath();
        s2.forEach(([x, y], i) => (i ? p.ctx.lineTo(x, y) : p.ctx.moveTo(x, y)));
        p.ctx.closePath();
        p.ctx.fill();
      }
      p.ctx.restore();
      p.poly(s2, true, { w: 2.6 });
      p.hatch(
        [
          [140, 314],
          [226, 420],
          [170, 420],
        ],
        { gap: 7, alpha: 0.35 },
      );
      void shade;
      // bulb + glow
      p.washEllipse(128, 432, 26, 18, C.mustard, { alpha: 1 });
      p.ellipse(128, 432, 26, 18, { w: 2 });
      if (p.painting) {
        const g = p.ctx.createRadialGradient(128, 440, 10, 128, 460, 120);
        g.addColorStop(0, "rgba(255,225,140,0.55)");
        g.addColorStop(1, "rgba(255,225,140,0)");
        p.ctx.fillStyle = g;
        p.ctx.fillRect(0, 400, 256, 112);
      } else {
        for (let i = 0; i < 7; i++) {
          const a = Math.PI * 0.15 + (i / 6) * Math.PI * 0.7;
          p.line(128 + Math.cos(a) * 40, 440 + Math.sin(a) * 30, 128 + Math.cos(a) * 62, 440 + Math.sin(a) * 50, { w: 1.4, passes: 1, alpha: 0.6 });
        }
      }
    },
  });
}

export function cabinetArt() {
  return art({
    key: "cabinet",
    w: 512,
    h: 460,
    draw: (p) => {
      p.washRect(0, 0, 512, 460, C.wood, { alpha: 0.75 });
      p.rect(6, 6, 500, 448, { w: 3 });
      for (let i = 0; i < 3; i++) {
        const y = 24 + i * 142;
        p.rect(24, y, 464, 128, { w: 2 });
        p.woodGrain(28, y + 4, 456, 120, { density: 0.7, alpha: 0.25 });
        p.washEllipse(256, y + 64, 16, 16, C.brass, { alpha: 1 });
        p.ellipse(256, y + 64, 16, 16, { w: 2 });
        p.hatchRect(24, y + 110, 464, 18, { gap: 6, alpha: 0.3 });
      }
    },
  });
}

export function bookshelfArt(seedTag = "a") {
  return art({
    key: `bookshelf-${seedTag}`,
    w: 512,
    h: 800,
    draw: (p) => {
      p.washRect(0, 0, 512, 800, C.woodDark, { alpha: 0.7 });
      p.rect(6, 6, 500, 788, { w: 3 });
      p.rect(28, 28, 456, 744, { w: 1.8 });
      const colors = [C.red, C.navy, C.mustard, C.leaf, C.teal, C.rose, C.purple, C.terracotta];
      for (let s = 0; s < 4; s++) {
        const top = 28 + s * 186;
        const bottom = top + 172;
        p.line(28, bottom, 484, bottom, { w: 2.4 });
        p.washRect(28, bottom, 456, 14, C.wood, { alpha: 0.9 });
        let x = 36;
        while (x < 440) {
          const bw = p.r(18, 36);
          const bh = p.r(100, 160);
          const lean = p.r() < 0.12;
          if (lean && x < 400) {
            const pts: Pt[] = [
              [x, bottom],
              [x + bw, bottom],
              [x + bw + 34, bottom - bh + 10],
              [x + 34, bottom - bh],
            ];
            p.wash(pts, colors[Math.floor(p.r() * colors.length)], { alpha: 0.9 });
            p.poly(pts, true, { w: 1.6 });
            x += bw + 40;
            continue;
          }
          const pts = rectPts(x, bottom - bh, bw, bh);
          p.wash(pts, colors[Math.floor(p.r() * colors.length)], { alpha: 0.9 });
          p.poly(pts, true, { w: 1.6 });
          if (p.r() < 0.6) p.line(x + 3, bottom - bh + 16, x + bw - 3, bottom - bh + 16, { w: 1, passes: 1 });
          x += bw + 3;
        }
      }
    },
  });
}

export function benchArt() {
  return art({
    key: "bench",
    w: 768,
    h: 300,
    transparent: true,
    draw: (p) => {
      p.washRect(20, 110, 728, 40, C.wood, { alpha: 0.9 });
      p.rect(20, 110, 728, 40, { w: 2.6 });
      p.woodGrain(24, 114, 720, 32, { alpha: 0.3 });
      [60, 680].forEach((x) => {
        p.washRect(x, 150, 28, 140, "#3d4a52", { alpha: 0.9 });
        p.rect(x, 150, 28, 140, { w: 2.2 });
      });
      p.line(74, 250, 694, 250, { w: 2 });
      // a stack of papers and a mug on the bench
      for (let i = 0; i < 4; i++) p.rect(200 + i * 3, 92 - i * 6, 150, 14, { w: 1.4, passes: 1 });
      p.washRect(520, 50, 60, 60, C.red, { alpha: 0.9 });
      p.rect(520, 50, 60, 60, { w: 2 });
      p.ellipse(592, 78, 14, 18, { w: 2 });
      [0, 1].forEach((i) =>
        p.curve(
          [
            [540 + i * 20, 40],
            [530 + i * 20, 20],
            [545 + i * 20, 0],
          ],
          { w: 1.2, alpha: 0.6 },
        ),
      );
    },
  });
}

export function tallPlantArt(v = 0) {
  return art({
    key: `tall-plant-${v}`,
    w: 420,
    h: 900,
    transparent: true,
    draw: (p) => {
      const pot: Pt[] = [
        [120, 690],
        [300, 690],
        [280, 890],
        [140, 890],
      ];
      p.wash(pot, v % 2 ? C.stone : C.terracotta, { alpha: 0.9 });
      p.poly(pot, true, { w: 2.6 });
      p.line(120, 720, 300, 720, { w: 1.6, passes: 1 });
      p.hatch(
        [
          [250, 720],
          [300, 690],
          [280, 890],
          [240, 890],
        ],
        { gap: 8, alpha: 0.3 },
      );
      // monstera-ish leaves on stems
      const leaves: [number, number, number, number][] = [
        [210, 330, 110, -0.4],
        [120, 430, 95, -1.1],
        [300, 440, 95, 0.9],
        [170, 560, 85, -1.5],
        [270, 560, 90, 1.3],
        [230, 200, 80, 0.2],
      ];
      leaves.forEach(([x, y, r, rot]) => {
        p.curve(
          [
            [210, 690],
            [(210 + x) / 2 + rot * 10, (690 + y) / 2 + 30],
            [x, y + r * 0.6],
          ],
          { w: 2 },
        );
        const pts: Pt[] = [];
        for (let i = 0; i <= 20; i++) {
          const t = (i / 20) * Math.PI * 2;
          const rr = r * (0.85 + 0.15 * Math.sin(t * 2));
          const lx = Math.cos(t) * rr * 0.7;
          const ly = Math.sin(t) * rr;
          pts.push([x + lx * Math.cos(rot) - ly * Math.sin(rot), y + lx * Math.sin(rot) + ly * Math.cos(rot)]);
        }
        p.wash(pts, C.leafDark, { alpha: 0.85 });
        p.ctx.save();
        if (!p.painting) {
          p.ctx.fillStyle = "#f8f6f0";
          p.ctx.beginPath();
          pts.forEach(([a, b], i) => (i ? p.ctx.lineTo(a, b) : p.ctx.moveTo(a, b)));
          p.ctx.closePath();
          p.ctx.fill();
        }
        p.ctx.restore();
        p.poly(pts, true, { w: 2 });
        const tip: Pt = [x - Math.sin(rot) * r * -1, y + Math.cos(rot) * -r];
        p.line(x + Math.sin(rot) * r * 0.9, y - Math.cos(rot) * -r * 0.9, tip[0], tip[1], { w: 1.4, passes: 1 });
        for (let k = -2; k <= 2; k++) {
          const cx = x + k * 0.25 * r * Math.sin(rot);
          const cy = y - k * 0.25 * r * Math.cos(rot);
          p.line(cx, cy, cx + Math.cos(rot) * r * 0.55, cy + Math.sin(rot) * r * 0.55, { w: 1.1, passes: 1, alpha: 0.6 });
        }
      });
    },
  });
}

export function smallPlantArt() {
  return art({
    key: "small-plant",
    w: 256,
    h: 300,
    transparent: true,
    draw: (p) => {
      p.washRect(70, 180, 116, 110, C.stickyBlue, { alpha: 0.9 });
      p.rect(70, 180, 116, 110, { w: 2.4 });
      p.line(70, 204, 186, 204, { w: 1.4, passes: 1 });
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI / 2 + (i - 4) * 0.28;
        const len = 90 + (4 - Math.abs(i - 4)) * 14;
        const tip: Pt = [128 + Math.cos(a) * len, 180 + Math.sin(a) * len];
        const pts: Pt[] = [
          [128 - 8, 180],
          [tip[0] - 10, (tip[1] + 180) / 2],
          tip,
          [tip[0] + 10, (tip[1] + 180) / 2],
          [128 + 8, 180],
        ];
        p.wash(pts, C.leaf, { alpha: 0.9 });
        p.poly(pts, false, { w: 1.6 });
      }
    },
  });
}

/** A framed picture for the corridor walls. */
export function framedPictureArt(kind: "mountains" | "city" | "sun" | "sea" | "neural" | "portrait" | "graph", w = 512, h = 384) {
  return art({
    key: `frame-${kind}-${w}x${h}`,
    w,
    h,
    transparent: false,
    draw: (p) => {
      const { ix, iy, iw, ih } = pictureFrame(p, 4, 4, w - 8, h - 8, { color: kind === "neural" || kind === "graph" ? "#3d4a52" : C.woodDark });
      const X = (u: number) => ix + u * iw;
      const Y = (v: number) => iy + v * ih;
      if (kind === "mountains") {
        p.wash(rectPts(ix, iy, iw, ih * 0.6), C.sky, { alpha: 0.6 });
        const m1: Pt[] = [
          [X(0), Y(0.8)],
          [X(0.3), Y(0.3)],
          [X(0.55), Y(0.7)],
          [X(0.72), Y(0.4)],
          [X(1), Y(0.8)],
        ];
        p.wash([...m1, [X(1), Y(1)], [X(0), Y(1)]], C.navy, { alpha: 0.55 });
        p.poly(m1, false, { w: 2 });
        p.poly(
          [
            [X(0.24), Y(0.38)],
            [X(0.3), Y(0.3)],
            [X(0.36), Y(0.4)],
          ],
          false,
          { w: 1.4 },
        );
        p.hatch(
          [
            [X(0.3), Y(0.3)],
            [X(0.55), Y(0.7)],
            [X(0.35), Y(0.8)],
          ],
          { gap: 8, alpha: 0.3 },
        );
        p.wash(rectPts(X(0), Y(0.8), iw, ih * 0.2), C.leaf, { alpha: 0.7 });
        p.washEllipse(X(0.8), Y(0.18), iw * 0.06, iw * 0.06, C.mustard);
        p.ellipse(X(0.8), Y(0.18), iw * 0.06, iw * 0.06, { w: 1.6 });
      }
      if (kind === "sun" || kind === "sea") {
        p.wash(rectPts(ix, iy, iw, ih * 0.55), kind === "sun" ? "#f3c98b" : C.sky, { alpha: 0.7 });
        p.washEllipse(X(0.5), Y(0.55), iw * 0.16, iw * 0.16, kind === "sun" ? C.red : C.mustard);
        p.ellipse(X(0.5), Y(0.55), iw * 0.16, iw * 0.16, { w: 1.8 });
        p.wash(rectPts(ix, Y(0.55), iw, ih * 0.45), C.navy, { alpha: 0.6 });
        p.line(ix, Y(0.55), ix + iw, Y(0.55), { w: 2 });
        for (let i = 0; i < 6; i++) p.line(X(0.15 + p.r(0, 0.6)), Y(0.62 + i * 0.06), X(0.3 + p.r(0, 0.6)), Y(0.62 + i * 0.06), { w: 1.3, passes: 1 });
        if (kind === "sea") {
          p.poly(
            [
              [X(0.2), Y(0.52)],
              [X(0.3), Y(0.52)],
              [X(0.27), Y(0.56)],
              [X(0.22), Y(0.56)],
            ],
            true,
            { w: 1.4 },
          );
          p.line(X(0.25), Y(0.52), X(0.25), Y(0.42), { w: 1.4 });
          p.poly(
            [
              [X(0.25), Y(0.42)],
              [X(0.3), Y(0.5)],
              [X(0.25), Y(0.5)],
            ],
            true,
            { w: 1.2 },
          );
        }
      }
      if (kind === "city") {
        p.wash(rectPts(ix, iy, iw, ih), "#f3d9b1", { alpha: 0.6 });
        let x = ix + 6;
        while (x < ix + iw - 20) {
          const bw = p.r(0.08, 0.16) * iw;
          const bh = p.r(0.3, 0.8) * ih;
          const pts = rectPts(x, iy + ih - bh, Math.min(bw, ix + iw - x - 6), bh);
          p.wash(pts, p.r() > 0.5 ? C.navy : C.purple, { alpha: 0.55 });
          p.poly(pts, true, { w: 1.6 });
          for (let wy = iy + ih - bh + 12; wy < iy + ih - 14; wy += 18)
            for (let wx = x + 6; wx < x + bw - 10; wx += 14) if (p.r() > 0.4) p.rect(wx, wy, 6, 8, { w: 0.9, passes: 1 });
          x += bw + 3;
        }
      }
      if (kind === "neural") {
        p.wash(rectPts(ix, iy, iw, ih), "#e9eef0", { alpha: 0.8 });
        const layers = [4, 6, 6, 3];
        const nodes: Pt[][] = layers.map((n, li) => Array.from({ length: n }, (_, ni) => [X(0.14 + li * 0.24), Y(0.12 + ((ni + 0.5) / n) * 0.76)] as Pt));
        for (let li = 0; li < nodes.length - 1; li++)
          nodes[li].forEach((a) => nodes[li + 1].forEach((b) => p.line(a[0], a[1], b[0], b[1], { w: 0.8, passes: 1, alpha: 0.45 })));
        nodes.flat().forEach(([x2, y2], i) => {
          p.washEllipse(x2, y2, 10, 10, [C.teal, C.mustard, C.rose][i % 3], { alpha: 1 });
          p.ellipse(x2, y2, 10, 10, { w: 1.5, passes: 1 });
        });
      }
      if (kind === "graph") {
        p.wash(rectPts(ix, iy, iw, ih), "#fbfbf8", { alpha: 1, always: true });
        p.line(X(0.1), Y(0.1), X(0.1), Y(0.88), { w: 2 });
        p.line(X(0.1), Y(0.88), X(0.94), Y(0.88), { w: 2 });
        const pts: Pt[] = [];
        for (let i = 0; i <= 16; i++) {
          const t = i / 16;
          pts.push([X(0.1 + t * 0.82), Y(0.2 + 0.62 * (1 - Math.exp(-t * 4)) + p.r(-0.02, 0.02))]);
        }
        p.curve(pts, { w: 2.6, color: p.painting ? C.red : "#1c1a17" });
        p.text("loss", X(0.2), Y(0.07), { size: 28 });
        p.text("epochs →", X(0.78), Y(0.95), { size: 24 });
        p.text("it's learning!", X(0.62), Y(0.45), { size: 30, rotate: -0.08 });
      }
      if (kind === "portrait") {
        p.wash(rectPts(ix, iy, iw, ih), "#e8dcc4", { alpha: 0.7 });
        // a simple original still life: a cup of chai and a plant
        const cx = X(0.4);
        p.washRect(cx - 40, Y(0.5), 80, 70, C.red, { alpha: 0.85 });
        p.rect(cx - 40, Y(0.5), 80, 70, { w: 2 });
        p.ellipse(cx + 52, Y(0.6), 14, 18, { w: 2 });
        [0, 1, 2].forEach((i) =>
          p.curve(
            [
              [cx - 20 + i * 20, Y(0.45)],
              [cx - 28 + i * 20, Y(0.35)],
              [cx - 18 + i * 20, Y(0.25)],
            ],
            { w: 1.4, alpha: 0.6 },
          ),
        );
        p.line(ix, Y(0.72), ix + iw, Y(0.72), { w: 1.6 });
        p.hatchRect(ix, Y(0.72), iw, ih * 0.28, { gap: 8, alpha: 0.25 });
      }
    },
  });
}

export function clockArt() {
  return art({
    key: "clock",
    w: 256,
    h: 256,
    transparent: true,
    draw: (p) => {
      p.washEllipse(128, 128, 110, 110, C.cream, { alpha: 1 });
      p.ctx.save();
      if (!p.painting) {
        p.ctx.fillStyle = "#fbfaf6";
        p.ctx.beginPath();
        p.ctx.arc(128, 128, 110, 0, Math.PI * 2);
        p.ctx.fill();
      }
      p.ctx.restore();
      p.ellipse(128, 128, 112, 112, { w: 4 });
      p.ellipse(128, 128, 96, 96, { w: 1.4, passes: 1 });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        p.line(128 + Math.cos(a) * 80, 128 + Math.sin(a) * 80, 128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92, { w: 2, passes: 1 });
      }
      p.line(128, 128, 128, 62, { w: 3.4 });
      p.line(128, 128, 178, 150, { w: 2.6 });
      p.ellipse(128, 128, 6, 6, { w: 2 });
    },
  });
}

export function ventArt() {
  return art({
    key: "vent",
    w: 320,
    h: 160,
    draw: (p) => {
      p.washRect(0, 0, 320, 160, C.stone, { alpha: 0.6 });
      p.rect(8, 8, 304, 144, { w: 2.6 });
      for (let y = 28; y < 140; y += 16) {
        p.line(24, y, 296, y, { w: 1.8, passes: 1 });
        p.hatchRect(24, y, 272, 8, { gap: 4, alpha: 0.35 });
      }
    },
  });
}

export function arrowSignArt(text: string, dir: "left" | "right") {
  return art({
    key: `arrow-${text}-${dir}`,
    w: 640,
    h: 200,
    transparent: true,
    draw: (p) => {
      const ctx = p.ctx;
      if (dir === "left") {
        ctx.translate(640, 0);
        ctx.scale(-1, 1);
      }
      const pts: Pt[] = [
        [20, 40],
        [500, 40],
        [620, 100],
        [500, 160],
        [20, 160],
      ];
      ctx.save();
      ctx.fillStyle = "#fbf9f3";
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      p.wash(pts, C.wood, { alpha: 0.8 });
      p.woodGrain(24, 44, 540, 112, { alpha: 0.25 });
      p.poly(pts, true, { w: 3 });
      if (dir === "left") {
        ctx.translate(640, 0);
        ctx.scale(-1, 1);
      }
      p.text(text, dir === "left" ? 360 : 280, 102, { size: 72 });
    },
  });
}

export function whiteboardArt() {
  return art({
    key: "whiteboard-todo",
    w: 900,
    h: 560,
    draw: (p) => {
      p.washRect(0, 0, 900, 560, C.grey, { alpha: 0.6 });
      p.ctx.save();
      p.ctx.fillStyle = "#fdfdfb";
      p.ctx.fillRect(26, 26, 848, 490);
      p.ctx.restore();
      p.rect(8, 8, 884, 526, { w: 3 });
      p.rect(26, 26, 848, 490, { w: 2 });
      p.rect(200, 516, 500, 22, { w: 2 });
      p.text("TODO", 140, 80, { size: 64 });
      p.line(80, 110, 210, 108, { w: 2 });
      const items = ["[ ] train the model", "[x] drink chai", "[ ] fix that one bug", "[x] deploy on Friday?!"];
      items.forEach((t, i) => p.text(t, 70, 160 + i * 64, { size: 44, align: "left" }));
      p.line(92, 344, 360, 338, { w: 2.2 });
      stickyNote(p, 680, 170, 150, "coffee\n→ code", C.sticky, 0.1);
      stickyNote(p, 700, 360, 150, "ask the\nLLM", C.stickyPink, -0.08);
      pin(p, 680, 104);
      pin(p, 700, 294, C.navy);
    },
  });
}

export function paperBallArt() {
  return art({
    key: "paper-ball",
    w: 160,
    h: 140,
    transparent: true,
    draw: (p) => {
      const pts: Pt[] = [];
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const r = 55 + (i % 2 ? 10 : -4);
        pts.push([80 + Math.cos(a) * r, 78 + Math.sin(a) * r * 0.85]);
      }
      p.ctx.save();
      p.ctx.fillStyle = "#fdfcf8";
      p.ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? p.ctx.lineTo(x, y) : p.ctx.moveTo(x, y)));
      p.ctx.closePath();
      p.ctx.fill();
      p.ctx.restore();
      p.poly(pts, true, { w: 2 });
      for (let i = 0; i < 6; i++) p.line(80 + p.r(-40, 40), 78 + p.r(-30, 30), 80 + p.r(-40, 40), 78 + p.r(-30, 30), { w: 1.2, passes: 1 });
    },
  });
}

export function exitDoorArt(side: "left" | "right") {
  return art({
    key: `exit-door-${side}`,
    w: 384,
    h: 896,
    draw: (p) => {
      const ctx = p.ctx;
      if (side === "right") {
        ctx.translate(384, 0);
        ctx.scale(-1, 1);
      }
      p.washRect(0, 0, 384, 896, C.leafDark, { alpha: 0.75 });
      p.rect(4, 4, 376, 888, { w: 3 });
      p.wash(rectPts(60, 80, 260, 320), C.sky, { alpha: 0.8 });
      p.rect(60, 80, 260, 320, { w: 2.4 });
      p.line(60, 80, 320, 400, { w: 1, alpha: 0.25 });
      // push bar
      p.washRect(30, 470, 340, 40, C.stone, { alpha: 0.9 });
      p.rect(30, 470, 340, 40, { w: 2.4 });
      doorPanel(p, 60, 580, 260, 260, C.leafDark);
    },
  });
}

export function exitSignArt() {
  return art({
    key: "exit-sign",
    w: 640,
    h: 220,
    draw: (p) => {
      p.washRect(0, 0, 640, 220, C.leaf, { alpha: 0.9 });
      p.rect(8, 8, 624, 204, { w: 3 });
      p.text("the classic site →", 320, 96, { size: 70, color: p.painting ? "#fbfaf4" : "#1c1a17" });
      p.text("(scroll to the end, or click the doors)", 320, 166, { size: 30, font: PRINT_FONT, weight: 400, color: p.painting ? "#fbfaf4" : "#1c1a17" });
    },
  });
}
