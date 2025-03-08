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

  // Create content element for button-type links (like logout)
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

      {/* Label with improved transition */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap",
          isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        )}
        style={{
          maxWidth: isCollapsed ? "0" : "150px",
          marginLeft: isCollapsed ? "0" : "0.75rem",
          transitionDelay: isCollapsed ? "0ms" : "100ms",
        }}
      >
        <span className={cn(isActive ? "font-semibold" : "")}>{label}</span>
      </div>

      {/* Active indicators */}
      {isActive && (
        <>
          {/* Left side indicator */}
          <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-400 rounded-r"></div>

          {/* Right side dot indicator - only when expanded */}
          <div
            className={cn(
              "transition-all duration-300 ease-in-out ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 z-10",
              isCollapsed ? "opacity-0 scale-0" : "opacity-100 scale-100"
            )}
            style={{
              transitionDelay: isCollapsed ? "0ms" : "150ms",
            }}
          ></div>
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

        {/* Label with improved transition */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap",
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}
          style={{
            maxWidth: isCollapsed ? "0" : "150px",
            marginLeft: isCollapsed ? "0" : "0.75rem",
            transitionDelay: isCollapsed ? "0ms" : "100ms",
          }}
        >
          <span className={cn(isActive ? "font-semibold" : "")}>{label}</span>
        </div>

        {/* Active indicators */}
        {isActive && (
          <>
            {/* Left side indicator */}
            <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-400 rounded-r"></div>

            {/* Right side dot indicator - only when expanded */}
            <div
              className={cn(
                "transition-all duration-300 ease-in-out ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 z-10",
                isCollapsed ? "opacity-0 scale-0" : "opacity-100 scale-100"
              )}
              style={{
                transitionDelay: isCollapsed ? "0ms" : "150ms",
              }}
            ></div>
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
  const { logout, user } = useAuth();

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
      {/* Header arrondi avec transitions améliorées */}
      <div className="relative h-20 px-3 pt-3">
        {/* Conteneur arrondi avec gradient */}
        <div className="absolute inset-x-3 top-3 bottom-0 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 overflow-hidden shadow-lg">
          {/* Effet de brillance */}
          <div className="absolute -top-10 -left-10 h-20 w-20 bg-white/20 rounded-full blur-xl"></div>
          <div className="absolute -right-5 -bottom-8 h-16 w-16 bg-white/10 rounded-full blur-lg"></div>
        </div>

        {/* Contenu du header avec transitions améliorées */}
        <div className="relative z-10 flex items-center justify-center h-full w-full">
          {/* Conteneur pour le contenu utilisateur avec transition */}
          <div
            className={cn(
              "flex items-center gap-3 transition-all duration-300 ease-in-out absolute",
              isCollapsed
                ? "opacity-0 -translate-x-10 pointer-events-none"
                : "opacity-100 translate-x-0"
            )}
            style={{
              width: "calc(100% - 2rem)",
              left: "0.5rem",
              padding: "0 0.5rem",
              visibility: isCollapsed ? "hidden" : "visible",
              transitionDelay: isCollapsed ? "0ms" : "150ms",
            }}
          >
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-white/20 flex items-center justify-center shadow-sm">
              <span className="font-bold text-lg text-white">
                {user?.username?.charAt(0) || "S"}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white drop-shadow-sm truncate">
                {user?.username}
              </span>
              <span className="text-xs text-blue-100 truncate">
                Secrétariat social
              </span>
            </div>
          </div>

          {/* Bouton recentré */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className={cn(
              "h-8 w-8 text-white rounded-full hover:bg-white/20 transition-all duration-300",
              "absolute",
              isCollapsed ? "left-1/2 -translate-x-1/2" : "right-4"
            )}
          >
            <div
              className={cn(
                "transition-transform duration-300 flex items-center justify-center",
                !isCollapsed && "rotate-180"
              )}
            >
              <ChevronRight size={18} />
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

      {/* Footer with logout and brand tag - RÉORGANISÉ */}
      <div
        className={cn(
          "mt-auto transition-all duration-300",
          isCollapsed
            ? "flex flex-col justify-end h-24"
            : "border-t border-slate-200"
        )}
      >
        {/* ORDRE INVERSÉ: D'abord le bouton de déconnexion, puis le tag Sodabel */}

        {/* Logout button */}
        <div
          className={cn(
            "transition-all duration-300",
            isCollapsed ? "px-2 mt-auto" : "px-3 py-3"
          )}
        >
          <SidebarLink
            href=""
            icon={<LogOut size={20} className="text-red-500" />}
            label="Déconnexion"
            isCollapsed={isCollapsed}
            onClick={logout}
          />
        </div>

        {/* Brand tag avec transition - seulement visible quand expanded */}
        <div
          className={cn(
            "text-center py-3 overflow-hidden transition-all duration-100 ease-in-out",
            isCollapsed ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
          )}
          style={{
            transitionDelay: isCollapsed ? "0ms" : "50ms",
          }}
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
