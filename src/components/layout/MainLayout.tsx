// src/components/layout/MainLayout.tsx
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
      <main className="flex-1 overflow-auto">
        <div className="p-10 bg-gradient-to-b from-blue-50 to-white min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
