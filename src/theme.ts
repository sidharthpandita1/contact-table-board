/** Small deterministic hash so a name always gets the same hue. */
function hash(text: string): number {
  let h = 0
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

/** Hues that stay clean in OKLCH at low chroma (no muddy yellow-greens). */
const HUES = [18, 42, 150, 178, 205, 232, 262, 290, 322, 350]

export function hueFor(text: string): number {
  return HUES[hash(text) % HUES.length]
}

/**
 * Owners are a small known team, so each gets a fixed hue and reads the same everywhere.
 * In a real product this would come from the user's profile.
 */
const TEAM_HUES: Record<string, number> = {
  'Sam Lee': 290,
  'Ravi Nair': 178,
  'Jess Park': 18,
}

export function ownerHue(owner: string): number {
  return TEAM_HUES[owner] ?? hueFor(owner)
}

/** Label dots: small colour cue, chip itself stays neutral so Stage keeps the colour. */
export function labelHue(label: string): number {
  return hueFor(label)
}
