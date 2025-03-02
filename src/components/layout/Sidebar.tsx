// src/components/layout/Sidebar.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  FileText,
  Building2,
  ChevronLeft,
  ChevronRight,
  Menu,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isCollapsed: boolean;
}

function SidebarLink({
  href,
  icon,
  label,
  isActive,
  isCollapsed,
}: SidebarLinkProps) {
  // Create a larger version of the icon when collapsed
  const IconComponent = (icon as React.ReactElement).type;
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
        isCollapsed ? "justify-center" : "gap-3",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
      )}
      title={isCollapsed ? label : undefined}
    >
      {isCollapsed ? <IconComponent size={24} /> : icon}
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
}

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
  // In a real app, you would determine the active link based on the current route
  const pathname = "/"; // Placeholder for actual route

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-white dark:bg-gray-950 dark:border-gray-800 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-4 dark:border-gray-800 justify-between">
        {!isCollapsed && (
          <span className="font-semibold">Company Dashboard</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className={cn("h-8 w-8", isCollapsed && "mx-auto")}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>
      <nav
        className={cn("flex-1 space-y-1", isCollapsed ? "px-2 py-4" : "p-4")}
      >
        <SidebarLink
          href="/"
          icon={<Home size={20} />}
          label="Tableau de bord"
          isActive={pathname === "/"}
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/clients"
          icon={<Building2 size={20} />}
          label="Entreprises / Clients"
          isActive={pathname === "/clients"}
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/personnel"
          icon={<Users size={20} />}
          label="Employés / Ouvriers"
          isActive={pathname === "/personnel"}
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/documents"
          icon={<FileText size={20} />}
          label="Documents"
          isActive={pathname === "/documents"}
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/dimona"
          icon={<File size={20} />}
          label="DIMONA"
          isActive={pathname === "/dimona"}
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/settings"
          icon={<Settings size={20} />}
          label="Paramètres"
          isActive={pathname === "/settings"}
          isCollapsed={isCollapsed}
        />
      </nav>
    </div>
  );
}
