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
  Bell,
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
import { ROUTES } from "@/config/routes.config";
import { NotificationBellImproved } from "@/components/notifications/NotificationBellImproved";
import { useAccountRestrictions } from "@/hooks/useAccountRestrictions";

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
    ? React.cloneElement(icon as React.ReactElement, { size: 24 } as React.HTMLAttributes<SVGElement>)
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
  const { shouldShowInNavigation } = useAccountRestrictions();

  // Function to check if the current path matches or starts with the given path
  const isActivePath = (href: string) => pathname.startsWith(href);

  // Define sidebar links
  const links = [
    {
      href: ROUTES.DASHBOARD,
      icon: <Home size={20} />,
      label: "Tableau de bord",
      isActive: pathname === ROUTES.DASHBOARD,
    },
    {
      href: user?.roles.includes("ROLE_COMPANY") && user?.companyId 
        ? ROUTES.COMPANY_DETAILS(user.companyId) 
        : ROUTES.COMPANIES,
      icon: <Building2 size={20} />,
      label: user?.roles.includes("ROLE_COMPANY") ? "Mon Entreprise" : "Entreprises",
      isActive: isActivePath(ROUTES.COMPANIES),
    },
    {
      href: ROUTES.COLLABORATORS,
      icon: <Users size={20} />,
      label: "Collaborateurs",
      isActive: isActivePath(ROUTES.COLLABORATORS),
    },
    {
      href: ROUTES.DIMONA,
      icon: <File size={20} />,
      label: "DIMONA",
      isActive: isActivePath(ROUTES.DIMONA),
    },
    {
      href: ROUTES.DOCUMENTS,
      icon: <FileText size={20} />,
      label: "Documents",
      isActive: isActivePath(ROUTES.DOCUMENTS),
    },
    {
      href: ROUTES.NOTIFICATIONS,
      icon: <Bell size={20} />,
      label: "Notifications",
      isActive: pathname === ROUTES.NOTIFICATIONS,
    },
    // Admin-only links
    ...(user?.roles.includes("ROLE_ADMIN") ? [
      {
        href: ROUTES.ADMIN_USERS,
        icon: <Users size={20} />,
        label: "Utilisateurs",
        isActive: isActivePath(ROUTES.ADMIN_USERS),
      },
    ] : []),
    {
      href: ROUTES.SETTINGS,
      icon: <Settings size={20} />,
      label: "Paramètres",
      isActive: pathname === ROUTES.SETTINGS,
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
      {/* Header redesigné avec un style plus épuré */}
      <div className="relative h-20 px-3 pt-3">
        {/* Conteneur arrondi avec gradient amélioré */}
        <div className="absolute inset-x-3 top-3 bottom-0 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 overflow-hidden shadow-xl">
          {/* Effets de brillance optimisés */}
          <div className="absolute -top-8 -left-8 h-16 w-16 bg-white/25 rounded-full blur-xl"></div>
          <div className="absolute -right-4 -bottom-6 h-12 w-12 bg-white/15 rounded-full blur-lg"></div>
          
          {/* Motif géométrique subtil */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-2 w-8 h-8 border border-white/30 rounded-lg rotate-12"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border border-white/20 rounded-full"></div>
          </div>
        </div>

        {/* Contenu du header avec transitions améliorées */}
        <div className={cn(
          "relative z-10 flex items-center h-full w-full px-2",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {/* Conteneur pour le contenu utilisateur */}
          <div
            className={cn(
              "flex items-center gap-3 transition-all duration-300 ease-in-out",
              isCollapsed
                ? "opacity-0 -translate-x-10 pointer-events-none w-0"
                : "opacity-100 translate-x-0 w-auto"
            )}
            style={{
              transitionDelay: isCollapsed ? "0ms" : "150ms",
            }}
          >
            <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
              <Link to={ROUTES.PROFILE} className="flex items-center justify-center w-full h-full">
                <span className="font-bold text-base text-white drop-shadow-sm">
                  {user?.username?.charAt(0)?.toUpperCase() || "S"}
                </span>
              </Link>
            </div>
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="font-semibold text-white drop-shadow-sm truncate text-sm">
                {user?.username}
              </span>
              <span className="text-xs text-blue-100/90 truncate">
                {user?.roles.includes("ROLE_COMPANY") ? "Entreprise" : "Secrétariat"}
              </span>
            </div>
          </div>

          {/* Actions du header - redesignées */}
          <div className="flex items-center gap-1">
            {/* NotificationBell - visible seulement quand la sidebar est ouverte */}
            {!isCollapsed && <NotificationBellImproved variant="sidebar" />}
            
            {/* Bouton collapse redesigné */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="h-8 w-8 text-white rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30"
            >
              <div
                className={cn(
                  "transition-transform duration-300 flex items-center justify-center",
                  !isCollapsed && "rotate-180"
                )}
              >
                <ChevronRight size={16} />
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto pt-4">
        <nav className={cn("flex flex-col", isCollapsed ? "px-2" : "px-3")}>
          {links
            .filter(link => shouldShowInNavigation(link.href))
            .map((link, index) => (
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
      <div
        className={cn(
          "mt-auto transition-all duration-300",
          isCollapsed
            ? "flex flex-col justify-end h-24"
            : "border-t border-slate-200"
        )}
      >
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

        {/* Brand tag avec transition */}
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
            <span className="text-xs text-slate-400">Secucom v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
