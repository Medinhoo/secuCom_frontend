// src/components/layout/MainLayout.tsx
import React from "react";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
}
