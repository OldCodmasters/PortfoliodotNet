import type { Game, GameResult } from "./types";

// ---------------------------------------------------------------------------
// Snake — classic real-time arrow-key snake. Dies on walls and self-bite.
// ---------------------------------------------------------------------------

interface SnakeState {
  width: number;
  height: number;
  snake: Array<[number, number]>; // head first
  dir: [number, number];
  nextDir: [number, number];
  food: [number, number];
  score: number;
  over: boolean;
}

const W = 30;
const H = 15;

function spawnFood(snake: Array<[number, number]>): [number, number] {
  const occupied = new Set(snake.map(([x, y]) => `${x},${y}`));
  // Try up to 200 random positions, fall back to linear scan.
  for (let i = 0; i < 200; i++) {
    const x = Math.floor(Math.random() * W);
    const y = Math.floor(Math.random() * H);
    if (!occupied.has(`${x},${y}`)) return [x, y];
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!occupied.has(`${x},${y}`)) return [x, y];
    }
  }
  return [0, 0];
}

function init(): SnakeState {
  const mid: [number, number] = [Math.floor(W / 2), Math.floor(H / 2)];
  const snake: Array<[number, number]> = [mid, [mid[0] - 1, mid[1]], [mid[0] - 2, mid[1]]];
  return {
    width: W,
    height: H,
    snake,
    dir: [1, 0],
    nextDir: [1, 0],
    food: spawnFood(snake),
    score: 0,
    over: false,
  };
}

function render(s: SnakeState): string {
  const grid: string[][] = Array.from({ length: s.height }, () =>
    Array.from({ length: s.width }, () => " "),
  );
  s.snake.forEach(([x, y], i) => {
    grid[y][x] = i === 0 ? "◆" : "■";
  });
  const [fx, fy] = s.food;
  if (!s.over) grid[fy][fx] = "✦";

  const top = "┌" + "─".repeat(s.width) + "┐";
  const bottom = "└" + "─".repeat(s.width) + "┘";
  const rows = grid.map((row) => "│" + row.join("") + "│").join("\n");

  const header = `  SNAKE   score: ${s.score}   length: ${s.snake.length}`;
  const footer = s.over
    ? "  GAME OVER — press R to restart, Esc to quit"
    : "  ←↑↓→ / WASD to steer   Esc to quit";

  return [header, top, rows, bottom, footer].join("\n");
}

function keyToDir(key: string): [number, number] | null {
  switch (key) {
    case "ArrowUp":
    case "w":
    case "W":
      return [0, -1];
    case "ArrowDown":
    case "s":
    case "S":
      return [0, 1];
    case "ArrowLeft":
    case "a":
    case "A":
      return [-1, 0];
    case "ArrowRight":
    case "d":
    case "D":
      return [1, 0];
    default:
      return null;
  }
}

export const snake: Game<SnakeState> = {
  id: "snake",
  name: "Snake",
  description: "Steer the snake. Eat the sparkle. Don't bite yourself.",
  category: "action",
  mode: "keys",
  tickMs: 130,
  howTo: "Arrow keys or WASD to steer. Esc to quit. R to restart after game over.",

  init,
  render,

  update(state, input): GameResult<SnakeState> {
    if (input.type === "key") {
      if (input.key === "Escape") return { state, exit: true };
      if (state.over && (input.key === "r" || input.key === "R")) return { state: init() };
      const d = keyToDir(input.key);
      if (d) {
        // Prevent instant 180° reverse (would self-bite)
        const [cx, cy] = state.dir;
        if (d[0] !== -cx || d[1] !== -cy) {
          return { state: { ...state, nextDir: d } };
        }
      }
      return { state };
    }

    if (input.type === "tick") {
      if (state.over) return { state };

      const dir = state.nextDir;
      const [hx, hy] = state.snake[0];
      const [nx, ny] = [hx + dir[0], hy + dir[1]];

      // Wall collision
      if (nx < 0 || nx >= state.width || ny < 0 || ny >= state.height) {
        return { state: { ...state, over: true } };
      }
      // Self bite (the tail tip moves, so check snake minus last segment)
      const willGrow = nx === state.food[0] && ny === state.food[1];
      const body = willGrow ? state.snake : state.snake.slice(0, -1);
      if (body.some(([x, y]) => x === nx && y === ny)) {
        return { state: { ...state, over: true } };
      }

      const newSnake: Array<[number, number]> = [[nx, ny], ...body];
      const newFood = willGrow ? spawnFood(newSnake) : state.food;
      const newScore = willGrow ? state.score + 10 : state.score;

      return {
        state: {
          ...state,
          snake: newSnake,
          dir,
          food: newFood,
          score: newScore,
        },
      };
    }

    return { state };
  },
};
