import type { Game, GameResult } from "./types";

// ---------------------------------------------------------------------------
// Blackjack — classic rules, no betting. Dealer hits soft 17.
// ---------------------------------------------------------------------------

type Suit = "♠" | "♥" | "♦" | "♣";
interface Card {
  rank: number; // 1 (A) .. 13 (K)
  suit: Suit;
}

interface State {
  deck: Card[];
  player: Card[];
  dealer: Card[];
  phase: "player" | "dealer" | "done";
  result?: "win" | "lose" | "push" | "blackjack";
  wins: number;
  losses: number;
  pushes: number;
  message?: string;
}

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

function buildDeck(n = 4): Card[] {
  const d: Card[] = [];
  for (let i = 0; i < n; i++) {
    for (const s of SUITS) {
      for (let r = 1; r <= 13; r++) d.push({ rank: r, suit: s });
    }
  }
  return shuffle(d);
}

function shuffle<T>(a: T[]): T[] {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

function rankStr(r: number): string {
  if (r === 1) return "A";
  if (r === 11) return "J";
  if (r === 12) return "Q";
  if (r === 13) return "K";
  return String(r);
}

function cardStr(c: Card): string {
  return `${rankStr(c.rank)}${c.suit}`;
}

function handValue(hand: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    if (c.rank === 1) {
      total += 1;
      aces++;
    } else if (c.rank >= 10) total += 10;
    else total += c.rank;
  }
  let soft = false;
  if (aces > 0 && total + 10 <= 21) {
    total += 10;
    soft = true;
  }
  return { total, soft };
}

function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && handValue(hand).total === 21;
}

function dealIfEmpty(deck: Card[]): Card[] {
  return deck.length < 15 ? buildDeck(4) : deck;
}

function draw(deck: Card[]): [Card, Card[]] {
  const d = dealIfEmpty(deck);
  const card = d[0];
  return [card, d.slice(1)];
}

function init(prev?: { wins: number; losses: number; pushes: number }): State {
  let deck = buildDeck(4);
  const player: Card[] = [];
  const dealer: Card[] = [];
  let c: Card;
  [c, deck] = draw(deck); player.push(c);
  [c, deck] = draw(deck); dealer.push(c);
  [c, deck] = draw(deck); player.push(c);
  [c, deck] = draw(deck); dealer.push(c);

  const wins = prev?.wins ?? 0;
  const losses = prev?.losses ?? 0;
  const pushes = prev?.pushes ?? 0;

  // Immediate blackjack check
  const playerBJ = isBlackjack(player);
  const dealerBJ = isBlackjack(dealer);
  if (playerBJ || dealerBJ) {
    if (playerBJ && dealerBJ) {
      return { deck, player, dealer, phase: "done", result: "push", wins, losses, pushes: pushes + 1 };
    }
    if (playerBJ) {
      return { deck, player, dealer, phase: "done", result: "blackjack", wins: wins + 1, losses, pushes };
    }
    return { deck, player, dealer, phase: "done", result: "lose", wins, losses: losses + 1, pushes };
  }

  return { deck, player, dealer, phase: "player", wins, losses, pushes };
}

function render(s: State): string {
  const pVal = handValue(s.player);
  const showDealer = s.phase === "done" || s.phase === "dealer";
  const dealerHand = showDealer
    ? s.dealer.map(cardStr).join(" ")
    : `${cardStr(s.dealer[0])} [??]`;
  const dVal = showDealer ? handValue(s.dealer).total : handValue([s.dealer[0]]).total;

  const lines = [
    `  BLACKJACK   W:${s.wins}  L:${s.losses}  P:${s.pushes}`,
    "",
    `  dealer:  ${dealerHand}   ${showDealer ? dVal : "?"}`,
    `  you:     ${s.player.map(cardStr).join(" ")}   ${pVal.total}${pVal.soft ? " (soft)" : ""}`,
    "",
  ];
  if (s.message) lines.push(`  ${s.message}`, "");

  if (s.phase === "player") {
    lines.push("  type: 'hit' / 'h'  or  'stand' / 's'  ('q' or Esc to quit)");
  } else if (s.phase === "done") {
    const msg = {
      blackjack: "BLACKJACK! You win (3:2).",
      win: "You win.",
      lose: "Dealer wins.",
      push: "Push.",
    }[s.result ?? "push"];
    lines.push(`  ${msg}`, "  type 'deal' / 'd' to play again, 'q' to quit.");
  }
  return lines.join("\n");
}

export const blackjack: Game<State> = {
  id: "blackjack",
  name: "Blackjack",
  description: "Classic 21. Dealer hits soft 17. 4-deck shoe.",
  category: "card",
  mode: "lines",
  howTo: "Type 'hit' or 'stand'. 'deal' starts a new hand. 'q' quits.",

  init: () => init(),
  render,

  update(state, input): GameResult<State> {
    if (input.type === "key" && input.key === "Escape") return { state, exit: true };
    if (input.type !== "line") return { state };

    const raw = input.line.trim().toLowerCase();
    if (!raw) return { state };
    if (raw === "q" || raw === "quit") return { state, exit: true };

    if (state.phase === "done") {
      if (raw === "d" || raw === "deal" || raw === "r") {
        return { state: init({ wins: state.wins, losses: state.losses, pushes: state.pushes }) };
      }
      return { state: { ...state, message: "round over — type 'deal'" } };
    }

    if (state.phase === "player") {
      if (raw === "h" || raw === "hit") return playerHit(state);
      if (raw === "s" || raw === "stand") return dealerPlay(state);
      return { state: { ...state, message: "hit or stand" } };
    }

    return { state };
  },
};

function playerHit(s: State): GameResult<State> {
  const [card, deck] = draw(s.deck);
  const player = [...s.player, card];
  const { total } = handValue(player);
  if (total > 21) {
    return {
      state: {
        ...s,
        deck,
        player,
        phase: "done",
        result: "lose",
        losses: s.losses + 1,
        message: undefined,
      },
    };
  }
  return { state: { ...s, deck, player, message: undefined } };
}

function dealerPlay(s: State): GameResult<State> {
  let deck = s.deck;
  const dealer = [...s.dealer];
  // Hit soft 17
  while (true) {
    const { total, soft } = handValue(dealer);
    if (total > 17) break;
    if (total === 17 && !soft) break;
    const [c, d] = draw(deck);
    dealer.push(c);
    deck = d;
  }
  const p = handValue(s.player).total;
  const d = handValue(dealer).total;
  let result: State["result"];
  let wins = s.wins, losses = s.losses, pushes = s.pushes;
  if (d > 21 || p > d) { result = "win"; wins++; }
  else if (p === d) { result = "push"; pushes++; }
  else { result = "lose"; losses++; }
  return {
    state: { ...s, deck, dealer, phase: "done", result, wins, losses, pushes, message: undefined },
  };
}
