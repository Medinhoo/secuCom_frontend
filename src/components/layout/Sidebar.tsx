// src/components/layout/Sidebar.tsx
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  FileText,
  Building,
  Building2,
  File,
} from "lucide-react";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

function SidebarLink({ href, icon, label, isActive }: SidebarLinkProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  // In a real app, you would determine the active link based on the current route
  const pathname = "/"; // Placeholder for actual route

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white dark:bg-gray-950 dark:border-gray-800">
      <div className="flex h-14 items-center border-b px-4 dark:border-gray-800">
        <span className="font-semibold">Secretariat social</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        <SidebarLink
          href="/"
          icon={<Home size={20} />}
          label="Tableau de bord"
          isActive={pathname === "/"}
        />
        <SidebarLink
          href="/clients"
          icon={<Building2 size={20} />}
          label="Entreprises / Clients"
        />
        <SidebarLink
          href="/personnel"
          icon={<Users size={20} />}
          label="Employés / Ouvriers"
        />
        <SidebarLink
          href="/documents"
          icon={<FileText size={20} />}
          label="Documents"
        />
        <SidebarLink href="/dimona" icon={<File size={20} />} label="DIMONA" />
        <SidebarLink
          href="/settings"
          icon={<Settings size={20} />}
          label="Paramètres"
        />
      </nav>
    </div>
  );
}
