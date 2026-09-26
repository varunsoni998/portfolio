import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import RoomShell from "./RoomShell";
import { ArtPlane } from "../../sketch/Paintable";
import {
  cityWindowArt,
  contactNoteArt,
  corkboardArt,
  deskArt,
  diplomaArt,
  labBenchArt,
  labelCardArt,
  mailboxArt,
  paperPlaneArt,
  portraitArt,
  projectFrameArt,
  skillsShelfArt,
  toolScreenArt,
} from "../../drawings/rooms";
import { benchArt, tallPlantArt, smallPlantArt, framedPictureArt } from "../../drawings/corridor";
import { ROOM_DEPTH as D, ROOM_WIDTH as W, type RoomDef, type RoomId } from "../../worldConfig";
import { world, type SheetId } from "../../store";
import { site } from "@/data/site";
import { projects } from "@/data/projects";
import { aiLabTools } from "@/data/aiLabTools";
import { SKILLS, WHAT_I_BUILD, CURRENTLY_BUILDING_STAGES } from "@/data/homeContent";

const BACK = -D / 2 + 0.04;
const open = (sheet: SheetId) => () => world.set({ sheet });

interface RoomProps {
  room: RoomDef;
  arrived: boolean;
}

function Plant({ x, z, v = 0, painted }: { x: number; z: number; v?: number; painted: boolean }) {
  const a = useMemo(() => tallPlantArt(v), [v]);
  return (
    <Billboard position={[x, 0.86, z]} lockX lockZ>
      <ArtPlane art={a} width={0.8} painted={painted} paintDelay={0.6} />
    </Billboard>
  );
}

function AboutRoom({ room, arrived }: RoomProps) {
  const portrait = useMemo(() => portraitArt(), []);
  const diploma = useMemo(() => diplomaArt(), []);
  const desk = useMemo(() => deskArt(), []);
  const win = useMemo(() => cityWindowArt(), []);
  return (
    <RoomShell room={room} title="About me" painted={arrived}>
      <ArtPlane art={portrait} width={1.45} position={[-1.35, 1.95, BACK]} paint="hover" label="Who I am" onClick={open({ kind: "about" })} />
      <ArtPlane art={diploma} width={1.25} position={[1.45, 2.35, BACK]} paint="hover" label="Education" onClick={open({ kind: "about" })} />
      <ArtPlane art={desk} width={2.5} position={[1.3, 0.69, BACK + 0.55]} painted={arrived} paintDelay={0.4} />
      <ArtPlane art={win} width={1.5} position={[-W / 2 + 0.03, 2.0, -0.6]} rotation={[0, Math.PI / 2, 0]} painted={arrived} paintDelay={0.8} />
      <Plant x={-2.8} z={-2.4} painted={arrived} />
    </RoomShell>
  );
}

function ProjectsRoom({ room, arrived }: RoomProps) {
  const list = projects.slice(0, 3);
  const bench = useMemo(() => benchArt(), []);
  const frames = useMemo(() => list.map((p) => projectFrameArt(p.slug, p.name, p.status.toLowerCase())), [list]);
  const labels = useMemo(() => list.map((p) => labelCardArt(p.name, p.subtitle, p.slug)), [list]);
  return (
    <RoomShell room={room} title="Projects" painted={arrived}>
      {list.map((p, i) => {
        const x = (i - (list.length - 1) / 2) * 2.25;
        return (
          <group key={p.slug}>
            <ArtPlane art={frames[i]} width={1.95} position={[x, 2.15, BACK]} paint="hover" label={`${p.name} — open`} onClick={open({ kind: "project", slug: p.slug })} />
            <ArtPlane art={labels[i]} width={1.8} position={[x, 0.95, BACK + 0.01]} painted={arrived} paintDelay={0.3 + i * 0.2} onClick={open({ kind: "project", slug: p.slug })} label={`${p.name} — open`} />
          </group>
        );
      })}
      <ArtPlane art={bench} width={2.2} position={[W / 2 - 0.35, 0.43, 0.2]} rotation={[0, -Math.PI / 2, 0]} painted={arrived} />
    </RoomShell>
  );
}

function AiLabRoom({ room, arrived }: RoomProps) {
  const tools = aiLabTools.slice(0, 6);
  const screens = useMemo(() => tools.map((t) => toolScreenArt(t.slug, t.title, t.infra, t.available)), [tools]);
  const bench = useMemo(() => labBenchArt(), []);
  const neural = useMemo(() => framedPictureArt("neural"), []);
  return (
    <RoomShell room={room} title="AI Lab" painted={arrived}>
      {tools.map((t, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <ArtPlane
            key={t.slug}
            art={screens[i]}
            width={1.3}
            position={[(col - 1) * 2.1, 2.55 - row * 1.3, BACK]}
            paint="hover"
            label={`${t.title} — details`}
            onClick={open({ kind: "tool", slug: t.slug })}
          />
        );
      })}
      <ArtPlane art={bench} width={3.0} position={[-W / 2 + 0.45, 0.76, -0.6]} rotation={[0, Math.PI / 2, 0]} paint="hover" label="About the lab" onClick={open({ kind: "lab" })} />
      <ArtPlane art={neural} width={1.4} position={[W / 2 - 0.03, 2.2, -0.6]} rotation={[0, -Math.PI / 2, 0]} painted={arrived} />
    </RoomShell>
  );
}

function SkillsRoom({ room, arrived }: RoomProps) {
  const shelf = useMemo(() => skillsShelfArt(SKILLS), []);
  const small = useMemo(() => smallPlantArt(), []);
  return (
    <RoomShell room={room} title="Skills" painted={arrived}>
      <ArtPlane art={shelf} width={3.4} position={[0, 1.56, BACK]} paint="hover" label="My toolbox — open" onClick={open({ kind: "skills" })} />
      <Plant x={-2.7} z={-2.5} v={1} painted={arrived} />
      <Plant x={2.7} z={-2.5} painted={arrived} />
      <ArtPlane art={small} width={0.5} position={[W / 2 - 0.03, 1.3, 0]} rotation={[0, -Math.PI / 2, 0]} painted={arrived} />
    </RoomShell>
  );
}

function ExperienceRoom({ room, arrived }: RoomProps) {
  const board = useMemo(() => corkboardArt(WHAT_I_BUILD, CURRENTLY_BUILDING_STAGES), []);
  const bench = useMemo(() => benchArt(), []);
  const graph = useMemo(() => framedPictureArt("graph"), []);
  return (
    <RoomShell room={room} title="Experience" painted={arrived}>
      <ArtPlane art={board} width={4.0} position={[0, 1.9, BACK]} paint="hover" label="What I build — open" onClick={open({ kind: "experience" })} />
      <ArtPlane art={bench} width={2.2} position={[-W / 2 + 0.35, 0.43, 0.2]} rotation={[0, Math.PI / 2, 0]} painted={arrived} />
      <ArtPlane art={graph} width={1.5} position={[W / 2 - 0.03, 2.1, -0.5]} rotation={[0, -Math.PI / 2, 0]} painted={arrived} />
    </RoomShell>
  );
}

function FloatingPlane({ position, phase }: { position: [number, number, number]; phase: number }) {
  const a = useMemo(() => paperPlaneArt(), []);
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime + phase;
    ref.current.position.y = position[1] + Math.sin(t * 1.3) * 0.08;
    ref.current.rotation.z = Math.sin(t * 0.9) * 0.08;
  });
  return (
    <group ref={ref} position={position}>
      <ArtPlane art={a} width={0.7} />
    </group>
  );
}

function ContactRoom({ room, arrived }: RoomProps) {
  const box = useMemo(() => mailboxArt(), []);
  const note = useMemo(() => contactNoteArt(site.links.email.replace("mailto:", "")), []);
  return (
    <RoomShell room={room} title="Contact" painted={arrived}>
      <ArtPlane art={box} width={1.05} position={[-2.1, 0.99, BACK + 0.5]} paint="hover" label="Post a letter — get in touch" onClick={open({ kind: "contact" })} />
      <ArtPlane art={note} width={3.1} position={[0.9, 2.05, BACK]} paint="hover" label="Contact details" onClick={open({ kind: "contact" })} />
      <FloatingPlane position={[-0.4, 2.75, -1.6]} phase={0} />
      <FloatingPlane position={[2.5, 2.9, -1.2]} phase={1.7} />
      <Plant x={2.8} z={-2.5} painted={arrived} />
    </RoomShell>
  );
}

const COMPONENTS: Record<RoomId, (p: RoomProps) => JSX.Element> = {
  about: AboutRoom,
  projects: ProjectsRoom,
  "ai-lab": AiLabRoom,
  skills: SkillsRoom,
  experience: ExperienceRoom,
  contact: ContactRoom,
};

export default function Room({ room, arrived }: RoomProps) {
  const C = COMPONENTS[room.id];
  return <C room={room} arrived={arrived} />;
}
