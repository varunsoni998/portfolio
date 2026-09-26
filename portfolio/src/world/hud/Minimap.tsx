import { useMemo } from "react";
import { mulberry32 } from "../sketch/ink";
import { CORRIDOR_END_Z, ROOMS, progressToZ, type RoomId } from "../worldConfig";
import { useWorld, world } from "../store";
import { DOOR_THEME } from "../drawings/corridor";

const TOP = 26;
const BOTTOM = 226;
const CX0 = 82;
const CX1 = 108;
const zToY = (z: number) => BOTTOM - (z / CORRIDOR_END_Z) * (BOTTOM - TOP);

function wobbleRect(x: number, y: number, w: number, h: number, seed: number) {
  const r = mulberry32(seed);
  const j = () => (r() - 0.5) * 1.6;
  const o = () => r() * 3;
  return [
    `M${x - o()} ${y + j()} L${x + w + o()} ${y + j()}`,
    `M${x + w + j()} ${y - o()} L${x + w + j()} ${y + h + o()}`,
    `M${x + w + o()} ${y + h + j()} L${x - o()} ${y + h + j()}`,
    `M${x + j()} ${y + h + o()} L${x + j()} ${y - o()}`,
  ].join(" ");
}

/** A hand-drawn floor plan pinned to the corner; click a room to walk there. */
export default function Minimap() {
  const phase = useWorld((s) => s.phase);
  const progress = useWorld((s) => s.progress);
  const visited = useWorld((s) => s.visited);
  const active = useWorld((s) => s.activeRoom);

  const rooms = useMemo(
    () =>
      ROOMS.map((room, i) => {
        const y = zToY(room.z) - 11;
        const x = room.side === "left" ? 8 : CX1 + 4;
        return { room, x, y, w: 70, h: 22, path: wobbleRect(x, y, 70, 22, 11 + i * 7) };
      }),
    [],
  );
  const corridor = useMemo(() => `M${CX0} ${BOTTOM} L${CX0} ${TOP} L${CX1} ${TOP} L${CX1} ${BOTTOM}`, []);

  let dotY = zToY(progressToZ(progress));
  let dotX = (CX0 + CX1) / 2;
  if (phase === "intro" || phase === "entrance") dotY = BOTTOM + 16;
  if (active && (phase === "room" || phase === "transition")) {
    const r = rooms.find((x) => x.room.id === active);
    if (r) {
      dotY = r.y + r.h / 2;
      dotX = r.x + r.w / 2;
    }
  }

  const go = (id: RoomId) => world.set({ travelTo: id, sheet: null });

  return (
    <nav className="wg-map" aria-label="Floor plan">
      <div className="wg-map-title">floor plan</div>
      <svg viewBox="0 0 190 256" role="list">
        <path d={corridor} fill="none" stroke="#1c1a17" strokeWidth="2.2" strokeLinecap="round" />
        {/* front door */}
        <path d={`M${CX0 + 4} ${BOTTOM} L${CX1 - 4} ${BOTTOM}`} stroke="#4a8a86" strokeWidth="4" strokeLinecap="round" />
        <text x={(CX0 + CX1) / 2} y={BOTTOM + 28} textAnchor="middle">
          entrance
        </text>
        {/* exit */}
        <path d={`M${CX0 + 4} ${TOP} L${CX1 - 4} ${TOP}`} stroke="#4f7e3e" strokeWidth="4" strokeLinecap="round" />
        <text x={(CX0 + CX1) / 2} y={TOP - 8} textAnchor="middle">
          exit
        </text>
        {rooms.map(({ room, x, y, w, h, path }) => {
          const seen = visited.includes(room.id);
          const doorX = room.side === "left" ? CX0 : CX1;
          return (
            <g
              key={room.id}
              className="room"
              role="listitem"
              tabIndex={0}
              aria-label={`Walk to ${room.label}`}
              onClick={() => go(room.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  go(room.id);
                }
              }}
            >
              <rect x={x} y={y} width={w} height={h} fill={seen ? DOOR_THEME[room.id].color : "#fffdf7"} fillOpacity={seen ? 0.55 : 1} stroke="none" />
              <path d={path} fill="none" stroke="#1c1a17" strokeWidth="1.8" strokeLinecap="round" />
              <path d={`M${doorX} ${y + 6} L${doorX} ${y + h - 6}`} stroke="#fffdf7" strokeWidth="4" />
              <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle">
                {room.label}
              </text>
            </g>
          );
        })}
        {/* you are here */}
        <g style={{ transition: "transform 0.25s linear" }} transform={`translate(${dotX} ${dotY})`}>
          <circle r="6" fill="#cf5a4b" stroke="#1c1a17" strokeWidth="1.6" />
          <circle r="11" fill="none" stroke="#cf5a4b" strokeWidth="1.2" opacity="0.6">
            <animate attributeName="r" values="7;13;7" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </nav>
  );
}
