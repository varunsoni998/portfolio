import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import EntranceGround from "./EntranceGround";
import EntranceDoor, { type EntranceDoorHandle } from "./EntranceDoor";
import WorldShell from "./WorldShell";
import Character from "./Character";
import Door, { type PhysicalDoorHandle } from "./Door";
import ExitDoor from "./ExitDoor";
import AboutRoom from "./rooms/AboutRoom";
import ProjectsRoom from "./rooms/ProjectsRoom";
import AiLabRoom from "./rooms/AiLabRoom";
import SkillsRoom from "./rooms/SkillsRoom";
import ExperienceRoom from "./rooms/ExperienceRoom";
import ContactRoom from "./rooms/ContactRoom";
import { useVirtualScroll } from "./useVirtualScroll";
import { pointAt, tangentAt, roomEntryPath, roomCenter, roomYaw } from "./worldPath";
import { ROOMS, EXIT_DOOR_PROGRESS, type RoomDef, type RoomId } from "./worldConfig";
import { playDoorSound, startAmbient } from "./audio";

type Phase = "entrance" | "transition" | "corridor" | "room";

const ENTRANCE_START = { x: 0, y: 1.6, z: 10, lookX: 0, lookY: 1.6, lookZ: 6 };

const ROOM_COMPONENTS: Record<RoomId, typeof AboutRoom> = {
  about: AboutRoom,
  projects: ProjectsRoom,
  "ai-lab": AiLabRoom,
  skills: SkillsRoom,
  experience: ExperienceRoom,
  contact: ContactRoom,
};

interface WorldExperienceProps {
  reducedMotion: boolean;
  onExitToSite: () => void;
}

/**
 * Everything the visitor sees and interacts with lives in one continuous
 * scene — the entrance, the corridor, and every room are all mounted (or
 * conditionally mounted, for performance) inside the same Canvas, so the
 * camera can genuinely travel from one to the next rather than the scene
 * being swapped out from under it. `camObj` is the single source of truth
 * for where the camera is and what it's looking at each frame; both the
 * scroll-driven corridor walk and every GSAP-scripted door transition
 * write into it, and one useFrame below is the only thing that actually
 * moves the real Three.js camera.
 */
export default function WorldExperience({ reducedMotion, onExitToSite }: WorldExperienceProps) {
  const { camera } = useThree();
  const [phase, setPhase] = useState<Phase>("entrance");
  const [activeRoomId, setActiveRoomId] = useState<RoomId | null>(null);

  const camObj = useRef({ ...ENTRANCE_START });
  const phaseRef = useRef<Phase>("entrance");
  const entranceHandle = useRef<EntranceDoorHandle>({ hinge: null });
  const doorHandles = useRef<Map<string, PhysicalDoorHandle>>(new Map());

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const progressRef = useVirtualScroll({
    onProgress: (p) => {
      if (phaseRef.current !== "corridor") return;
      if (p >= EXIT_DOOR_PROGRESS + 0.02) handleExitDoorReached();
    },
  });

  // Per-frame corridor walk — only authoritative while phase === "corridor".
  const smoothedProgress = useRef(0);
  useFrame((state) => {
    if (phaseRef.current !== "corridor") return;
    const ease = reducedMotion ? 1 : 0.08;
    smoothedProgress.current += (progressRef.current - smoothedProgress.current) * ease;

    const position = pointAt(smoothedProgress.current);
    const tangent = tangentAt(smoothedProgress.current);
    camObj.current.x = position.x;
    camObj.current.y = position.y;
    camObj.current.z = position.z;

    let lookX = position.x + tangent.x;
    let lookY = position.y + tangent.y;
    const lookZ = position.z + tangent.z;
    if (!reducedMotion) {
      lookX += state.mouse.x * 0.6;
      lookY += state.mouse.y * 0.3;
    }
    camObj.current.lookX = lookX;
    camObj.current.lookY = lookY;
    camObj.current.lookZ = lookZ;
  });

  // Apply camObj to the real camera every frame, regardless of who wrote it.
  useFrame(() => {
    camera.position.set(camObj.current.x, camObj.current.y, camObj.current.z);
    camera.lookAt(camObj.current.lookX, camObj.current.lookY, camObj.current.lookZ);
  });

  function handleEnterMain() {
    if (phaseRef.current !== "entrance") return;
    startAmbient();
    playDoorSound();
    setPhase("transition");

    if (entranceHandle.current.hinge) {
      gsap.to(entranceHandle.current.hinge.rotation, { y: -1.7, duration: reducedMotion ? 0.2 : 0.9, ease: "power2.out" });
    }

    const threshold = { x: 0, y: 1.6, z: 6.5, lookX: 0, lookY: 1.6, lookZ: 0 };
    const settle = pointAt(0);
    const settleTangent = tangentAt(0.02);

    const tl = gsap.timeline({
      delay: reducedMotion ? 0 : 0.35,
      onComplete: () => {
        smoothedProgress.current = 0;
        setPhase("corridor");
      },
    });
    tl.to(camObj.current, { ...threshold, duration: reducedMotion ? 0.2 : 1, ease: "power2.inOut" }).to(camObj.current, {
      x: settle.x,
      y: settle.y,
      z: settle.z,
      lookX: settle.x + settleTangent.x,
      lookY: settle.y + settleTangent.y,
      lookZ: settle.z + settleTangent.z,
      duration: reducedMotion ? 0.2 : 1.1,
      ease: "power2.inOut",
    });
  }

  function handleSelectRoom(room: RoomDef) {
    if (phaseRef.current !== "corridor") return;
    playDoorSound();
    setActiveRoomId(room.id); // mount the room now so it's visible through the opening door
    setPhase("transition");

    const handle = doorHandles.current.get(room.id);
    if (handle?.hinge) {
      gsap.to(handle.hinge.rotation, { y: room.side === "right" ? 1.7 : -1.7, duration: reducedMotion ? 0.2 : 0.9, ease: "power2.out" });
    }

    const { doorPos, settlePos, lookPos } = roomEntryPath(room.progress, room.side);
    const tl = gsap.timeline({ onComplete: () => setPhase("room") });
    tl.to(camObj.current, {
      x: doorPos.x,
      y: doorPos.y,
      z: doorPos.z,
      lookX: settlePos.x,
      lookY: settlePos.y,
      lookZ: settlePos.z,
      duration: reducedMotion ? 0.2 : 0.9,
      ease: "power2.inOut",
    }).to(camObj.current, {
      x: settlePos.x,
      y: settlePos.y,
      z: settlePos.z,
      lookX: lookPos.x,
      lookY: lookPos.y,
      lookZ: lookPos.z,
      duration: reducedMotion ? 0.2 : 0.9,
      ease: "power2.inOut",
    });
  }

  function handleExitRoom() {
    if (phaseRef.current !== "room" || !activeRoomId) return;
    const room = ROOMS.find((r) => r.id === activeRoomId);
    if (!room) return;
    playDoorSound();
    setPhase("transition");

    const handle = doorHandles.current.get(room.id);
    const backAtCorridor = pointAt(room.progress);
    const backTangent = tangentAt(room.progress);
    const { doorPos } = roomEntryPath(room.progress, room.side);

    const tl = gsap.timeline({
      onComplete: () => {
        setActiveRoomId(null);
        setPhase("corridor");
      },
    });
    tl.to(camObj.current, {
      x: doorPos.x,
      y: doorPos.y,
      z: doorPos.z,
      lookX: backAtCorridor.x + backTangent.x,
      lookY: backAtCorridor.y + backTangent.y,
      lookZ: backAtCorridor.z + backTangent.z,
      duration: reducedMotion ? 0.2 : 0.8,
      ease: "power2.inOut",
    }).to(camObj.current, {
      x: backAtCorridor.x,
      y: backAtCorridor.y,
      z: backAtCorridor.z,
      lookX: backAtCorridor.x + backTangent.x,
      lookY: backAtCorridor.y + backTangent.y,
      lookZ: backAtCorridor.z + backTangent.z,
      duration: reducedMotion ? 0.2 : 0.7,
      ease: "power2.inOut",
    });
    if (handle?.hinge) {
      gsap.to(handle.hinge.rotation, { y: 0, duration: reducedMotion ? 0.2 : 0.7, ease: "power2.inOut" });
    }
  }

  function handleExitDoorReached() {
    if (phaseRef.current !== "corridor") return;
    setPhase("transition");
    playDoorSound();
    gsap.delayedCall(reducedMotion ? 0.1 : 0.5, onExitToSite);
  }

  const activeRoom = useMemo(() => ROOMS.find((r) => r.id === activeRoomId) ?? null, [activeRoomId]);
  const ActiveRoomComponent = activeRoom ? ROOM_COMPONENTS[activeRoom.id] : null;

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[2, 6, 2]} intensity={0.5} />

      <EntranceGround />
      <EntranceDoor onSelect={handleEnterMain} registerRef={(refs) => (entranceHandle.current = refs)} disabled={phase !== "entrance"} />

      <WorldShell />
      <Character progressRef={progressRef} />
      {ROOMS.map((room) => (
        <Door
          key={room.id}
          room={room}
          onSelect={handleSelectRoom}
          registerRef={(id, refs) => doorHandles.current.set(id, refs)}
        />
      ))}
      <ExitDoor progress={EXIT_DOOR_PROGRESS} onSelect={handleExitDoorReached} />

      {activeRoom && ActiveRoomComponent && (
        <ActiveRoomComponent
          center={roomCenter(activeRoom.progress, activeRoom.side)}
          yaw={roomYaw(activeRoom.progress, activeRoom.side) + Math.PI}
          onExit={handleExitRoom}
        />
      )}
    </>
  );
}
