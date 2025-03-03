import { useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
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
  const IconComponent = (icon as React.ReactElement).type;
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
        isCollapsed ? "justify-center" : "gap-3",
        isActive
          ? "bg-blue-600 text-white"
          : "text-gray-700 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-700"
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
  const location = useLocation(); // Use useLocation to get the current pathname
  const pathname = location.pathname; // Get the current path

  // Function to check if the current path matches or starts with the given path
  const isActivePath = (href: string) => pathname.startsWith(href);

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-blue-50 dark:bg-blue-900 dark:border-blue-800 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-4 dark:border-blue-800 justify-between bg-blue-400 text-white">
        {!isCollapsed && <span className="font-semibold">Sodabel</span>}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className={cn("h-8 w-8 text-white", isCollapsed && "mx-auto")}
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
          isActive={pathname === "/"} // Exact match for home
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/clients"
          icon={<Building2 size={20} />}
          label="Entreprises"
          isActive={isActivePath("/clients")} // Check if the path starts with "/clients"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/personnel"
          icon={<Users size={20} />}
          label="Employés / Ouvriers"
          isActive={isActivePath("/personnel")} // Check if the path starts with "/personnel"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/documents"
          icon={<FileText size={20} />}
          label="Documents"
          isActive={isActivePath("/documents")} // Check if the path starts with "/documents"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/dimona"
          icon={<File size={20} />}
          label="DIMONA"
          isActive={isActivePath("/dimona")} // Check if the path starts with "/dimona"
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
