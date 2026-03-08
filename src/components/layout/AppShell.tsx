"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface AppShellProps {
  locale: string;
  children: React.ReactNode;
}

export default function AppShell({ locale, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar (desktop fixní + mobilní drawer) */}
      <Sidebar
        locale={locale}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Hlavní obsah posunutý doprava na desktopu */}
      <div className="lg:pl-60 flex flex-col min-h-screen">
        <TopBar
          locale={locale}
          onMenuOpen={() => setSidebarOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
