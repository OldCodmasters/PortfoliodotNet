import type { ExecuteCommandResponse, Portfolio } from "./types";

export const apiBase =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080";

export async function fetchPortfolio(): Promise<Portfolio> {
  const res = await fetch(`${apiBase}/api/content`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Portfolio fetch failed: ${res.status}`);
  return res.json();
}

export async function executeCommand(command: string): Promise<ExecuteCommandResponse> {
  const res = await fetch(`${apiBase}/api/commands/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command }),
  });
  if (!res.ok) throw new Error(`Command failed: ${res.status}`);
  return res.json();
}

export const resumeDownloadUrl = `${apiBase}/api/resume/download`;
