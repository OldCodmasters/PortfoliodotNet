import { fetchPortfolio } from "@/lib/api";
import { PageShell } from "@/components/PageShell";
import { Terminal } from "@/components/Terminal";

export default async function Home() {
  const portfolio = await fetchPortfolio();

  return (
    <>
      <PageShell portfolio={portfolio} />
      <Terminal />
    </>
  );
}
