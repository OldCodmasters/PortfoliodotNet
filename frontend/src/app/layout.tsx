import type { Metadata } from "next";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amin Dehghani — Portfolio",
  description:
    "Process Engineer & Backend Developer. Manufacturing, automation, and software engineering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Pre-paint theme bootstrap. Runs synchronously before the body
            renders so the right `data-theme` is set on <html> ahead of any
            paint — no flash of unstyled-theme on reload. */}
        <script
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
