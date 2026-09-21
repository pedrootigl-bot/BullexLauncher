/** Sons sintéticos de recompensa (Web Audio) — sem arquivos externos. */

let sharedContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  if (!AudioCtx) return null

  if (!sharedContext || sharedContext.state === 'closed') {
    sharedContext = new AudioCtx()
  }

  return sharedContext
}

async function ensureRunning(ctx: AudioContext) {
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch {
      // Autoplay bloqueado — silêncio até interação do usuário
    }
  }
}

function tone(
  ctx: AudioContext,
  {
    frequency,
    start,
    duration,
    type = 'sine',
    gain = 0.12,
    attack = 0.01,
    decay = 0.08,
    peak,
  }: {
    frequency: number
    start: number
    duration: number
    type?: OscillatorType
    gain?: number
    attack?: number
    decay?: number
    peak?: number
  },
) {
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  const max = peak ?? gain

  osc.type = type
  osc.frequency.setValueAtTime(frequency, start)

  amp.gain.setValueAtTime(0.0001, start)
  amp.gain.exponentialRampToValueAtTime(max, start + attack)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(attack + 0.02, duration - decay))

  osc.connect(amp)
  amp.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.05)
}

function noiseBurst(
  ctx: AudioContext,
  {
    start,
    duration,
    gain = 0.05,
    filterFreq = 1800,
  }: {
    start: number
    duration: number
    gain?: number
    filterFreq?: number
  },
) {
  const sampleRate = ctx.sampleRate
  const length = Math.floor(sampleRate * duration)
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length)
  }

  const source = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const amp = ctx.createGain()

  source.buffer = buffer
  filter.type = 'bandpass'
  filter.frequency.value = filterFreq
  filter.Q.value = 0.9

  amp.gain.setValueAtTime(0.0001, start)
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.015)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  source.connect(filter)
  filter.connect(amp)
  amp.connect(ctx.destination)
  source.start(start)
  source.stop(start + duration + 0.02)
}

/** Abertura do baú + fanfarra dopaminérgica sincronizada com a animação. */
export async function playRewardChestOpen() {
  const ctx = getContext()
  if (!ctx) return

  await ensureRunning(ctx)
  if (ctx.state !== 'running') return

  const t0 = ctx.currentTime

  // 1) Clique / tranca do baú
  noiseBurst(ctx, { start: t0, duration: 0.09, gain: 0.07, filterFreq: 420 })
  tone(ctx, {
    frequency: 110,
    start: t0,
    duration: 0.18,
    type: 'triangle',
    gain: 0.1,
    attack: 0.005,
    decay: 0.1,
  })

  // 2) Tampa abrindo (whoosh curto)
  noiseBurst(ctx, { start: t0 + 0.12, duration: 0.22, gain: 0.045, filterFreq: 2400 })

  // 3) Arpejo maior ascendente (recompensa)
  const chord = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  chord.forEach((frequency, index) => {
    tone(ctx, {
      frequency,
      start: t0 + 0.28 + index * 0.09,
      duration: 0.42,
      type: 'sine',
      gain: 0.11,
      peak: 0.14,
      attack: 0.012,
      decay: 0.12,
    })
    tone(ctx, {
      frequency: frequency * 2,
      start: t0 + 0.28 + index * 0.09,
      duration: 0.28,
      type: 'triangle',
      gain: 0.035,
      attack: 0.01,
      decay: 0.08,
    })
  })

  // 4) Cascata de "moedas" / sparkles (confete)
  const sparkles = [1318.5, 1568, 1760, 2093, 2349, 2637]
  sparkles.forEach((frequency, index) => {
    tone(ctx, {
      frequency,
      start: t0 + 0.62 + index * 0.055,
      duration: 0.16,
      type: 'sine',
      gain: 0.055,
      attack: 0.004,
      decay: 0.05,
    })
  })

  // 5) Acorde final de sucesso (check)
  const sting = [523.25, 659.25, 783.99, 987.77]
  sting.forEach((frequency, index) => {
    tone(ctx, {
      frequency,
      start: t0 + 1.45 + index * 0.02,
      duration: 0.55,
      type: index % 2 === 0 ? 'sine' : 'triangle',
      gain: 0.08,
      peak: 0.12,
      attack: 0.01,
      decay: 0.18,
    })
  })

  noiseBurst(ctx, { start: t0 + 1.45, duration: 0.12, gain: 0.03, filterFreq: 3200 })
}

/** Fanfarra curta para level-up. */
export async function playLevelUpFanfare() {
  const ctx = getContext()
  if (!ctx) return

  await ensureRunning(ctx)
  if (ctx.state !== 'running') return

  const t0 = ctx.currentTime
  const notes = [392, 523.25, 659.25, 783.99, 1046.5]

  notes.forEach((frequency, index) => {
    tone(ctx, {
      frequency,
      start: t0 + index * 0.085,
      duration: 0.38,
      type: 'sine',
      gain: 0.1,
      peak: 0.13,
      attack: 0.01,
      decay: 0.1,
    })
  })

  noiseBurst(ctx, { start: t0 + 0.35, duration: 0.15, gain: 0.035, filterFreq: 2800 })
}
