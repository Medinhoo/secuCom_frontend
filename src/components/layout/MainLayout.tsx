// src/components/layout/MainLayout.tsx
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom"; // Assurez-vous d'importer Outlet

export function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
      <main className="flex-1 overflow-auto">
        <div className="p-10 bg-gradient-to-b from-blue-50 to-white min-h-screen">
          <Outlet /> {/* Utilisez Outlet ici au lieu de children */}
        </div>
      </main>
    </div>
  );
}
