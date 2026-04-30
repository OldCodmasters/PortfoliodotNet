// ---------------------------------------------------------------------------
// Terminal game engine — contract every game implements.
// Games live entirely on the client. The Terminal component owns game-mode
// lifecycle, dispatches input events, and renders the string returned by the
// game's `render(state)` function.
// ---------------------------------------------------------------------------

export type GameCategory = "action" | "puzzle" | "card" | "classic" | "quiz" | "luck" | "word";

export type GameInput =
  | { type: "key"; key: string; shift?: boolean; ctrl?: boolean }
  | { type: "line"; line: string }
  | { type: "tick" };

export interface GameResult<S> {
  /** Updated state. Return the same reference if nothing changed. */
  state: S;
  /** If true, game-mode exits back to the normal terminal. */
  exit?: boolean;
  /** Optional one-shot message printed after the game exits (e.g. "You won!"). */
  message?: string;
}

export interface Game<S = unknown> {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: GameCategory;

  /**
   * Input mode.
   *   "keys"  — every keypress is dispatched (arrow keys, letters, etc.). No input box.
   *   "lines" — user types a line and submits with Enter. Normal input box shown.
   */
  readonly mode: "keys" | "lines";

  /** If set, `update` is called with `{type: "tick"}` every `tickMs` ms. */
  readonly tickMs?: number;

  /** Instructions shown when the game starts. */
  readonly howTo: string;

  init(): S;
  render(state: S): string;
  update(state: S, input: GameInput): GameResult<S>;
}

/** Escape key — games should always accept this to exit. */
export const KEY_ESC = "Escape";
