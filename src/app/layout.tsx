import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NemoDash — Správa nemovitostí",
  description: "Webová aplikace pro správu nemovitostí",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
