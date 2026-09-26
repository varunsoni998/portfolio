/**
 * The floating, morphing glow from the video reference: a soft blob of
 * warm light that sits behind the card and bleeds into the gray page
 * behind it.
 *
 * That reference is a single full-screen view, so the glow just sits
 * fixed near the bottom of the screen. This portfolio scrolls — the
 * card is many viewport-heights tall — so a viewport-`fixed` glow
 * mostly ends up hidden behind the opaque card for the entire middle
 * of the page (that was the bug in the previous version: it only
 * peeked out right at the very top or very bottom of the whole page).
 *
 * Fixed here by making it `absolute` inside the page-relative wrapper
 * (App.tsx) instead of viewport-fixed, and anchoring it to the hero —
 * so it's sitting behind the card right where the page loads, visible
 * in the top/side margins immediately, the way it is in the reference.
 */
export default function MorphingGlow() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-[42rem] animate-drift"
      aria-hidden="true"
    >
      <div className="h-full w-full animate-morph bg-accent/30 blur-[90px]" />
    </div>
  );
}
