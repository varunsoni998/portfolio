import { art } from "../sketch/art";
import { PRINT_FONT, type Pen } from "../sketch/ink";
import { C, blobCluster, drawFace, pictureFrame, pin, rectPts, stickyNote, taped } from "./common";
import type { RoomId } from "../worldConfig";

type Pt = [number, number];

const ROOM_TINT: Record<RoomId, string> = {
  about: C.mustard,
  projects: C.stone,
  "ai-lab": C.teal,
  skills: C.navy,
  experience: C.terracotta,
  contact: C.rose,
};

/** Wallpaper tile (4m x 4m) — each room gets its own pattern. */
export function roomWallArt(id: RoomId) {
  return art({
    key: `room-wall-${id}`,
    w: 1024,
    h: 1024,
    repeat: true,
    draw: (p) => {
      const tint = ROOM_TINT[id];
      const rail = 768;
      p.washRect(-10, 30, 1044, rail - 30, tint, { alpha: 0.28, bleed: 0 });
      if (id === "about") for (let x = 0; x < 1024; x += 64) p.line(x, 30, x, rail, { w: 1, passes: 1, alpha: 0.25 });
      if (id === "ai-lab")
        for (let i = 0; i < 1024; i += 64) {
          p.line(i, 30, i, rail, { w: 0.8, passes: 1, alpha: 0.18 });
          if (i > 30 && i < rail) p.line(0, i, 1024, i, { w: 0.8, passes: 1, alpha: 0.18 });
        }
      if (id === "skills")
        for (let y = 80; y < rail - 20; y += 64)
          for (let x = (y / 64) % 2 ? 32 : 0; x < 1024; x += 64) {
            p.washEllipse(x, y, 6, 6, tint, { alpha: 0.6, bleed: 0 });
            p.ellipse(x, y, 5, 5, { w: 1, passes: 1, alpha: 0.4 });
          }
      if (id === "experience")
        for (let y = 60; y < rail; y += 44)
          for (let x = (y / 44) % 2 ? 0 : 60; x < 1024; x += 120) p.rect(x, y, 112, 38, { w: 0.9, passes: 1, alpha: 0.2 });
      if (id === "contact")
        for (let y = 90; y < rail - 30; y += 110)
          for (let x = (y / 110) % 2 ? 60 : 0; x < 1024; x += 128) {
            p.rect(x + 20, y, 56, 36, { w: 1, passes: 1, alpha: 0.28 });
            p.line(x + 20, y, x + 48, y + 20, { w: 0.9, passes: 1, alpha: 0.28 });
            p.line(x + 76, y, x + 48, y + 20, { w: 0.9, passes: 1, alpha: 0.28 });
          }
      if (id === "projects") {
        p.line(-10, 110, 1034, 110, { w: 2 });
        p.line(-10, 122, 1034, 122, { w: 1.2, passes: 1 });
      }
      p.line(-10, rail, 1034, rail, { w: 2.4 });
      p.line(-10, rail + 12, 1034, rail + 12, { w: 1.4, passes: 1 });
      p.washRect(-10, rail, 1044, 256, C.cream, { alpha: 0.6, bleed: 0 });
      for (let i = 0; i < 4; i++) p.rect(i * 256 + 26, rail + 44, 204, 150, { w: 1.6, passes: 1 });
      p.line(-10, 988, 1034, 988, { w: 2.2 });
      p.hatchRect(0, 990, 1024, 34, { gap: 7, alpha: 0.28 });
      p.hatchRect(0, 0, 1024, 26, { gap: 6, alpha: 0.22, angle: 0.3 });
      p.line(-10, 26, 1034, 26, { w: 1.6, passes: 1 });
    },
  });
}

export function roomFloorArt() {
  return art({
    key: "room-floor",
    w: 1024,
    h: 1024,
    repeat: true,
    tint: "#f7f3ea",
    draw: (p) => {
      p.washRect(-10, -10, 1044, 1044, C.woodLight, { alpha: 0.45, bleed: 0 });
      const pw = 64;
      for (let i = 0; i <= 16; i++) p.line(i * pw, -10, i * pw, 1034, { w: 1.8, passes: 1, jitter: 0.8 });
      for (let i = 0; i < 16; i++) {
        const joint = ((i * 389) % 1024) + p.r(-20, 20);
        p.line(i * pw, joint, i * pw + pw, joint, { w: 1.6, passes: 1 });
        p.woodGrain(i * pw + 3, 0, pw - 6, 1024, { vertical: true, density: 0.45, alpha: 0.3 });
      }
    },
  });
}

export function roomTitleArt(text: string, id: RoomId) {
  return art({
    key: `room-title-${id}`,
    w: 1024,
    h: 240,
    transparent: true,
    draw: (p) => {
      p.text(text, 512, 120, { size: 150 });
      p.curve(
        [
          [120, 196],
          [500, 184],
          [900, 198],
        ],
        { w: 3 },
      );
    },
  });
}

export function backSignArt() {
  return art({
    key: "back-sign",
    w: 640,
    h: 220,
    transparent: true,
    draw: (p) => {
      const pts: Pt[] = [
        [120, 40],
        [620, 40],
        [620, 180],
        [120, 180],
        [20, 110],
      ];
      p.wash(pts, C.cream, { alpha: 0.9 });
      p.poly(pts, true, { w: 3 });
      p.text("back to corridor", 360, 108, { size: 62 });
    },
  });
}

// ------------------------------------------------------------------ About

export function portraitArt() {
  return art({
    key: "about-portrait",
    w: 720,
    h: 900,
    draw: (p) => {
      const { ix, iy, iw, ih } = pictureFrame(p, 4, 4, 712, 892, { color: C.woodDark, border: 56 });
      p.washRect(ix, iy, iw, ih, "#f6dfa6", { alpha: 0.7 });
      // sunburst background
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        p.line(ix + iw / 2, iy + ih * 0.45, ix + iw / 2 + Math.cos(a) * 500, iy + ih * 0.45 + Math.sin(a) * 500, { w: 1, passes: 1, alpha: 0.18 });
      }
      // shoulders / hoodie
      const body: Pt[] = [
        [ix + 90, iy + ih],
        [ix + 130, iy + 560],
        [ix + iw / 2, iy + 520],
        [ix + iw - 130, iy + 560],
        [ix + iw - 90, iy + ih],
      ];
      p.wash(body, C.hoodie, { alpha: 0.9 });
      p.ctx.save();
      if (!p.painting) {
        p.ctx.fillStyle = "#f8f6f0";
        p.ctx.beginPath();
        body.forEach(([x, y], i) => (i ? p.ctx.lineTo(x, y) : p.ctx.moveTo(x, y)));
        p.ctx.fill();
      }
      p.ctx.restore();
      p.poly(body, false, { w: 3 });
      p.curve(
        [
          [ix + 230, iy + 540],
          [ix + iw / 2, iy + 620],
          [ix + iw - 230, iy + 540],
        ],
        { w: 2.4 },
      );
      p.line(ix + iw / 2 - 40, iy + 600, ix + iw / 2 - 50, iy + 700, { w: 1.8 });
      p.line(ix + iw / 2 + 40, iy + 600, ix + iw / 2 + 50, iy + 700, { w: 1.8 });
      drawFace(p, ix + iw / 2, iy + 330, 170, { glasses: true });
      p.text("hi, I'm Varun!", ix + iw / 2, iy + 70, { size: 64 });
    },
  });
}

export function diplomaArt() {
  return art({
    key: "diploma",
    w: 640,
    h: 480,
    draw: (p) => {
      const { ix, iy, iw, ih } = pictureFrame(p, 4, 4, 632, 472, { color: "#3d4a52", border: 36 });
      p.washRect(ix, iy, iw, ih, "#f7efd8", { alpha: 0.9 });
      p.rect(ix + 20, iy + 20, iw - 40, ih - 40, { w: 1.4, passes: 1 });
      p.text("B.E.", ix + iw / 2, iy + 70, { size: 60 });
      p.text("Artificial Intelligence", ix + iw / 2, iy + 140, { size: 44 });
      p.text("& Data Science", ix + iw / 2, iy + 190, { size: 44 });
      p.text("4th year · in progress", ix + iw / 2, iy + 250, { size: 30, font: PRINT_FONT, weight: 400 });
      p.washEllipse(ix + iw - 90, iy + ih - 70, 44, 44, C.red, { alpha: 0.9 });
      p.ellipse(ix + iw - 90, iy + ih - 70, 44, 44, { w: 2 });
      p.ellipse(ix + iw - 90, iy + ih - 70, 32, 32, { w: 1.2, passes: 1 });
      p.curve(
        [
          [ix + 60, iy + ih - 60],
          [ix + 140, iy + ih - 80],
          [ix + 200, iy + ih - 56],
        ],
        { w: 2 },
      );
    },
  });
}

export function deskArt() {
  return art({
    key: "desk-front",
    w: 1024,
    h: 560,
    transparent: true,
    draw: (p) => {
      // desk
      p.washRect(20, 260, 984, 44, C.wood, { alpha: 0.9 });
      p.rect(20, 260, 984, 44, { w: 3 });
      p.woodGrain(24, 264, 976, 36, { alpha: 0.3 });
      p.washRect(60, 304, 260, 250, C.wood, { alpha: 0.85 });
      p.rect(60, 304, 260, 250, { w: 2.6 });
      [0, 1].forEach((i) => {
        p.rect(80, 324 + i * 110, 220, 94, { w: 1.8 });
        p.ellipse(190, 371 + i * 110, 10, 10, { w: 1.6 });
      });
      p.washRect(920, 304, 40, 250, C.wood);
      p.rect(920, 304, 40, 250, { w: 2.6 });
      // laptop
      const lid: Pt[] = [
        [380, 90],
        [640, 90],
        [650, 250],
        [370, 250],
      ];
      p.wash(lid, "#3d4a52", { alpha: 0.9 });
      p.poly(lid, true, { w: 2.6 });
      p.washEllipse(510, 170, 18, 18, C.mustard, { alpha: 1 });
      p.ellipse(510, 170, 18, 18, { w: 1.6 });
      p.rect(340, 250, 340, 12, { w: 2.2 });
      // stickers on the laptop lid
      p.washRect(410, 110, 50, 30, C.stickyPink, { alpha: 1 });
      p.rect(410, 110, 50, 30, { w: 1.4, passes: 1 });
      p.text("AI", 435, 125, { size: 22 });
      // mug
      p.washRect(720, 180, 64, 80, C.red, { alpha: 0.9 });
      p.rect(720, 180, 64, 80, { w: 2.2 });
      p.ellipse(796, 216, 16, 22, { w: 2.2 });
      [0, 1].forEach((i) =>
        p.curve(
          [
            [738 + i * 22, 170],
            [728 + i * 22, 140],
            [744 + i * 22, 110],
          ],
          { w: 1.4, alpha: 0.6 },
        ),
      );
      // desk lamp
      p.line(160, 258, 190, 150, { w: 3 });
      p.line(190, 150, 260, 110, { w: 3 });
      const shade: Pt[] = [
        [240, 80],
        [300, 100],
        [290, 150],
        [230, 120],
      ];
      p.wash(shade, C.teal, { alpha: 0.9 });
      p.poly(shade, true, { w: 2.4 });
      p.washRect(130, 246, 70, 14, "#3d4a52");
      p.rect(130, 246, 70, 14, { w: 2 });
      // books
      [C.navy, C.leaf, C.mustard].forEach((c, i) => {
        p.washRect(840, 200 + i * 20, 120 - i * 10, 20, c, { alpha: 0.9 });
        p.rect(840, 200 + i * 20, 120 - i * 10, 20, { w: 1.8 });
      });
    },
  });
}

export function cityWindowArt() {
  return art({
    key: "city-window",
    w: 640,
    h: 720,
    draw: (p) => {
      p.washRect(0, 0, 640, 720, C.cream, { alpha: 0.95 });
      p.rect(6, 6, 628, 708, { w: 3 });
      p.wash(rectPts(40, 40, 560, 600), "#f5cf9b", { alpha: 0.8 });
      p.washEllipse(430, 240, 60, 60, C.red, { alpha: 0.7 });
      let x = 44;
      while (x < 590) {
        const bw = p.r(50, 90);
        const bh = p.r(140, 360);
        const pts = rectPts(x, 640 - bh, Math.min(bw, 596 - x), bh);
        p.wash(pts, p.r() > 0.5 ? C.navy : C.purple, { alpha: 0.55 });
        p.poly(pts, true, { w: 1.6 });
        for (let wy = 640 - bh + 16; wy < 620; wy += 26) for (let wx = x + 10; wx < x + bw - 16; wx += 18) if (p.r() > 0.45) p.rect(wx, wy, 8, 12, { w: 0.9, passes: 1 });
        x += bw + 4;
      }
      // palm
      p.curve(
        [
          [120, 640],
          [128, 520],
          [150, 420],
        ],
        { w: 3 },
      );
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI * 0.95 + (i / 5) * Math.PI * 0.9;
        p.curve(
          [
            [150, 420],
            [150 + Math.cos(a) * 50, 410 + Math.sin(a) * 30],
            [150 + Math.cos(a) * 100, 440 + Math.sin(a) * 50],
          ],
          { w: 2.4, color: p.painting ? C.leafDark : "#1c1a17" },
        );
      }
      p.line(320, 40, 320, 640, { w: 4 });
      p.line(40, 340, 600, 340, { w: 4 });
      p.rect(40, 40, 560, 600, { w: 2.6 });
      p.washRect(0, 650, 640, 60, C.stone);
      p.rect(0, 650, 640, 60, { w: 2.6 });
    },
  });
}

// ------------------------------------------------------------------ Projects

export function projectFrameArt(slug: string, name: string, status: string) {
  return art({
    key: `project-frame-${slug}`,
    w: 800,
    h: 640,
    draw: (p) => {
      const { ix, iy, iw, ih } = pictureFrame(p, 4, 4, 792, 632, { color: C.woodDark, border: 44, mat: true });
      const X = (u: number) => ix + u * iw;
      const Y = (v: number) => iy + v * ih;
      p.washRect(ix, iy, iw, ih, "#f4ecd8", { alpha: 0.6 });
      if (slug === "businessos") {
        // dashboard + server tower
        p.rect(X(0.1), Y(0.14), iw * 0.56, ih * 0.62, { w: 2.2 });
        p.line(X(0.1), Y(0.22), X(0.66), Y(0.22), { w: 1.6 });
        p.washRect(X(0.12), Y(0.25), iw * 0.14, ih * 0.48, C.navy, { alpha: 0.6 });
        [0, 1, 2, 3].forEach((i) => p.line(X(0.14), Y(0.32 + i * 0.1), X(0.24), Y(0.32 + i * 0.1), { w: 1.4, passes: 1 }));
        [0.4, 0.6, 0.5, 0.8].forEach((v, i) => {
          p.washRect(X(0.3 + i * 0.08), Y(0.72) - v * ih * 0.3, iw * 0.05, v * ih * 0.3, C.mustard, { alpha: 0.9 });
          p.rect(X(0.3 + i * 0.08), Y(0.72) - v * ih * 0.3, iw * 0.05, v * ih * 0.3, { w: 1.4, passes: 1 });
        });
        p.washEllipse(X(0.58), Y(0.34), 26, 26, C.teal, { alpha: 0.9 });
        p.ellipse(X(0.58), Y(0.34), 26, 26, { w: 1.6 });
        const tower = rectPts(X(0.72), Y(0.2), iw * 0.18, ih * 0.62);
        p.wash(tower, "#3d4a52", { alpha: 0.7 });
        p.poly(tower, true, { w: 2.2 });
        for (let i = 0; i < 5; i++) {
          p.rect(X(0.74), Y(0.26 + i * 0.1), iw * 0.14, ih * 0.06, { w: 1.4, passes: 1 });
          p.washEllipse(X(0.86), Y(0.29 + i * 0.1), 5, 5, C.leaf, { alpha: 1 });
        }
        p.curve(
          [
            [X(0.66), Y(0.5)],
            [X(0.69), Y(0.45)],
            [X(0.72), Y(0.5)],
          ],
          { w: 2 },
        );
      }
      if (slug === "pan-fraud-detection") {
        const card = rectPts(X(0.12), Y(0.2), iw * 0.56, ih * 0.5);
        p.wash(card, C.sky, { alpha: 0.7 });
        p.poly(card, true, { w: 2.4 });
        p.rect(X(0.16), Y(0.32), iw * 0.14, ih * 0.26, { w: 1.8 });
        drawFace(p, X(0.23), Y(0.45), 26);
        [0, 1, 2, 3].forEach((i) => p.line(X(0.34), Y(0.34 + i * 0.07), X(0.62 - i * 0.04), Y(0.34 + i * 0.07), { w: 1.6, passes: 1 }));
        // magnifier
        p.washEllipse(X(0.66), Y(0.55), 70, 70, "#e8f1f7", { alpha: 0.8 });
        p.ellipse(X(0.66), Y(0.55), 70, 70, { w: 3.4 });
        p.line(X(0.66) + 50, Y(0.55) + 50, X(0.66) + 120, Y(0.55) + 120, { w: 7 });
        // red verdict
        p.line(X(0.62), Y(0.5), X(0.7), Y(0.6), { w: 4, color: p.painting ? C.red : "#1c1a17" });
        p.line(X(0.7), Y(0.5), X(0.62), Y(0.6), { w: 4, color: p.painting ? C.red : "#1c1a17" });
        p.text("OCR", X(0.2), Y(0.84), { size: 38 });
        p.curve(
          [
            [X(0.26), Y(0.84)],
            [X(0.4), Y(0.8)],
            [X(0.5), Y(0.72)],
          ],
          { w: 1.8 },
        );
      }
      if (slug === "mechago") {
        const phone = rectPts(X(0.34), Y(0.08), iw * 0.3, ih * 0.84);
        p.wash(phone, "#3d4a52", { alpha: 0.7 });
        p.poly(phone, true, { w: 2.6 });
        const screen = rectPts(X(0.36), Y(0.14), iw * 0.26, ih * 0.68);
        p.wash(screen, "#e5efd9", { alpha: 1, always: true });
        p.poly(screen, true, { w: 1.8 });
        // map roads
        p.curve(
          [
            [X(0.36), Y(0.4)],
            [X(0.46), Y(0.36)],
            [X(0.62), Y(0.46)],
          ],
          { w: 5, alpha: 0.35 },
        );
        p.line(X(0.5), Y(0.14), X(0.48), Y(0.82), { w: 5, alpha: 0.35 });
        // pin
        const pinPts: Pt[] = [
          [X(0.49), Y(0.62)],
          [X(0.46), Y(0.5)],
          [X(0.49), Y(0.45)],
          [X(0.52), Y(0.5)],
        ];
        p.wash(pinPts, C.red, { alpha: 1 });
        p.poly(pinPts, true, { w: 2 });
        // wrench beside
        p.line(X(0.72), Y(0.8), X(0.86), Y(0.3), { w: 9 });
        p.ellipse(X(0.87), Y(0.26), 26, 26, { w: 3 });
        p.text("help is near!", X(0.18), Y(0.3), { size: 34, rotate: -0.1 });
        // tiny car
        p.rect(X(0.08), Y(0.66), iw * 0.18, ih * 0.1, { w: 2 });
        p.washRect(X(0.08), Y(0.66), iw * 0.18, ih * 0.1, C.mustard, { alpha: 0.9 });
        p.ellipse(X(0.11), Y(0.77), 14, 14, { w: 2 });
        p.ellipse(X(0.23), Y(0.77), 14, 14, { w: 2 });
      }
      // status stamp
      p.ctx.save();
      p.ctx.translate(X(0.8), Y(0.1));
      p.ctx.rotate(0.12);
      p.rect(-100, -24, 200, 48, { w: 2.4, color: p.painting ? C.red : "#1c1a17" });
      p.text(status, 0, 2, { size: 24, font: PRINT_FONT, weight: 400, color: p.painting ? C.red : "#1c1a17" });
      p.ctx.restore();
      void name;
    },
  });
}

export function labelCardArt(title: string, sub: string, key: string) {
  return art({
    key: `label-${key}`,
    w: 800,
    h: 220,
    transparent: true,
    draw: (p) => {
      const pts = rectPts(20, 20, 760, 180);
      p.wash(pts, "#fffdf6", { alpha: 1, always: true });
      p.poly(pts, true, { w: 2.4 });
      p.text(title, 400, 88, { size: 76, maxWidth: 720 });
      p.text(sub, 400, 156, { size: 34, font: PRINT_FONT, weight: 400, maxWidth: 720, alpha: 0.8 });
      p.tape(60, 26, 90, -0.4);
      p.tape(740, 26, 90, 0.4);
    },
  });
}

// ------------------------------------------------------------------ AI Lab

export type ToolIcon = "image" | "video" | "chat" | "pdf" | "business-card" | "content" | string;

export function toolScreenArt(slug: ToolIcon, title: string, infra: string, available: boolean) {
  return art({
    key: `tool-${slug}`,
    w: 640,
    h: 560,
    transparent: true,
    draw: (p) => {
      // monitor body
      p.washRect(0, 0, 640, 440, "#3d4a52", { alpha: 0.85 });
      p.rect(6, 6, 628, 428, { w: 3 });
      const sx = 34;
      const sy = 30;
      const sw = 572;
      const sh = 370;
      p.ctx.save();
      p.ctx.fillStyle = "#fbfaf5";
      p.ctx.fillRect(sx, sy, sw, sh);
      p.ctx.restore();
      p.wash(rectPts(sx, sy, sw, sh), available ? "#e6f1ec" : "#efe9e0", { alpha: 1 });
      p.rect(sx, sy, sw, sh, { w: 2 });
      const cx = 320;
      const cy = 170;
      if (slug === "image") {
        p.rect(cx - 110, cy - 80, 220, 160, { w: 2.4 });
        p.wash(
          [
            [cx - 110, cy + 80],
            [cx - 40, cy - 10],
            [cx + 10, cy + 40],
            [cx + 50, cy],
            [cx + 110, cy + 80],
          ],
          C.leaf,
        );
        p.poly(
          [
            [cx - 110, cy + 80],
            [cx - 40, cy - 10],
            [cx + 10, cy + 40],
            [cx + 50, cy],
            [cx + 110, cy + 80],
          ],
          false,
          { w: 2 },
        );
        p.washEllipse(cx + 60, cy - 40, 20, 20, C.mustard);
        p.ellipse(cx + 60, cy - 40, 20, 20, { w: 1.8 });
        sparkle(p, cx + 140, cy - 70, 26);
        sparkle(p, cx - 140, cy + 40, 16);
      }
      if (slug === "video") {
        p.rect(cx - 140, cy - 70, 280, 140, { w: 2.4 });
        for (let i = 0; i < 7; i++) {
          p.rect(cx - 130 + i * 40, cy - 64, 20, 14, { w: 1.2, passes: 1 });
          p.rect(cx - 130 + i * 40, cy + 50, 20, 14, { w: 1.2, passes: 1 });
        }
        const tri: Pt[] = [
          [cx - 26, cy - 34],
          [cx + 36, cy],
          [cx - 26, cy + 34],
        ];
        p.wash(tri, C.red, { alpha: 0.9 });
        p.poly(tri, true, { w: 2.4 });
      }
      if (slug === "chat") {
        const b1 = rectPts(cx - 150, cy - 80, 200, 70);
        p.wash(b1, C.stickyBlue);
        p.poly(b1, true, { w: 2.2 });
        const b2 = rectPts(cx - 40, cy + 10, 200, 70);
        p.wash(b2, C.sticky);
        p.poly(b2, true, { w: 2.2 });
        [0, 1, 2].forEach((i) => p.ellipse(cx - 100 + i * 40, cy - 45, 7, 7, { w: 1.8 }));
        p.line(cx - 20, cy + 35, cx + 130, cy + 35, { w: 1.6, passes: 1 });
        p.line(cx - 20, cy + 55, cx + 90, cy + 55, { w: 1.6, passes: 1 });
      }
      if (slug === "pdf") {
        const doc: Pt[] = [
          [cx - 80, cy - 100],
          [cx + 40, cy - 100],
          [cx + 80, cy - 60],
          [cx + 80, cy + 100],
          [cx - 80, cy + 100],
        ];
        p.wash(doc, "#fffdf8", { alpha: 1, always: true });
        p.poly(doc, true, { w: 2.4 });
        p.line(cx + 40, cy - 100, cx + 40, cy - 60, { w: 1.6 });
        p.line(cx + 40, cy - 60, cx + 80, cy - 60, { w: 1.6 });
        p.washRect(cx - 60, cy - 70, 70, 34, C.red, { alpha: 0.9 });
        p.text("PDF", cx - 25, cy - 52, { size: 28 });
        for (let i = 0; i < 5; i++) p.line(cx - 60, cy - 10 + i * 20, cx + 60, cy - 10 + i * 20, { w: 1.4, passes: 1 });
        p.text("?", cx + 130, cy - 40, { size: 90 });
      }
      if (slug === "business-card") {
        const card = rectPts(cx - 130, cy - 70, 260, 140);
        p.wash(card, C.cream, { alpha: 1 });
        p.poly(card, true, { w: 2.4 });
        drawFace(p, cx - 80, cy - 10, 26);
        [0, 1, 2].forEach((i) => p.line(cx - 30, cy - 30 + i * 26, cx + 100 - i * 20, cy - 30 + i * 26, { w: 1.6, passes: 1 }));
        // scan beam
        p.line(cx - 150, cy + 20, cx + 150, cy + 20, { w: 3, color: p.painting ? C.red : "#1c1a17", alpha: 0.7 });
        [
          [cx - 160, cy - 90, 1, 1],
          [cx + 160, cy - 90, -1, 1],
          [cx - 160, cy + 90, 1, -1],
          [cx + 160, cy + 90, -1, -1],
        ].forEach(([x, y, dx, dy]) => {
          p.line(x, y, x + 30 * dx, y, { w: 3 });
          p.line(x, y, x, y + 30 * dy, { w: 3 });
        });
      }
      if (slug === "content") {
        for (let i = 0; i < 6; i++) p.line(cx - 150, cy - 80 + i * 30, cx + 60 - (i % 3) * 30, cy - 80 + i * 30, { w: 1.8, passes: 1 });
        const pen: Pt[] = [
          [cx + 80, cy + 70],
          [cx + 170, cy - 60],
          [cx + 190, cy - 44],
          [cx + 100, cy + 84],
        ];
        p.wash(pen, C.mustard, { alpha: 0.95 });
        p.poly(pen, true, { w: 2.2 });
        p.line(cx + 80, cy + 70, cx + 72, cy + 96, { w: 2 });
        p.line(cx + 100, cy + 84, cx + 72, cy + 96, { w: 2 });
        sparkle(p, cx - 170, cy + 80, 18);
      }
      if (!available) {
        p.ctx.save();
        p.ctx.translate(cx, cy);
        p.ctx.rotate(-0.15);
        p.washRect(-170, -30, 340, 60, C.mustard, { alpha: 0.95 });
        p.rect(-170, -30, 340, 60, { w: 2.4 });
        p.text("coming soon", 0, 2, { size: 44 });
        p.ctx.restore();
      }
      p.text(title, 320, 360, { size: 50, maxWidth: 540 });
      // stand
      p.washRect(270, 440, 100, 70, "#3d4a52", { alpha: 0.85 });
      p.rect(270, 440, 100, 70, { w: 2.4 });
      p.washRect(200, 510, 240, 36, "#3d4a52", { alpha: 0.85 });
      p.rect(200, 510, 240, 36, { w: 2.4 });
      // infra badge
      p.washRect(440, 452, 180, 44, infra === "LOCAL GPU" ? C.leaf : C.stickyBlue, { alpha: 0.95 });
      p.rect(440, 452, 180, 44, { w: 2 });
      p.text(infra.toLowerCase(), 530, 474, { size: 26, font: PRINT_FONT, weight: 400 });
    },
  });
}

function sparkle(p: Pen, x: number, y: number, r: number) {
  const pts: Pt[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? r * 0.3 : r;
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
  }
  p.wash(pts, C.mustard, { alpha: 1 });
  p.poly(pts, true, { w: 1.8 });
}

export function labBenchArt() {
  return art({
    key: "lab-bench",
    w: 1024,
    h: 520,
    transparent: true,
    draw: (p) => {
      p.washRect(10, 270, 1004, 40, "#e9ede9", { alpha: 1 });
      p.rect(10, 270, 1004, 40, { w: 3 });
      p.washRect(40, 310, 944, 200, C.stone, { alpha: 0.85 });
      p.rect(40, 310, 944, 200, { w: 2.8 });
      [0, 1, 2, 3].forEach((i) => {
        p.rect(60 + i * 232, 330, 212, 160, { w: 1.8 });
        p.line(130 + i * 232, 410, 200 + i * 232, 410, { w: 3 });
      });
      // glassware
      const flask = (x: number, color: string, h: number) => {
        const pts: Pt[] = [
          [x - 12, 270 - h],
          [x + 12, 270 - h],
          [x + 12, 270 - h * 0.55],
          [x + 50, 270],
          [x - 50, 270],
          [x - 12, 270 - h * 0.55],
        ];
        p.wash(pts, "#eef5f7", { alpha: 1, always: true });
        p.wash(
          [
            [x - 30, 240],
            [x + 30, 240],
            [x + 50, 270],
            [x - 50, 270],
          ],
          color,
          { alpha: 0.95 },
        );
        p.poly(pts, true, { w: 2.2 });
        [0, 1, 2].forEach((i) => p.ellipse(x + (i - 1) * 8, 250 - h - i * 22, 5 + i, 5 + i, { w: 1.2, passes: 1 }));
      };
      flask(160, C.leaf, 160);
      flask(330, C.purple, 120);
      // beakers
      [
        [480, C.stickyBlue, 90],
        [560, C.mustard, 120],
      ].forEach(([x, c, h]) => {
        const pts = rectPts((x as number) - 34, 270 - (h as number), 68, h as number);
        p.wash(pts, "#eef5f7", { alpha: 1, always: true });
        p.washRect((x as number) - 34, 270 - (h as number) * 0.5, 68, (h as number) * 0.5, c as string, { alpha: 0.9 });
        p.poly(pts, true, { w: 2.2 });
        for (let k = 1; k < 4; k++) p.line((x as number) - 34, 270 - (h as number) * (k / 4), (x as number) - 18, 270 - (h as number) * (k / 4), { w: 1.2, passes: 1 });
      });
      // microscope-ish robot arm
      p.line(760, 270, 760, 150, { w: 6 });
      p.line(760, 150, 860, 110, { w: 6 });
      p.line(860, 110, 900, 180, { w: 5 });
      p.washEllipse(760, 150, 16, 16, C.red, { alpha: 1 });
      p.ellipse(760, 150, 16, 16, { w: 2 });
      p.washEllipse(860, 110, 14, 14, C.red, { alpha: 1 });
      p.ellipse(860, 110, 14, 14, { w: 2 });
      p.rect(720, 250, 80, 20, { w: 2.2 });
      p.line(890, 190, 910, 190, { w: 3 });
    },
  });
}

// ------------------------------------------------------------------ Skills

export function skillsShelfArt(groups: { category: string; items: string[] }[]) {
  const W = 1200;
  const H = 1040;
  return art({
    key: `skills-shelf-${groups.map((g) => g.items.length).join("-")}`,
    w: W,
    h: H,
    draw: (p) => {
      p.washRect(0, 0, W, H, C.woodDark, { alpha: 0.75 });
      p.rect(6, 6, W - 12, H - 12, { w: 3.4 });
      p.rect(36, 36, W - 72, H - 72, { w: 2 });
      const colors = [C.red, C.navy, C.mustard, C.leaf, C.teal, C.rose, C.purple, C.terracotta];
      const shelfH = (H - 72) / groups.length;
      groups.forEach((g, gi) => {
        const top = 36 + gi * shelfH;
        const bottom = top + shelfH - 18;
        p.washRect(36, bottom, W - 72, 18, C.wood, { alpha: 0.95 });
        p.line(36, bottom, W - 36, bottom, { w: 2.6 });
        // category label
        const lx = 50;
        const lw = 250;
        p.ctx.save();
        p.ctx.fillStyle = "#fbf8ef";
        p.ctx.fillRect(lx, top + 30, lw, 70);
        p.ctx.restore();
        p.rect(lx, top + 30, lw, 70, { w: 2 });
        p.text(g.category, lx + lw / 2, top + 66, { size: 40, maxWidth: lw - 20 });
        let x = lx + lw + 30;
        g.items.forEach((item, i) => {
          const bw = Math.max(58, Math.min(90, 26 + item.length * 5));
          const bh = shelfH - 40 - p.r(0, 34);
          const pts = rectPts(x, bottom - bh, bw, bh);
          p.ctx.save();
          p.ctx.fillStyle = "#fbf8ef";
          p.ctx.fillRect(x, bottom - bh, bw, bh);
          p.ctx.restore();
          p.wash(pts, colors[(gi * 3 + i) % colors.length], { alpha: 0.9 });
          p.poly(pts, true, { w: 2 });
          p.line(x + 4, bottom - bh + 18, x + bw - 4, bottom - bh + 18, { w: 1.2, passes: 1 });
          p.line(x + 4, bottom - 18, x + bw - 4, bottom - 18, { w: 1.2, passes: 1 });
          p.text(item, x + bw / 2, bottom - bh / 2, { size: Math.min(40, bw * 0.55), rotate: -Math.PI / 2, maxWidth: bh - 50 });
          x += bw + 6;
        });
        // a little plant or trophy on some shelves
        if (gi % 2 === 1 && x < W - 180) {
          p.washRect(W - 170, bottom - 70, 80, 70, C.terracotta, { alpha: 0.9 });
          p.rect(W - 170, bottom - 70, 80, 70, { w: 2 });
          blobCluster(
            p,
            [
              [W - 130, bottom - 110, 40],
              [W - 160, bottom - 90, 26],
              [W - 100, bottom - 90, 26],
            ],
            C.leaf,
            { fill: "#f8f6f0" },
          );
        }
      });
    },
  });
}

// ------------------------------------------------------------------ Experience

export function corkboardArt(items: { title: string }[], stages: { label: string; done: boolean }[]) {
  return art({
    key: `corkboard-${items.length}-${stages.length}`,
    w: 1280,
    h: 800,
    draw: (p) => {
      p.washRect(0, 0, 1280, 800, C.woodDark, { alpha: 0.85 });
      p.rect(6, 6, 1268, 788, { w: 3.4 });
      p.washRect(40, 40, 1200, 720, "#d9a86b", { alpha: 0.85 });
      p.rect(40, 40, 1200, 720, { w: 2.2 });
      p.dots(44, 44, 1192, 712, 700, { alpha: 0.3, r: 1.4 });
      p.text("What I build", 300, 96, { size: 64 });
      const colors = [C.sticky, C.stickyBlue, C.stickyPink, "#c9e6a8", C.sticky];
      items.forEach((it, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 160 + col * 205;
        const y = 270 + row * 250;
        stickyNote(p, x, y, 190, it.title.replace(" ", "\n"), colors[i % colors.length], p.r(-0.1, 0.1));
        pin(p, x, y - 80, [C.red, C.navy, C.leaf][i % 3]);
      });
      // currently building: a roadmap on an index card
      const t = taped(p, 740, 130, 460, 580, 0.02, "#fffdf6");
      p.text("Currently building", ...t.pt(0, -240), { size: 44 });
      p.text("BusinessOS", ...t.pt(0, -190), { size: 56 });
      stages.forEach((s, i) => {
        const [x, y] = t.pt(-150, -110 + i * 80);
        if (i < stages.length - 1) p.line(x, y + 22, x, y + 58, { w: 2, passes: 1 });
        p.washEllipse(x, y, 20, 20, s.done ? C.leaf : "#fbfaf4", { alpha: 1 });
        p.ellipse(x, y, 20, 20, { w: 2.2 });
        if (s.done) {
          p.line(x - 10, y, x - 2, y + 10, { w: 3 });
          p.line(x - 2, y + 10, x + 14, y - 12, { w: 3 });
        }
        p.text(s.label, x + 40, y, { size: 38, align: "left", alpha: s.done ? 0.95 : 0.6 });
      });
      // string connecting the notes
      p.curve(
        [
          [150, 154],
          [260, 190],
          [360, 154],
          [470, 190],
          [570, 154],
        ],
        { w: 1.4, color: p.painting ? C.red : "#1c1a17", alpha: 0.7 },
      );
    },
  });
}

// ------------------------------------------------------------------ Contact

export function mailboxArt() {
  return art({
    key: "mailbox",
    w: 480,
    h: 900,
    transparent: true,
    draw: (p) => {
      // classic pillar post box
      const body: Pt[] = [
        [70, 200],
        [410, 200],
        [410, 820],
        [70, 820],
      ];
      p.wash(body, C.red, { alpha: 0.95 });
      p.poly(body, true, { w: 3 });
      const cap: Pt[] = [];
      for (let i = 0; i <= 20; i++) {
        const a = Math.PI + (i / 20) * Math.PI;
        cap.push([240 + Math.cos(a) * 190, 200 + Math.sin(a) * 110]);
      }
      p.wash(cap, C.red, { alpha: 0.95 });
      p.poly(cap, false, { w: 3 });
      p.line(50, 200, 430, 200, { w: 3 });
      p.rect(40, 188, 400, 26, { w: 2.4 });
      // slot
      p.washRect(130, 300, 220, 36, "#2d2b28", { alpha: 1, always: true });
      p.rect(130, 300, 220, 36, { w: 2.4 });
      p.text("SAY HI!", 240, 400, { size: 64, color: p.painting ? "#fff8ea" : "#1c1a17" });
      // door
      p.rect(130, 460, 220, 260, { w: 2.2 });
      p.rect(150, 500, 180, 70, { w: 1.6, passes: 1 });
      p.text("collections: always", 240, 535, { size: 22, font: PRINT_FONT, weight: 400, color: p.painting ? "#fff8ea" : "#1c1a17" });
      p.ellipse(320, 640, 10, 10, { w: 2 });
      // base
      p.washRect(40, 820, 400, 60, "#2d2b28", { alpha: 0.9 });
      p.rect(40, 820, 400, 60, { w: 3 });
      p.hatch(body.map(([x, y]) => [x > 200 ? x : 340, y] as Pt), { gap: 10, alpha: 0.25 });
      // letter going in
      const letter = rectPts(170, 250, 140, 70);
      p.wash(letter, "#fffdf6", { alpha: 1, always: true });
      p.poly(letter, true, { w: 2 });
      p.line(170, 250, 240, 290, { w: 1.4, passes: 1 });
      p.line(310, 250, 240, 290, { w: 1.4, passes: 1 });
    },
  });
}

export function contactNoteArt(email: string) {
  return art({
    key: `contact-note-${email}`,
    w: 1000,
    h: 700,
    draw: (p) => {
      p.washRect(0, 0, 1000, 700, C.woodDark, { alpha: 0.6 });
      p.rect(6, 6, 988, 688, { w: 3 });
      const t = taped(p, 60, 50, 880, 600, -0.015, "#fffdf6");
      for (let i = 0; i < 9; i++) {
        const [x1, y1] = t.pt(-400, -180 + i * 50);
        const [x2, y2] = t.pt(400, -180 + i * 50);
        p.line(x1, y1, x2, y2, { w: 0.8, passes: 1, alpha: 0.25, color: p.painting ? C.navy : "#1c1a17" });
      }
      p.text("Let's build something.", ...t.pt(0, -210), { size: 84 });
      p.text(email, ...t.pt(0, -60), { size: 58, color: p.painting ? C.navy : "#1c1a17" });
      p.text("github · linkedin · resume", ...t.pt(0, 50), { size: 52 });
      p.text("(click the post box to get all the links)", ...t.pt(0, 170), { size: 34, font: PRINT_FONT, weight: 400, alpha: 0.7 });
      p.curve(
        [
          [...t.pt(-300, -170)] as Pt,
          [...t.pt(0, -160)] as Pt,
          [...t.pt(300, -175)] as Pt,
        ],
        { w: 3 },
      );
    },
  });
}

export function paperPlaneArt() {
  return art({
    key: "paper-plane",
    w: 400,
    h: 220,
    transparent: true,
    draw: (p) => {
      const plane: Pt[] = [
        [30, 120],
        [370, 40],
        [140, 190],
      ];
      p.wash(plane, "#fffdf6", { alpha: 1, always: true });
      p.poly(plane, true, { w: 2.6 });
      p.line(370, 40, 150, 150, { w: 2 });
      p.line(150, 150, 140, 190, { w: 2 });
      p.hatch(
        [
          [370, 40],
          [150, 150],
          [140, 190],
        ],
        { gap: 8, alpha: 0.3 },
      );
    },
  });
}
