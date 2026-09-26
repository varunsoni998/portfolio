import { forwardRef, useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { gsap } from "gsap";
import { makePaintMaterial, type Art, type PaintMaterial } from "./art";
import { world } from "../store";

/**
 * How a drawing turns from pencil sketch into watercolour:
 *  - "hover":  paints outward from the cursor while hovered, un-paints on leave
 *  - "near":   paints itself once the camera walks within `radius`, and stays painted
 *  - "always": painted from the start
 *  - "none":   stays a sketch
 */
export type PaintMode = "hover" | "near" | "always" | "none";

export interface PaintBehaviour {
  paint?: PaintMode;
  radius?: number;
  /** Forces the painted state (e.g. a room you've already visited). */
  painted?: boolean;
  paintDuration?: number;
  paintDelay?: number;
  /** uv the forced paint spreads out from. */
  paintOrigin?: [number, number];
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Share hover state with sibling materials (e.g. both leaves of a double door). */
  group?: PaintGroup;
}

/** Lets several meshes paint together when any one of them is hovered. */
export class PaintGroup {
  mats = new Set<PaintMaterial>();
  hovered = false;
  keep = false;
  paintTo(target: number, origin?: THREE.Vector2, duration = 1.1, delay = 0) {
    this.mats.forEach((m) => {
      const u = m.userData.uniforms;
      if (origin && u.uReveal.value < 0.05) u.uOrigin.value.copy(origin);
      gsap.to(u.uReveal, { value: target, duration, delay, ease: target > 0 ? "power2.out" : "power2.in", overwrite: true });
    });
  }
}

const tmp = new THREE.Vector3();

export function usePaintBehaviour(material: PaintMaterial, objectRef: React.RefObject<THREE.Object3D>, b: PaintBehaviour) {
  const { paint = "none", radius = 7, painted, label, onClick, disabled, group, paintDuration = 1.4, paintDelay = 0, paintOrigin } = b;
  const localGroup = useMemo(() => new PaintGroup(), []);
  const g = group ?? localGroup;

  useEffect(() => {
    g.mats.add(material);
    return () => {
      g.mats.delete(material);
    };
  }, [g, material]);

  useEffect(() => {
    if (paint === "always") material.userData.uniforms.uReveal.value = 1;
  }, [paint, material]);

  useEffect(() => {
    if (painted) {
      g.keep = true;
      g.paintTo(1, paintOrigin ? new THREE.Vector2(...paintOrigin) : undefined, paintDuration, paintDelay);
    } else if (paint === "hover") {
      g.keep = false;
      if (!g.hovered) g.paintTo(0, undefined, 0.6);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [painted, g, paint]);

  const nearDone = useRef(false);
  const frame = useRef(0);
  useFrame(({ camera }) => {
    if (paint !== "near" || nearDone.current || !objectRef.current) return;
    if (frame.current++ % 8) return;
    objectRef.current.getWorldPosition(tmp);
    if (tmp.distanceTo(camera.position) < radius) {
      nearDone.current = true;
      material.userData.uniforms.uOrigin.value.set(0.5, 0.35);
      gsap.to(material.userData.uniforms.uReveal, { value: 1, duration: 2.2, ease: "power1.out" });
    }
  });

  const interactive = paint === "hover" || !!onClick;
  if (!interactive) return {};

  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      if (disabled) return;
      e.stopPropagation();
      g.hovered = true;
      if (onClick) document.body.style.cursor = "pointer";
      if (label) world.set({ hoverLabel: label });
      if (paint === "hover" && e.uv) g.paintTo(1, e.uv);
    },
    onPointerOut: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      g.hovered = false;
      document.body.style.cursor = "auto";
      if (label && world.get().hoverLabel === label) world.set({ hoverLabel: null });
      if (paint === "hover" && !g.keep) g.paintTo(0, undefined, 0.8);
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (disabled || !onClick) return;
      e.stopPropagation();
      document.body.style.cursor = "auto";
      world.set({ hoverLabel: null });
      onClick();
    },
  };
}

type Vec3 = [number, number, number];

export interface ArtPlaneProps extends PaintBehaviour {
  art: Art;
  /** Width in world units; height follows the drawing's aspect unless given. */
  width: number;
  height?: number;
  position?: Vec3;
  rotation?: Vec3;
  doubleSide?: boolean;
  renderOrder?: number;
  children?: ReactNode;
}

export const ArtPlane = forwardRef<THREE.Mesh, ArtPlaneProps>(function ArtPlane(
  { art, width, height, position, rotation, doubleSide, renderOrder, children, ...behaviour },
  fwd,
) {
  const h = height ?? width / art.aspect;
  const material = useMemo(
    () => makePaintMaterial(art, { side: doubleSide ? THREE.DoubleSide : THREE.FrontSide }),
    [art, doubleSide],
  );
  const ref = useRef<THREE.Mesh>(null);
  const handlers = usePaintBehaviour(material, ref as React.RefObject<THREE.Object3D>, behaviour);
  return (
    <mesh
      ref={(m) => {
        (ref as React.MutableRefObject<THREE.Mesh | null>).current = m;
        if (typeof fwd === "function") fwd(m);
        else if (fwd) fwd.current = m;
      }}
      position={position}
      rotation={rotation}
      material={material}
      renderOrder={renderOrder}
      {...handlers}
    >
      <planeGeometry args={[width, h]} />
      {children}
    </mesh>
  );
});

export interface ArtBoxProps extends PaintBehaviour {
  size: Vec3;
  position?: Vec3;
  rotation?: Vec3;
  /** The +z face (front). */
  front: Art;
  /** Every other face. */
  side: Art;
  top?: Art;
}

/** A box whose front carries a drawing and whose other faces carry a plain sketched-edge panel. */
export function ArtBox({ size, position, rotation, front, side, top, ...behaviour }: ArtBoxProps) {
  const mats = useMemo(() => {
    const f = makePaintMaterial(front);
    const s = makePaintMaterial(side);
    const t = top ? makePaintMaterial(top) : s;
    // BoxGeometry face order: +x, -x, +y, -y, +z, -z
    return { list: [s, s, t, s, f, s], f, s, t };
  }, [front, side, top]);
  const ref = useRef<THREE.Mesh>(null);
  const group = useMemo(() => behaviour.group ?? new PaintGroup(), [behaviour.group]);
  const handlers = usePaintBehaviour(mats.f, ref as React.RefObject<THREE.Object3D>, { ...behaviour, group });
  usePaintBehaviour(mats.s, ref as React.RefObject<THREE.Object3D>, { ...behaviour, group, label: undefined, onClick: undefined });
  usePaintBehaviour(mats.t, ref as React.RefObject<THREE.Object3D>, { ...behaviour, group, label: undefined, onClick: undefined });
  return (
    <mesh ref={ref} position={position} rotation={rotation} material={mats.list} {...handlers}>
      <boxGeometry args={size} />
    </mesh>
  );
}
