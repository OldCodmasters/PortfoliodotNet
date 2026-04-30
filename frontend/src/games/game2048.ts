import type { Game, GameResult } from "./types";

// ---------------------------------------------------------------------------
// 2048 — slide tiles, merge equal neighbors, reach 2048.
// ---------------------------------------------------------------------------

interface State {
  grid: number[][];
  score: number;
  over: boolean;
  won: boolean;
  sawWinMessage: boolean; // only show "You win!" once, keep playing after
}

const SIZE = 4;

function spawnTile(grid: number[][]): void {
  const empties: Array<[number, number]> = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) empties.push([r, c]);
    }
  }
  if (empties.length === 0) return;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function slideRow(row: number[]): { row: number[]; gained: number } {
  const compact = row.filter((n) => n !== 0);
  let gained = 0;
  for (let i = 0; i < compact.length - 1; i++) {
    if (compact[i] === compact[i + 1]) {
      compact[i] *= 2;
      gained += compact[i];
      compact.splice(i + 1, 1);
    }
  }
  while (compact.length < SIZE) compact.push(0);
  return { row: compact, gained };
}

function reverse<T>(arr: T[]): T[] {
  return [...arr].reverse();
}

function transpose(g: number[][]): number[][] {
  return g[0].map((_, c) => g.map((row) => row[c]));
}

function move(
  grid: number[][],
  dir: "left" | "right" | "up" | "down",
): { grid: number[][]; gained: number; moved: boolean } {
  let g = grid.map((row) => [...row]);
  let totalGained = 0;

  if (dir === "up" || dir === "down") g = transpose(g);
  if (dir === "right" || dir === "down") g = g.map((row) => reverse(row));

  g = g.map((row) => {
    const { row: next, gained } = slideRow(row);
    totalGained += gained;
    return next;
  });

  if (dir === "right" || dir === "down") g = g.map((row) => reverse(row));
  if (dir === "up" || dir === "down") g = transpose(g);

  const moved = g.some((row, r) => row.some((v, c) => v !== grid[r][c]));
  return { grid: g, gained: totalGained, moved };
}

function hasMoves(grid: number[][]): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return true;
      if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return true;
      if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return true;
    }
  }
  return false;
}

function init(): State {
  const grid: number[][] = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => 0),
  );
  spawnTile(grid);
  spawnTile(grid);
  return { grid, score: 0, over: false, won: false, sawWinMessage: false };
}

function cellStr(n: number): string {
  if (n === 0) return "    .";
  return String(n).padStart(5, " ");
}

function render(s: State): string {
  const head = `  2048   score: ${s.score}`;
  const sep = "  +" + "-------+".repeat(SIZE);
  const rows: string[] = [];
  for (let r = 0; r < SIZE; r++) {
    rows.push(sep);
    rows.push("  |" + s.grid[r].map((n) => ` ${cellStr(n)} |`).join(""));
  }
  rows.push(sep);
  const footer = s.over
    ? "  GAME OVER — press R to restart, Esc to quit"
    : s.won && !s.sawWinMessage
      ? "  YOU WIN! Press any arrow to keep going, Esc to quit"
      : "  ←↑↓→ / WASD to move   R to restart   Esc to quit";
  return [head, ...rows, footer].join("\n");
}

type Dir = "left" | "right" | "up" | "down";
function keyToDir(key: string): Dir | null {
  switch (key) {
    case "ArrowLeft":
    case "a":
    case "A":
      return "left";
    case "ArrowRight":
    case "d":
    case "D":
      return "right";
    case "ArrowUp":
    case "w":
    case "W":
      return "up";
    case "ArrowDown":
    case "s":
    case "S":
      return "down";
    default:
      return null;
  }
}

export const game2048: Game<State> = {
  id: "2048",
  name: "2048",
  description: "Slide tiles, merge equal neighbors, reach 2048.",
  category: "puzzle",
  mode: "keys",
  howTo: "Arrow keys or WASD to slide tiles. R to restart. Esc to quit.",

  init,
  render,

  update(state, input): GameResult<State> {
    if (input.type !== "key") return { state };
    if (input.key === "Escape") return { state, exit: true };
    if (input.key === "r" || input.key === "R") return { state: init() };

    const dir = keyToDir(input.key);
    if (!dir || state.over) return { state };

    const { grid, gained, moved } = move(state.grid, dir);
    if (!moved) return { state };

    spawnTile(grid);
    const newScore = state.score + gained;
    const won = state.won || grid.some((row) => row.some((v) => v >= 2048));
    const over = !hasMoves(grid);
    const sawWinMessage = won ? true : state.sawWinMessage;

    return {
      state: { grid, score: newScore, over, won, sawWinMessage },
    };
  },
};
