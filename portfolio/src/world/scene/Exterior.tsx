import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { ArtPlane, PaintGroup, usePaintBehaviour } from "../sketch/Paintable";
import { makePaintMaterial, makeSketchMaterial, tiledPlane } from "../sketch/art";
import {
  FACADE,
  bubbleArt,
  bushArt,
  cloudArt,
  doormatArt,
  facadeArt,
  groundArt,
  lampPostArt,
  mainDoorArt,
  pathArt,
  pottedShrubArt,
  sconceArt,
  signArt,
  treeArt,
  windowArt,
} from "../drawings/exterior";
import { edgeArt, C } from "../drawings/common";
import { trimArt } from "../drawings/corridor";
import { ArtBox } from "../sketch/Paintable";
import { site } from "@/data/site";
import { useWorld } from "../store";

export interface MainDoorHandle {
  left: THREE.Group | null;
  right: THREE.Group | null;
}

/** The facade: a brick wall with a real doorway cut out of it. */
function Facade({ painted }: { painted: boolean }) {
  const a = useMemo(() => facadeArt(), []);
  const geometry = useMemo(() => {
    const hw = FACADE.w / 2;
    const dw = FACADE.doorW / 2;
    const shape = new THREE.Shape();
    shape.moveTo(-hw, 0);
    shape.lineTo(-dw, 0);
    shape.lineTo(-dw, FACADE.doorH);
    shape.lineTo(dw, FACADE.doorH);
    shape.lineTo(dw, 0);
    shape.lineTo(hw, 0);
    shape.lineTo(hw, FACADE.h);
    shape.lineTo(-hw, FACADE.h);
    shape.closePath();
    const g = new THREE.ShapeGeometry(shape);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + hw) / FACADE.w, pos.getY(i) / FACADE.h);
    uv.needsUpdate = true;
    return g;
  }, []);
  const material = useMemo(() => makePaintMaterial(a), [a]);
  const ref = useRef<THREE.Mesh>(null);
  usePaintBehaviour(material, ref as React.RefObject<THREE.Object3D>, {
    painted,
    paintDuration: 3.2,
    paintDelay: 0.2,
    paintOrigin: [0.5, 0.25],
  });
  return <mesh ref={ref} geometry={geometry} material={material} position={[0, 0, 0.02]} />;
}

/** Thick reveal around the doorway so the wall reads as having depth. */
function DoorReveal() {
  const trim = useMemo(() => trimArt(), []);
  const side = useMemo(() => edgeArt(C.stone, "reveal"), []);
  const depth = 0.34;
  const t = 0.14;
  return (
    <group>
      <ArtBox size={[t, FACADE.doorH, depth]} position={[-FACADE.doorW / 2 - t / 2 + 0.02, FACADE.doorH / 2, -depth / 2 + 0.02]} front={trim} side={side} />
      <ArtBox size={[t, FACADE.doorH, depth]} position={[FACADE.doorW / 2 + t / 2 - 0.02, FACADE.doorH / 2, -depth / 2 + 0.02]} front={trim} side={side} />
      <ArtBox size={[FACADE.doorW + 0.2, t, depth]} position={[0, FACADE.doorH + t / 2 - 0.02, -depth / 2 + 0.02]} front={side} side={side} />
      {/* front step */}
      <ArtBox size={[FACADE.doorW + 0.9, 0.16, 0.9]} position={[0, 0.08, 0.45]} front={side} side={side} top={side} />
    </group>
  );
}

function DoorLeaf({ side, group, disabled, onEnter }: { side: "left" | "right"; group: PaintGroup; disabled: boolean; onEnter: () => void }) {
  const a = useMemo(() => mainDoorArt(side), [side]);
  const edge = useMemo(() => edgeArt(C.teal, "main-door"), []);
  const leafW = FACADE.doorW / 2 - 0.02;
  const leafH = FACADE.doorH - 0.04;
  const mats = useMemo(() => {
    const front = makePaintMaterial(a);
    const back = makePaintMaterial(edge);
    return { list: [back, back, back, back, front, back], front, back };
  }, [a, edge]);
  const ref = useRef<THREE.Mesh>(null);
  const handlers = usePaintBehaviour(mats.front, ref as React.RefObject<THREE.Object3D>, {
    paint: "hover",
    group,
    disabled,
    label: disabled ? undefined : "Come in — click the door",
    onClick: onEnter,
  });
  usePaintBehaviour(mats.back, ref as React.RefObject<THREE.Object3D>, { paint: "hover", group });
  const dir = side === "left" ? 1 : -1;
  return (
    <mesh ref={ref} material={mats.list} position={[(dir * leafW) / 2, leafH / 2, 0]} {...handlers}>
      <boxGeometry args={[leafW, leafH, 0.07]} />
    </mesh>
  );
}

export function MainDoor({ onEnter, registerRef, disabled }: { onEnter: () => void; registerRef: (h: MainDoorHandle) => void; disabled: boolean }) {
  const group = useMemo(() => new PaintGroup(), []);
  const handles = useRef<MainDoorHandle>({ left: null, right: null });
  return (
    <group position={[0, 0.02, -0.12]}>
      <group
        position={[-FACADE.doorW / 2, 0, 0]}
        ref={(g) => {
          handles.current.left = g;
          registerRef(handles.current);
        }}
      >
        <DoorLeaf side="left" group={group} disabled={disabled} onEnter={onEnter} />
      </group>
      <group
        position={[FACADE.doorW / 2, 0, 0]}
        ref={(g) => {
          handles.current.right = g;
          registerRef(handles.current);
        }}
      >
        <DoorLeaf side="right" group={group} disabled={disabled} onEnter={onEnter} />
      </group>
    </group>
  );
}

function Ground() {
  const a = useMemo(() => groundArt(), []);
  const geometry = useMemo(() => tiledPlane(120, 120, 5, 5), []);
  const material = useMemo(() => makeSketchMaterial(a.sketch), [a]);
  return <mesh geometry={geometry} material={material} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} />;
}

function Bubble({ visible }: { visible: boolean }) {
  const a = useMemo(() => bubbleArt("psst... it's open!", "click the door to come in"), []);
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = 3.95 + Math.sin(clock.elapsedTime * 2) * 0.05;
    const target = visible ? 1 : 0;
    const s = ref.current.scale.x + (target - ref.current.scale.x) * 0.12;
    ref.current.scale.setScalar(Math.max(0.0001, s));
  });
  return (
    <group ref={ref} position={[2.7, 3.95, 0.6]} scale={0.0001}>
      <ArtPlane art={a} width={2.5} paint="always" />
    </group>
  );
}

function Cloud({ i, position, width }: { i: number; position: [number, number, number]; width: number }) {
  const a = useMemo(() => cloudArt(i), [i]);
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.x = position[0] + Math.sin(clock.elapsedTime * 0.05 + i) * 1.5;
  });
  return (
    <group ref={ref} position={position}>
      <ArtPlane art={a} width={width} paint="always" />
    </group>
  );
}

/** Everything outside the front door. */
export default function Exterior({ onEnter, registerDoor }: { onEnter: () => void; registerDoor: (h: MainDoorHandle) => void }) {
  const phase = useWorld((s) => s.phase);
  const awake = phase !== "intro";
  const atEntrance = phase === "entrance";

  const sign = useMemo(() => signArt(site.name, site.role), []);
  const win = useMemo(() => windowArt(), []);
  const tree = useMemo(() => treeArt(), []);
  const lamp = useMemo(() => lampPostArt(), []);
  const bush0 = useMemo(() => bushArt(0), []);
  const bush1 = useMemo(() => bushArt(1), []);
  const path = useMemo(() => pathArt(), []);
  const mat = useMemo(() => doormatArt(), []);
  const shrub = useMemo(() => pottedShrubArt(), []);
  const sconce = useMemo(() => sconceArt(), []);

  return (
    <group>
      <Ground />
      <Facade painted={awake} />
      <DoorReveal />
      <MainDoor onEnter={onEnter} registerRef={registerDoor} disabled={!atEntrance} />

      {/* sign board above the door */}
      <ArtPlane art={sign} width={3.6} position={[0, FACADE.doorH + 1.15, 0.06]} painted={awake} paintDelay={0.6} paintDuration={1.6} />
      {/* windows either side */}
      <ArtPlane art={win} width={2.0} position={[-5.1, 2.35, 0.05]} painted={awake} paintDelay={0.9} />
      <ArtPlane art={win} width={2.0} position={[5.1, 2.35, 0.05]} painted={awake} paintDelay={1.1} />
      {/* wall lanterns */}
      <ArtPlane art={sconce} width={0.5} position={[-1.95, 2.65, 0.08]} painted={awake} paintDelay={1.3} />
      <ArtPlane art={sconce} width={0.5} position={[1.95, 2.65, 0.08]} painted={awake} paintDelay={1.3} />
      {/* planters beside the step */}
      <ArtPlane art={shrub} width={0.8} position={[-2.25, 0.67, 0.55]} painted={awake} paintDelay={1.5} />
      <ArtPlane art={shrub} width={0.8} position={[2.25, 0.67, 0.55]} painted={awake} paintDelay={1.6} />
      {/* bushes along the base of the wall */}
      <ArtPlane art={bush0} width={2.6} position={[-5.2, 0.7, 0.35]} painted={awake} paintDelay={1.2} />
      <ArtPlane art={bush1} width={2.4} position={[5.3, 0.66, 0.35]} painted={awake} paintDelay={1.4} />
      {/* doormat & path */}
      <ArtPlane art={mat} width={1.5} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.17, 0.5]} painted={awake} paintDelay={0.8} />
      <ArtPlane art={path} width={2.2} height={4.4} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 3.15]} painted={awake} paintDelay={1.0} />
      {/* tree & street lamp in the front yard */}
      <Billboard position={[-5.6, 3.0, 3.2]} lockX lockZ>
        <ArtPlane art={tree} width={4} painted={awake} paintDelay={0.5} paintDuration={2} />
      </Billboard>
      <Billboard position={[4.3, 2.3, 3.6]} lockX lockZ>
        <ArtPlane art={lamp} width={1.15} painted={awake} paintDelay={0.7} />
      </Billboard>
      {/* sky */}
      <Cloud i={0} position={[-6, 9.5, -14]} width={6} />
      <Cloud i={1} position={[5, 11, -18]} width={7} />
      <Cloud i={2} position={[14, 8.5, -10]} width={5} />
      <Cloud i={3} position={[-16, 10, -12]} width={6} />

      <Bubble visible={atEntrance} />
    </group>
  );
}
