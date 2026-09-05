/**
 * There's no real composed music or licensed sound library here — I can't
 * legally source either. What this provides instead is honest: a small,
 * quiet ambient pad (a few slow, detuned oscillators through a lowpass
 * filter with a slow LFO on the cutoff) and short synthesized door/handle
 * sounds (filtered noise bursts), all generated at runtime with the Web
 * Audio API. Respects autoplay restrictions — nothing starts until the
 * visitor's first interaction (see WorldGate.tsx), and there's a mute
 * toggle in the UI.
 */

let ctx: AudioContext | null = null;
let ambientNodes: { oscillators: OscillatorNode[]; gain: GainNode; filter: BiquadFilterNode } | null = null;
let masterGain: GainNode | null = null;
let muted = false;

function getContext(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

export function startAmbient() {
  const audioCtx = getContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  if (ambientNodes) return;

  const gain = audioCtx.createGain();
  gain.gain.value = 0;
  gain.connect(masterGain!);

  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 400;
  filter.connect(gain);

  const freqs = [55, 82.4, 110];
  const oscillators = freqs.map((f, i) => {
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;
    osc.detune.value = i * 4;
    osc.connect(filter);
    osc.start();
    return osc;
  });

  const lfo = audioCtx.createOscillator();
  lfo.frequency.value = 0.05;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 150;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  gain.gain.linearRampToValueAtTime(muted ? 0 : 0.06, audioCtx.currentTime + 2);

  ambientNodes = { oscillators: [...oscillators, lfo], gain, filter };
}

export function setMuted(next: boolean) {
  muted = next;
  if (ambientNodes && ctx) {
    ambientNodes.gain.gain.linearRampToValueAtTime(muted ? 0 : 0.06, ctx.currentTime + 0.3);
  }
}

export function isMuted() {
  return muted;
}

/** A short, dry "clunk" for door/handle interactions — filtered noise, not a sample. */
export function playDoorSound() {
  if (muted) return;
  const audioCtx = getContext();
  if (audioCtx.state === "suspended") audioCtx.resume();

  const duration = 0.18;
  const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 320;
  filter.Q.value = 0.8;

  const gain = audioCtx.createGain();
  gain.gain.value = 0.35;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain!);
  source.start();
}
