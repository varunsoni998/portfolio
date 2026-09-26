import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import Exterior, { type MainDoorHandle } from "./scene/Exterior";
import Corridor from "./scene/Corridor";
import Character from "./scene/Character";
import { EndDoor, SideDoor, type DoorHandle } from "./scene/Doors";
import Room from "./scene/rooms/Rooms";
import {
  CORRIDOR_END_Z,
  EYE_HEIGHT,
  ROOM_DEPTH,
  ROOMS,
  WALK_START_Z,
  progressToZ,
  roomCenter,
  sideYaw,
  zToProgress,
  type RoomDef,
} from "./worldConfig";
import { world, useWorld, type Phase } from "./store";
import { playDoorSound, playStepSound, startAmbient } from "./audio";

interface Cam {
  x: number;
  y: number;
  z: number;
  lx: number;
  ly: number;
  lz: number;
}

const ENTRANCE: Cam = { x: 0, y: EYE_HEIGHT, z: 7.6, lx: 0, ly: 2.55, lz: 0 };

function roomPoint(room: RoomDef, lx: number, ly: number, lz: number) {
  const [cx, , cz] = roomCenter(room);
  const t = sideYaw(room.side);
  return new THREE.Vector3(cx + lx * Math.cos(t) + lz * Math.sin(t), ly, cz - lx * Math.sin(t) + lz * Math.cos(t));
}

function setPhase(phase: Phase) {
  world.set({ phase });
}

/**
 * The single controller for everything that moves: it owns the camera,
 * converts wheel / touch / keys into a walk along the corridor, and
 * choreographs every door as one timeline (door swings, camera crosses
 * the threshold, the room paints itself in).
 */
export default function WorldExperience({ reducedMotion, onExitToSite }: { reducedMotion: boolean; onExitToSite: () => void }) {
  const { camera, gl, size } = useThree();
  const portrait = size.width / size.height < 0.8;
  const portraitRef = useRef(portrait);
  portraitRef.current = portrait;

  // Narrow screens: widen the lens and stand further back so rooms still fit.
  useEffect(() => {
    const pc = camera as THREE.PerspectiveCamera;
    pc.fov = portrait ? 72 : 55;
    pc.updateProjectionMatrix();
    if (world.get().phase === "intro" || world.get().phase === "entrance") {
      cam.current.z = portrait ? 10.5 : ENTRANCE.z;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portrait, camera]);
  const phase = useWorld((s) => s.phase);
  const activeRoomId = useWorld((s) => s.activeRoom);
  const visited = useWorld((s) => s.visited);
  const arrived = useWorld((s) => s.phase === "room");

  const cam = useRef<Cam>({ ...ENTRANCE, z: portrait ? 10.5 : ENTRANCE.z });
  const progress = useRef(0); // target
  const smooth = useRef(0); // what the camera is actually at
  const overscroll = useRef(0);
  const entranceScroll = useRef(0);
  const look = useRef({ x: 0, y: 0 });
  const bob = useRef(0);
  const lastStep = useRef(0);
  const mainDoor = useRef<MainDoorHandle>({ left: null, right: null });
  const endDoor = useRef<{ left: THREE.Group | null; right: THREE.Group | null }>({ left: null, right: null });
  const doors = useRef(new Map<string, DoorHandle>());
  const dur = (s: number) => (reducedMotion ? Math.min(0.25, s) : s);


  // ------------------------------------------------------------ sequences

  const enterBuilding = () => {
    if (world.get().phase !== "entrance") return;
    startAmbient();
    playDoorSound();
    setPhase("transition");
    world.set({ hoverLabel: null });
    const { left, right } = mainDoor.current;
    if (left) gsap.to(left.rotation, { y: 1.75, duration: dur(1.3), ease: "power2.inOut" });
    if (right) gsap.to(right.rotation, { y: -1.75, duration: dur(1.3), ease: "power2.inOut" });
    const tl = gsap.timeline({
      delay: dur(0.35),
      onComplete: () => {
        progress.current = 0;
        smooth.current = 0;
        setPhase("corridor");
        if (left) gsap.to(left.rotation, { y: 0, duration: 1.2, delay: 0.3, ease: "power2.inOut" });
        if (right) gsap.to(right.rotation, { y: 0, duration: 1.2, delay: 0.3, ease: "power2.inOut" });
      },
    });
    tl.to(cam.current, { x: 0, y: EYE_HEIGHT, z: 1.6, lx: 0, ly: 1.75, lz: -4, duration: dur(1.3), ease: "power2.inOut" }).to(cam.current, {
      z: WALK_START_Z,
      lz: WALK_START_Z - 5,
      ly: EYE_HEIGHT,
      duration: dur(1.1),
      ease: "power2.inOut",
    });
  };

  const enterRoom = (room: RoomDef) => {
    if (world.get().phase !== "corridor") return;
    playDoorSound();
    world.set({ activeRoom: room.id, phase: "transition", hoverLabel: null });
    progress.current = zToProgress(room.z);
    const hinge = doors.current.get(room.id)?.hinge;
    if (hinge) gsap.to(hinge.rotation, { y: 1.85, duration: dur(1.1), delay: dur(0.35), ease: "power2.inOut" });
    const pre = roomPoint(room, 0, EYE_HEIGHT, ROOM_DEPTH / 2 + 1.25);
    const doorway = roomPoint(room, 0, EYE_HEIGHT, ROOM_DEPTH / 2);
    const settle = roomPoint(room, 0, EYE_HEIGHT, portraitRef.current ? 3.1 : 1.35);
    const lookAt = roomPoint(room, 0, 1.75, -ROOM_DEPTH / 2);
    const tl = gsap.timeline({
      onComplete: () => {
        smooth.current = progress.current;
        const v = world.get().visited;
        world.set({ phase: "room", visited: v.includes(room.id) ? v : [...v, room.id] });
      },
    });
    tl.to(cam.current, { x: pre.x, z: pre.z, y: EYE_HEIGHT, lx: doorway.x, ly: 1.6, lz: doorway.z, duration: dur(0.9), ease: "power2.inOut" }).to(cam.current, {
      x: settle.x,
      z: settle.z,
      lx: lookAt.x,
      ly: lookAt.y,
      lz: lookAt.z,
      duration: dur(1.3),
      ease: "power2.inOut",
    });
  };

  const leaveRoom = (then?: () => void) => {
    const s = world.get();
    if (s.phase !== "room" || !s.activeRoom) return;
    const room = ROOMS.find((r) => r.id === s.activeRoom)!;
    playDoorSound();
    world.set({ phase: "transition", sheet: null, hoverLabel: null });
    const pre = roomPoint(room, 0, EYE_HEIGHT, ROOM_DEPTH / 2 + 0.2);
    const hinge = doors.current.get(room.id)?.hinge;
    const tl = gsap.timeline({
      onComplete: () => {
        progress.current = zToProgress(room.z);
        smooth.current = progress.current;
        world.set({ phase: "corridor", activeRoom: null });
        then?.();
      },
    });
    tl.to(cam.current, { x: pre.x, z: pre.z, lx: 0, ly: EYE_HEIGHT, lz: room.z - 2, duration: dur(1.0), ease: "power2.inOut" }).to(cam.current, {
      x: 0,
      z: room.z,
      lx: 0,
      ly: EYE_HEIGHT,
      lz: room.z - 5,
      duration: dur(0.8),
      ease: "power2.inOut",
    });
    if (hinge) gsap.to(hinge.rotation, { y: 0, duration: dur(0.8), delay: dur(1.0), ease: "power2.inOut" });
  };

  const exitBuilding = () => {
    if (world.get().phase !== "corridor") return;
    playDoorSound();
    setPhase("transition");
    const { left, right } = endDoor.current;
    if (left) gsap.to(left.rotation, { y: 1.6, duration: dur(1), ease: "power2.inOut" });
    if (right) gsap.to(right.rotation, { y: -1.6, duration: dur(1), ease: "power2.inOut" });
    gsap.to(cam.current, {
      x: 0,
      z: CORRIDOR_END_Z + 0.5,
      lx: 0,
      ly: EYE_HEIGHT,
      lz: CORRIDOR_END_Z - 6,
      duration: dur(1.6),
      delay: dur(0.3),
      ease: "power2.in",
      onComplete: onExitToSite,
    });
  };

  // ------------------------------------------------------------ input

  useEffect(() => {
    const el = gl.domElement.parentElement ?? window;
    const walk = (delta: number) => {
      const s = world.get();
      if (s.sheet) return;
      if (s.phase === "entrance") {
        if (delta > 0) entranceScroll.current += delta;
        if (entranceScroll.current > 260) enterBuilding();
        return;
      }
      if (s.phase !== "corridor") return;
      world.set({ travelTo: null });
      const next = Math.max(0, Math.min(1, progress.current + delta * 0.00034));
      if (next >= 1 && delta > 0 && smooth.current > 0.99) {
        overscroll.current += delta;
        if (overscroll.current > 1100) exitBuilding();
      } else overscroll.current = 0;
      progress.current = next;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      walk(e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY);
    };
    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY === null) return;
      const y = e.touches[0]?.clientY ?? touchY;
      walk((touchY - y) * 2.4);
      touchY = y;
    };
    const onKey = (e: KeyboardEvent) => {
      const s = world.get();
      if (e.key === "Escape") {
        if (s.sheet) world.set({ sheet: null });
        else if (s.phase === "room") leaveRoom();
        return;
      }
      if (s.sheet) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "PageDown" || e.key === "PageUp" || e.key === " ") {
        e.preventDefault();
        walk(e.key === "ArrowUp" || e.key === "PageUp" ? -160 : 160);
      }
      if (e.key === "Enter" && s.phase === "entrance") enterBuilding();
    };
    el.addEventListener("wheel", onWheel as EventListener, { passive: false });
    el.addEventListener("touchstart", onTouchStart as EventListener, { passive: true });
    el.addEventListener("touchmove", onTouchMove as EventListener, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("wheel", onWheel as EventListener);
      el.removeEventListener("touchstart", onTouchStart as EventListener);
      el.removeEventListener("touchmove", onTouchMove as EventListener);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl]);

  // "Exit room" requests from the HUD and minimap travel requests
  useEffect(
    () => {
      const unsub = world.subscribe(() => {
        const s = world.get();
        if (s.exitRequested) {
          world.set({ exitRequested: false });
          if (s.phase === "room") leaveRoom();
        }
      });
      return () => {
        unsub();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ------------------------------------------------------------ per frame

  const mirrorTick = useRef(0);
  useFrame((state, delta) => {
    const s = world.get();
    const p = s.phase;

    // minimap travel
    if (s.travelTo) {
      const room = ROOMS.find((r) => r.id === s.travelTo)!;
      if (p === "entrance") enterBuilding();
      else if (p === "room" && s.activeRoom !== room.id) leaveRoom();
      else if (p === "room") world.set({ travelTo: null });
      else if (p === "corridor") {
        progress.current = zToProgress(room.z);
        if (Math.abs(smooth.current - progress.current) < 0.004) {
          world.set({ travelTo: null });
          enterRoom(room);
        }
      }
    }

    // gentle mouse look everywhere
    // (held still while something is hovered, so the thing under the cursor doesn't slide away)
    const mx = reducedMotion ? 0 : state.pointer.x;
    const my = reducedMotion ? 0 : state.pointer.y;
    if (!s.hoverLabel) {
      look.current.x += (mx - look.current.x) * Math.min(1, delta * 2);
      look.current.y += (my - look.current.y) * Math.min(1, delta * 2);
    }

    if (p === "corridor") {
      const before = smooth.current;
      smooth.current += (progress.current - smooth.current) * Math.min(1, delta * (reducedMotion ? 30 : 3.2));
      const z = progressToZ(smooth.current);
      const speed = Math.abs(progressToZ(smooth.current) - progressToZ(before)) / Math.max(delta, 1e-4);
      bob.current += speed * delta;
      const bobY = reducedMotion ? 0 : Math.sin((bob.current / 0.75) * Math.PI) * 0.025 * Math.min(1, speed / 2);
      if (!reducedMotion && speed > 0.6 && bob.current - lastStep.current > 0.75) {
        lastStep.current = bob.current;
        playStepSound();
      }
      cam.current.x = 0;
      cam.current.y = EYE_HEIGHT + bobY;
      cam.current.z = z;
      cam.current.lx = Math.sin(look.current.x * 0.14) * 5;
      cam.current.ly = EYE_HEIGHT + look.current.y * 0.35;
      cam.current.lz = z - Math.cos(look.current.x * 0.14) * 5;
    }

    camera.position.set(cam.current.x, cam.current.y, cam.current.z);
    // extra parallax offset outside & in rooms (not while walking — already applied above)
    const extra = p === "corridor" ? 0 : 1;
    camera.lookAt(cam.current.lx + look.current.x * 0.35 * extra, cam.current.ly + look.current.y * 0.2 * extra, cam.current.lz);

    if (mirrorTick.current++ % 6 === 0 && p === "corridor") {
      const pr = smooth.current;
      if (Math.abs(pr - s.progress) > 0.001) world.set({ progress: pr });
    }
  });

  const activeRoom = ROOMS.find((r) => r.id === activeRoomId) ?? null;

  return (
    <>
      <Exterior onEnter={enterBuilding} registerDoor={(h) => (mainDoor.current = h)} />
      <Corridor />
      <Character progressRef={smooth} visible={phase === "corridor" || (phase === "transition" && !activeRoom)} />
      {ROOMS.map((room) => (
        <SideDoor
          key={room.id}
          room={room}
          visited={visited.includes(room.id)}
          disabled={phase !== "corridor"}
          onOpen={enterRoom}
          registerRef={(id, h) => doors.current.set(id, h)}
        />
      ))}
      <EndDoor onOpen={exitBuilding} registerRef={(h) => (endDoor.current = h)} disabled={phase !== "corridor"} />
      {activeRoom && <Room room={activeRoom} arrived={arrived} />}
    </>
  );
}
