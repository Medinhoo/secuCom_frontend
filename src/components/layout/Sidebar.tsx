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
        <span className="font-semibold">Company Dashboard</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        <SidebarLink
          href="/"
          icon={<Home size={20} />}
          label="Dashboard"
          isActive={pathname === "/"}
        />
        <SidebarLink
          href="/analytics"
          icon={<BarChart3 size={20} />}
          label="Analytics"
        />
        <SidebarLink href="/users" icon={<Users size={20} />} label="Users" />
        <SidebarLink
          href="/reports"
          icon={<FileText size={20} />}
          label="Reports"
        />
        <SidebarLink
          href="/settings"
          icon={<Settings size={20} />}
          label="Settings"
        />
        <SidebarLink
          href="/help"
          icon={<HelpCircle size={20} />}
          label="Help"
        />
      </nav>
    </div>
  );
}
