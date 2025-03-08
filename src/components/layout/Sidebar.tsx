import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Settings,
  FileText,
  Building2,
  ChevronRight,
  File,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";
import { useAuth } from "@/context/AuthContext";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

function SidebarLink({
  href,
  icon,
  label,
  isActive,
  isCollapsed,
  onClick,
}: SidebarLinkProps) {
  // Use larger icon when collapsed
  const iconElement = isCollapsed
    ? React.cloneElement(icon as React.ReactElement, { size: 24 })
    : icon;

  // Create content element, used for both normal rendering and tooltip trigger
  const linkContent = (
    <div
      className={cn(
        "flex items-center rounded-md py-2.5 px-3 text-sm font-medium",
        "my-1 relative group cursor-pointer",
        isCollapsed ? "justify-center" : "gap-3",
        isActive
          ? "bg-blue-50 text-blue-600"
          : "text-slate-600 hover:bg-blue-50 hover:text-blue-500"
      )}
      onClick={onClick}
    >
      {/* Icon container with instant color change */}
      <div
        className={cn(
          "flex items-center justify-center z-10",
          isActive
            ? "text-blue-500"
            : "text-slate-500 group-hover:text-blue-500"
        )}
      >
        {iconElement}
      </div>

      {/* Label */}
      {!isCollapsed && (
        <span className={cn(isActive ? "font-semibold" : "")}>{label}</span>
      )}

      {/* Active indicators */}
      {isActive && (
        <>
          {/* Left side indicator */}
          <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-400 rounded-r"></div>

          {/* Right side dot indicator - only when expanded */}
          {!isCollapsed && (
            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 z-10"></div>
          )}
        </>
      )}
    </div>
  );

  // If this is a regular navigation link (not a button like logout)
  if (!onClick) {
    const navLinkContent = (
      <Link
        to={href}
        className={cn(
          "flex items-center rounded-md py-2.5 px-3 text-sm font-medium",
          "my-1 relative group",
          isCollapsed ? "justify-center" : "gap-3",
          isActive
            ? "bg-blue-50 text-blue-600"
            : "text-slate-600 hover:bg-blue-50 hover:text-blue-500"
        )}
      >
        {/* Icon container with instant color change */}
        <div
          className={cn(
            "flex items-center justify-center z-10",
            isActive
              ? "text-blue-500"
              : "text-slate-500 group-hover:text-blue-500"
          )}
        >
          {iconElement}
        </div>

        {/* Label */}
        {!isCollapsed && (
          <span className={cn(isActive ? "font-semibold" : "")}>{label}</span>
        )}

        {/* Active indicators */}
        {isActive && (
          <>
            {/* Left side indicator */}
            <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-400 rounded-r"></div>

            {/* Right side dot indicator - only when expanded */}
            {!isCollapsed && (
              <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 z-10"></div>
            )}
          </>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>{navLinkContent}</TooltipTrigger>
            <TooltipContent side="right" align="center" sideOffset={5}>
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return navLinkContent;
  }

  // For buttons like logout
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" align="center" sideOffset={5}>
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return linkContent;
}

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const [mounted, setMounted] = useState(false);
  const { logout } = useAuth();

  // Function to check if the current path matches or starts with the given path
  const isActivePath = (href: string) => pathname.startsWith(href);

  // Define sidebar links
  const links = [
    {
      href: "/dashboard",
      icon: <Home size={20} />,
      label: "Tableau de bord",
      isActive: pathname === "/dashboard",
    },
    {
      href: "/entreprises",
      icon: <Building2 size={20} />,
      label: "Entreprises",
      isActive: isActivePath("/entreprises"),
    },
    {
      href: "/personnel",
      icon: <Users size={20} />,
      label: "Employés / Ouvriers",
      isActive: isActivePath("/personnel"),
    },
    {
      href: "/documents",
      icon: <FileText size={20} />,
      label: "Documents",
      isActive: isActivePath("/documents"),
    },
    {
      href: "/dimona",
      icon: <File size={20} />,
      label: "DIMONA",
      isActive: isActivePath("/dimona"),
    },
    {
      href: "/settings",
      icon: <Settings size={20} />,
      label: "Paramètres",
      isActive: pathname === "/settings",
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-white border-r border-slate-200 shadow-md",
        "transition-all duration-300 ease-out",
        mounted ? "opacity-100" : "opacity-0",
        isCollapsed ? "w-16" : "w-64"
      )}
      style={{
        boxShadow: "0 0 25px rgba(59, 130, 246, 0.1)",
      }}
    >
      {/* Header with static gradient */}
      <div className="flex h-16 items-center border-b border-slate-200 relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-400">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-white/10"></div>

        <div
          className={cn(
            "flex items-center px-4 transition-all duration-300 overflow-hidden relative z-10",
            isCollapsed ? "justify-center w-full" : "justify-between w-full"
          )}
        >
          {!isCollapsed && (
            <span className="font-bold text-lg text-white drop-shadow-sm">
              Espace de Sodabel
            </span>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className={cn(
              "h-8 w-8 text-white rounded-full relative overflow-hidden",
              "hover:bg-white/20 transition-all duration-200"
            )}
          >
            <div
              className={cn(
                "transition-transform duration-300",
                !isCollapsed && "rotate-180",
                "flex items-center justify-center"
              )}
            >
              <ChevronRight size={18} className="drop-shadow-sm" />
            </div>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto pt-4">
        <nav className={cn("flex flex-col", isCollapsed ? "px-2" : "px-3")}>
          {links.map((link, index) => (
            <div
              key={link.href}
              style={{
                animationDelay: `${index * 50}ms`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateX(0)" : "translateX(-10px)",
                transition: `opacity 0.3s ease ${
                  index * 50
                }ms, transform 0.3s ease ${index * 50}ms`,
              }}
            >
              <SidebarLink
                href={link.href}
                icon={link.icon}
                label={link.label}
                isActive={link.isActive}
                isCollapsed={isCollapsed}
              />
            </div>
          ))}
        </nav>
      </div>

      {/* Footer with logout and brand tag */}
      <div className="mt-auto border-t border-slate-200">
        {/* Logout button */}
        <div className={cn("py-2", isCollapsed ? "px-2" : "px-3")}>
          <SidebarLink
            href=""
            icon={<LogOut size={20} className="text-red-500" />}
            label="Déconnexion"
            isCollapsed={isCollapsed}
            onClick={logout}
          />
        </div>

        {/* Brand tag */}
        <div
          className={cn(
            "text-center py-3 transition-all duration-300",
            isCollapsed ? "opacity-0" : "opacity-100"
          )}
        >
          <div className="flex justify-center items-center">
            <div className="h-1 w-1 rounded-full bg-blue-400 mr-1"></div>
            <span className="text-xs text-slate-400">Sodabel v2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
