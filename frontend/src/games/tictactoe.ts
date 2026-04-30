import type { Game, GameResult } from "./types";

// ---------------------------------------------------------------------------
// Tic-Tac-Toe — player (X) vs unbeatable minimax AI (O).
// ---------------------------------------------------------------------------

type Cell = "X" | "O" | " ";
interface State {
  board: Cell[];
  turn: "X" | "O";
  winner: "X" | "O" | null;
  draw: boolean;
  over: boolean;
  message?: string;
}

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winnerOf(b: Cell[]): "X" | "O" | null {
  for (const [a, c, d] of LINES) {
    if (b[a] !== " " && b[a] === b[c] && b[c] === b[d]) return b[a] as "X" | "O";
  }
  return null;
}

function isDraw(b: Cell[]): boolean {
  return b.every((c) => c !== " ") && winnerOf(b) === null;
}

/** Minimax: O maximizes (score = +1 for O win, -1 for X win, 0 draw). */
function minimax(b: Cell[], turn: "X" | "O"): { score: number; move: number } {
  const w = winnerOf(b);
  if (w === "O") return { score: 1, move: -1 };
  if (w === "X") return { score: -1, move: -1 };
  if (isDraw(b)) return { score: 0, move: -1 };

  let bestScore = turn === "O" ? -Infinity : Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (b[i] !== " ") continue;
    const nb = [...b];
    nb[i] = turn;
    const { score } = minimax(nb, turn === "O" ? "X" : "O");
    if (turn === "O" ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }
  return { score: bestScore, move: bestMove };
}

function init(): State {
  return {
    board: Array(9).fill(" ") as Cell[],
    turn: "X",
    winner: null,
    draw: false,
    over: false,
  };
}

function render(s: State): string {
  const cell = (i: number) => (s.board[i] === " " ? String(i + 1) : s.board[i]);
  const row = (a: number, b: number, c: number) =>
    `   ${cell(a)} │ ${cell(b)} │ ${cell(c)}`;

  const lines = [
    "  TIC-TAC-TOE   you: X   ai: O",
    "",
    row(0, 1, 2),
    "  ───┼───┼───",
    row(3, 4, 5),
    "  ───┼───┼───",
    row(6, 7, 8),
    "",
  ];
  if (s.message) lines.push(`  ${s.message}`);
  if (s.over) {
    lines.push(
      s.winner ? `  ${s.winner} wins!` : "  Draw.",
      "  Type 'r' to play again, 'q' or Esc to quit.",
    );
  } else {
    lines.push(`  your move (X) — type 1-9   'q' or Esc to quit`);
  }
  return lines.join("\n");
}

export const tictactoe: Game<State> = {
  id: "tictactoe",
  name: "Tic-Tac-Toe",
  description: "Play X against an unbeatable minimax AI.",
  category: "classic",
  mode: "lines",
  howTo: "Type 1-9 for the cell you want. 'r' to restart, 'q' to quit.",

  init,
  render,

  update(state, input): GameResult<State> {
    if (input.type === "key" && input.key === "Escape") return { state, exit: true };
    if (input.type !== "line") return { state };

    const raw = input.line.trim().toLowerCase();
    if (!raw) return { state };
    if (raw === "q" || raw === "quit") return { state, exit: true };
    if (raw === "r" || raw === "restart") return { state: init() };
    if (state.over) return { state };

    const idx = Number(raw) - 1;
    if (!Number.isInteger(idx) || idx < 0 || idx > 8) {
      return { state: { ...state, message: "enter 1-9" } };
    }
    if (state.board[idx] !== " ") {
      return { state: { ...state, message: "cell already taken" } };
    }

    // Player move
    const board: Cell[] = [...state.board];
    board[idx] = "X";
    let w = winnerOf(board);
    if (w || isDraw(board)) {
      return {
        state: { ...state, board, winner: w, draw: !w, over: true, message: undefined },
      };
    }

    // AI move
    const { move } = minimax(board, "O");
    if (move >= 0) board[move] = "O";
    w = winnerOf(board);
    const draw = isDraw(board);
    return {
      state: {
        ...state,
        board,
        winner: w,
        draw,
        over: w !== null || draw,
        message: undefined,
      },
    };
  },
};
