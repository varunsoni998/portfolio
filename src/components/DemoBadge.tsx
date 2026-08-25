/** Labels a mock-mode result so it's never mistaken for a real production output. */
export default function DemoBadge() {
  return (
    <span className="rounded-full border border-amber/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber">
      Demo
    </span>
  );
}
