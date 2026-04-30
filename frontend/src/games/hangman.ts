import type { Game, GameResult } from "./types";

// ---------------------------------------------------------------------------
// Hangman — guess the word one letter at a time.
// ---------------------------------------------------------------------------

interface State {
  word: string;
  guessed: string[]; // unique sorted
  wrong: string[]; // unique in order
  over: boolean;
  won: boolean;
  lastMessage?: string;
}

const MAX_WRONG = 6;

const WORDS = [
  "portfolio", "engineer", "firmware", "oscilloscope", "capacitor",
  "inductor", "resistor", "microcontroller", "silicon", "soldering",
  "schematic", "bandwidth", "algorithm", "recursion", "pipeline",
  "kernel", "operator", "symphony", "turbulent", "adventure",
  "mountain", "horizon", "constellation", "labyrinth", "paradox",
  "reservoir", "journey", "whisper", "harmony", "crystalline",
  "volcano", "glacier", "continent", "infrared", "ultraviolet",
  "photosphere", "neutrino", "quantum", "magnetic", "voltage",
  "polarity", "antenna", "waveform", "oscillate", "harmonic",
  "impedance", "transistor", "diode", "amplifier", "rectifier",
];

function pickWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

const GALLOWS = [
  // 0 wrong
  [
    "  ┌─────┐  ",
    "  │     │  ",
    "  │        ",
    "  │        ",
    "  │        ",
    "  │        ",
    "──┴──      ",
  ],
  // 1 wrong — head
  [
    "  ┌─────┐  ",
    "  │     │  ",
    "  │     O  ",
    "  │        ",
    "  │        ",
    "  │        ",
    "──┴──      ",
  ],
  // 2 wrong — torso
  [
    "  ┌─────┐  ",
    "  │     │  ",
    "  │     O  ",
    "  │     │  ",
    "  │        ",
    "  │        ",
    "──┴──      ",
  ],
  // 3 — + left arm
  [
    "  ┌─────┐  ",
    "  │     │  ",
    "  │     O  ",
    "  │    ╱│  ",
    "  │        ",
    "  │        ",
    "──┴──      ",
  ],
  // 4 — + right arm
  [
    "  ┌─────┐  ",
    "  │     │  ",
    "  │     O  ",
    "  │    ╱│╲ ",
    "  │        ",
    "  │        ",
    "──┴──      ",
  ],
  // 5 — + left leg
  [
    "  ┌─────┐  ",
    "  │     │  ",
    "  │     O  ",
    "  │    ╱│╲ ",
    "  │    ╱   ",
    "  │        ",
    "──┴──      ",
  ],
  // 6 — + right leg, full
  [
    "  ┌─────┐  ",
    "  │     │  ",
    "  │     O  ",
    "  │    ╱│╲ ",
    "  │    ╱ ╲ ",
    "  │        ",
    "──┴──      ",
  ],
];

function init(): State {
  return {
    word: pickWord(),
    guessed: [],
    wrong: [],
    over: false,
    won: false,
  };
}

function masked(word: string, guessed: string[]): string {
  const set = new Set(guessed);
  return word
    .split("")
    .map((ch) => (set.has(ch) ? ch : "_"))
    .join(" ");
}

function render(s: State): string {
  const gallows = GALLOWS[Math.min(s.wrong.length, GALLOWS.length - 1)].join("\n");
  const word = masked(s.word, s.guessed);
  const wrongList = s.wrong.length > 0 ? s.wrong.join(" ") : "(none)";
  const left = MAX_WRONG - s.wrong.length;

  const lines = [
    "  HANGMAN",
    "",
    gallows,
    "",
    `  word:   ${word}`,
    `  wrong:  ${wrongList}`,
    `  left:   ${left}`,
  ];
  if (s.lastMessage) lines.push(`  ${s.lastMessage}`);
  if (s.over) {
    lines.push("");
    if (s.won) lines.push(`  YOU WIN! The word was "${s.word}".`);
    else lines.push(`  YOU LOSE. The word was "${s.word}".`);
    lines.push("  Type 'r' to play again, 'q' or Esc to quit.");
  } else {
    lines.push("");
    lines.push("  Type a single letter or the full word. 'q' or Esc to quit.");
  }
  return lines.join("\n");
}

export const hangman: Game<State> = {
  id: "hangman",
  name: "Hangman",
  description: "Guess the hidden word one letter at a time.",
  category: "word",
  mode: "lines",
  howTo: "Type a letter (e.g. 'e') or guess the whole word. 'q' to quit.",

  init,
  render,

  update(state, input): GameResult<State> {
    if (input.type === "key" && input.key === "Escape") return { state, exit: true };
    if (input.type !== "line") return { state };

    const raw = input.line.trim().toLowerCase();
    if (!raw) return { state };
    if (raw === "q" || raw === "quit" || raw === "exit") return { state, exit: true };
    if (raw === "r" || raw === "restart") return { state: init() };
    if (state.over) return { state };

    // Full-word guess
    if (raw.length > 1) {
      if (!/^[a-z]+$/.test(raw)) {
        return { state: { ...state, lastMessage: "letters only" } };
      }
      if (raw === state.word) {
        // Fill in all remaining letters
        const all = Array.from(new Set(state.word.split(""))).sort();
        return { state: { ...state, guessed: all, won: true, over: true, lastMessage: undefined } };
      }
      // Wrong full-word guess eats a life
      return tickWrong(state, raw[0] ?? "?");
    }

    // Single letter
    if (!/^[a-z]$/.test(raw)) {
      return { state: { ...state, lastMessage: "a-z only" } };
    }
    if (state.guessed.includes(raw) || state.wrong.includes(raw)) {
      return { state: { ...state, lastMessage: `already tried '${raw}'` } };
    }
    if (state.word.includes(raw)) {
      const guessed = [...state.guessed, raw].sort();
      const won = state.word.split("").every((ch) => guessed.includes(ch));
      return {
        state: {
          ...state,
          guessed,
          won,
          over: won,
          lastMessage: won ? undefined : `good: '${raw}'`,
        },
      };
    }
    return tickWrong(state, raw);
  },
};

function tickWrong(state: State, letter: string): GameResult<State> {
  const wrong = [...state.wrong, letter];
  const lost = wrong.length >= MAX_WRONG;
  return {
    state: {
      ...state,
      wrong,
      over: lost,
      lastMessage: lost ? undefined : `no '${letter}'`,
    },
  };
}
