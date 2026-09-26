import { art } from "../sketch/art";
import type { Pen } from "../sketch/ink";
import { C, drawFace } from "./common";

type Pt = [number, number];

export const CHAR_FRAMES = 8; // walk cycle frames; frame 8 = idle (facing us, waving)
export const CHAR_FRAME_W = 256;
export const CHAR_FRAME_H = 420;

/** Hoodie + backpack guide, seen from behind while walking. */
function walker(p: Pen, phase: number) {
  const sw = Math.sin(phase);
  const bob = Math.abs(Math.cos(phase)) * 6;
  const ctx = p.ctx;
  ctx.save();
  ctx.translate(0, -bob);
  // legs
  const leg = (x: number, lift: number) => {
    const top = 250;
    const foot = 398 - lift;
    const pts: Pt[] = [
      [x - 20, top],
      [x + 20, top],
      [x + 17, foot - 18],
      [x - 17, foot - 18],
    ];
    solid(p, pts, C.denim, 0.85);
    p.poly(pts, true, { w: 2.2 });
    const shoe: Pt[] = [
      [x - 22, foot - 20],
      [x + 22, foot - 20],
      [x + 22, foot],
      [x - 22, foot],
    ];
    p.wash(shoe, "#f5f2ea", { alpha: 1, always: true });
    p.poly(shoe, true, { w: 2.2 });
    p.line(x - 22, foot - 6, x + 22, foot - 6, { w: 1.2, passes: 1 });
  };
  leg(106, Math.max(0, sw) * 26);
  leg(150, Math.max(0, -sw) * 26);
  // arms
  const arm = (x: number, dy: number, dir: number) => {
    const pts: Pt[] = [
      [x - 16 * dir, 128],
      [x + 14 * dir, 128],
      [x + 20 * dir, 236 + dy],
      [x - 6 * dir, 238 + dy],
    ];
    solid(p, pts, C.hoodie, 0.85);
    p.poly(pts, true, { w: 2.2 });
    p.washEllipse(x + 7 * dir, 248 + dy, 13, 13, C.skin, { alpha: 0.9 });
    p.ellipse(x + 7 * dir, 248 + dy, 13, 13, { w: 1.8, passes: 1 });
  };
  arm(62, sw * 10, -1);
  arm(194, -sw * 10, 1);
  // hoodie torso
  const torso: Pt[] = [
    [78, 118],
    [178, 118],
    [184, 262],
    [72, 262],
  ];
  solid(p, torso, C.hoodie, 0.85);
  p.poly(torso, true, { w: 2.4 });
  p.line(74, 246, 182, 246, { w: 1.4, passes: 1 });
  // hood lying on the back
  p.curve(
    [
      [92, 118],
      [100, 150],
      [128, 160],
      [156, 150],
      [164, 118],
    ],
    { w: 2 },
  );
  // backpack
  const bag: Pt[] = [
    [92, 150],
    [164, 150],
    [170, 240],
    [86, 240],
  ];
  solid(p, bag, C.navy, 0.9);
  p.poly(bag, true, { w: 2.4 });
  p.rect(104, 196, 48, 30, { w: 1.6, passes: 1 });
  p.line(96, 150, 84, 124, { w: 2.4, passes: 1 });
  p.line(160, 150, 172, 124, { w: 2.4, passes: 1 });
  // a sticker on the bag
  p.washEllipse(146, 172, 9, 9, C.mustard, { alpha: 1 });
  p.ellipse(146, 172, 9, 9, { w: 1.2, passes: 1 });
  // head from behind: hair + ears + headphone band
  p.washEllipse(60 + 68, 72, 44, 48, C.hair, { alpha: 0.9 });
  ctx.save();
  if (!p.painting) {
    ctx.fillStyle = "#f8f6f0";
    ctx.beginPath();
    ctx.ellipse(128, 72, 44, 48, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  p.ellipse(128, 72, 44, 48, { w: 2.4 });
  p.scribble(128, 64, 34, 36, 22, { w: 1.3 });
  p.washEllipse(84, 80, 8, 12, C.skin, { alpha: 1 });
  p.washEllipse(172, 80, 8, 12, C.skin, { alpha: 1 });
  p.ellipse(84, 80, 8, 12, { w: 1.6, passes: 1 });
  p.ellipse(172, 80, 8, 12, { w: 1.6, passes: 1 });
  p.curve(
    [
      [80, 104],
      [128, 122],
      [176, 104],
    ],
    { w: 3 },
  );
  p.curve(
    [
      [134, 28],
      [150, 10],
      [162, 18],
    ],
    { w: 2 },
  );
  ctx.restore();
}

/** Idle: facing the camera, waving. */
function idle(p: Pen) {
  const leg = (x: number) => {
    const pts: Pt[] = [
      [x - 20, 250],
      [x + 20, 250],
      [x + 17, 380],
      [x - 17, 380],
    ];
    solid(p, pts, C.denim, 0.85);
    p.poly(pts, true, { w: 2.2 });
    p.poly(
      [
        [x - 24, 378],
        [x + 24, 378],
        [x + 24, 398],
        [x - 24, 398],
      ],
      true,
      { w: 2.2 },
    );
  };
  leg(106);
  leg(150);
  const torso: Pt[] = [
    [78, 118],
    [178, 118],
    [184, 262],
    [72, 262],
  ];
  solid(p, torso, C.hoodie, 0.85);
  p.poly(torso, true, { w: 2.4 });
  p.line(128, 124, 128, 176, { w: 1.6, passes: 1 });
  p.rect(100, 200, 56, 34, { w: 1.6, passes: 1 });
  p.line(112, 124, 108, 160, { w: 1.4, passes: 1 });
  p.line(144, 124, 148, 160, { w: 1.4, passes: 1 });
  // left arm down
  const armL: Pt[] = [
    [62, 128],
    [82, 128],
    [82, 236],
    [56, 238],
  ];
  solid(p, armL, C.hoodie, 0.85);
  p.poly(armL, true, { w: 2.2 });
  p.ellipse(70, 248, 13, 13, { w: 1.8, passes: 1 });
  // right arm raised, waving
  const armR: Pt[] = [
    [176, 128],
    [196, 136],
    [226, 62],
    [206, 52],
  ];
  solid(p, armR, C.hoodie, 0.85);
  p.poly(armR, true, { w: 2.2 });
  p.washEllipse(220, 40, 15, 15, C.skin, { alpha: 0.9 });
  p.ellipse(220, 40, 15, 15, { w: 1.8, passes: 1 });
  [0, 1].forEach((i) =>
    p.curve(
      [
        [240 + i * 8, 24 - i * 6],
        [248 + i * 8, 38],
        [240 + i * 8, 54 + i * 6],
      ],
      { w: 1.4, alpha: 0.7 },
    ),
  );
  drawFace(p, 128, 70, 46, { glasses: true });
  // headphones round the neck
  p.curve(
    [
      [86, 108],
      [128, 128],
      [170, 108],
    ],
    { w: 3 },
  );
}

function solid(p: Pen, pts: Pt[], color: string, alpha: number) {
  fillWhite(p, pts);
  p.wash(pts, color, { alpha });
}

function fillWhite(p: Pen, pts: Pt[]) {
  const ctx = p.ctx;
  ctx.save();
  ctx.fillStyle = "#f8f6f0";
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function characterArt() {
  const total = CHAR_FRAMES + 1;
  return art({
    key: "guide-character",
    w: CHAR_FRAME_W * total,
    h: CHAR_FRAME_H,
    transparent: true,
    draw: (p) => {
      for (let f = 0; f < total; f++) {
        p.ctx.save();
        p.ctx.translate(f * CHAR_FRAME_W, 10);
        if (f < CHAR_FRAMES) walker(p, (f / CHAR_FRAMES) * Math.PI * 2);
        else idle(p);
        p.ctx.restore();
      }
    },
  });
}
