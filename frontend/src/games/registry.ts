import type { Game } from "./types";
import { snake } from "./snake";
import { game2048 } from "./game2048";
import { hangman } from "./hangman";
import { tictactoe } from "./tictactoe";
import { blackjack } from "./blackjack";

// All registered games. Add new games here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GAMES: ReadonlyArray<Game<any>> = [
  snake,
  game2048,
  hangman,
  tictactoe,
  blackjack,
];

const BY_ID = new Map(GAMES.map((g) => [g.id.toLowerCase(), g]));
// Also register human-friendly aliases (e.g. "tic-tac-toe" for "tictactoe")
const ALIASES: Record<string, string> = {
  "tic-tac-toe": "tictactoe",
  "ttt": "tictactoe",
  "bj": "blackjack",
  "21": "blackjack",
  "2048": "2048",
};

export function findGame(nameOrId: string): Game | undefined {
  const k = nameOrId.trim().toLowerCase();
  if (BY_ID.has(k)) return BY_ID.get(k);
  const aliased = ALIASES[k];
  if (aliased && BY_ID.has(aliased)) return BY_ID.get(aliased);
  // Fuzzy: match by display name start
  const byName = GAMES.find((g) => g.name.toLowerCase() === k);
  if (byName) return byName;
  return undefined;
}

/** Formatted multi-line string for the `games` terminal command. */
export function formatGamesList(): string {
  const byCat = new Map<string, Game[]>();
  for (const g of GAMES) {
    const list = byCat.get(g.category) ?? [];
    list.push(g);
    byCat.set(g.category, list);
  }
  const lines: string[] = [
    "Available games — type `play <name>` to launch, `quit` or Esc to exit.",
    "",
  ];
  const order = ["action", "puzzle", "card", "classic", "word", "quiz", "luck"];
  for (const cat of order) {
    const games = byCat.get(cat);
    if (!games || games.length === 0) continue;
    lines.push(`  ── ${cat.toUpperCase()} ──`);
    for (const g of games) {
      lines.push(`  ${g.id.padEnd(14)} ${g.description}`);
    }
    lines.push("");
  }
  lines.push(`Total: ${GAMES.length} games.`);
  return lines.join("\n");
}
