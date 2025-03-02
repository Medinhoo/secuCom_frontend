// src/components/layout/MainLayout.tsx
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
