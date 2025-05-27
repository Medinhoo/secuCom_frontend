import React from "react";
import { NotificationItemMinimal } from "./NotificationItemMinimal";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { 
  Bell, 
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { ROUTES } from "@/config/routes.config";

interface NotificationBellImprovedProps {
  variant?: "header" | "sidebar";
  className?: string;
}

export function NotificationBellImproved({ 
  variant = "header",
  className 
}: NotificationBellImprovedProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications({ mode: 'dropdown' });

  const [isOpen, setIsOpen] = React.useState(false);

  // Animation subtile pour le badge
  const [badgeAnimate, setBadgeAnimate] = React.useState(false);
  
  React.useEffect(() => {
    if (unreadCount > 0) {
      setBadgeAnimate(true);
      const timer = setTimeout(() => setBadgeAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const isSidebar = variant === "sidebar";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative transition-all duration-200",
            isSidebar 
              ? "h-8 w-8 text-white rounded-xl hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30"
              : "h-9 w-9 hover:bg-blue-50",
            className
          )}
        >
          <Bell 
            size={isSidebar ? 16 : 20} 
            className={cn(
              "transition-colors duration-200",
              isSidebar 
                ? (unreadCount > 0 ? "text-white" : "text-white/80")
                : (unreadCount > 0 ? "text-blue-600" : "text-gray-600")
            )}
          />
          
          {/* Badge avec animation */}
          {unreadCount > 0 && (
            <div 
              className={cn(
                "absolute -top-1 -right-1 rounded-full flex items-center justify-center transition-all duration-300",
                isSidebar 
                  ? "h-4 w-4 bg-red-500 ring-2 ring-white/20"
                  : "h-5 w-5 bg-red-500",
                badgeAnimate && "animate-pulse scale-110"
              )}
            >
              <span className="text-xs font-bold text-white">
                {isSidebar 
                  ? (unreadCount > 9 ? "9+" : unreadCount)
                  : (unreadCount > 99 ? "99+" : unreadCount)
                }
              </span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0 shadow-lg border-0"
        sideOffset={8}
      >
        {/* Header simplifié */}
        <div className="px-4 py-3 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs hover:bg-blue-50 text-blue-600"
                onClick={markAllAsRead}
              >
                Tout marquer lu
              </Button>
            )}
          </div>
        </div>

        {/* Contenu des notifications */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chargement...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">Aucune notification</p>
              <p className="text-xs text-gray-400">
                Vous êtes à jour !
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItemMinimal
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onClose={() => setIsOpen(false)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer simplifié */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Link 
                to={ROUTES.NOTIFICATIONS} 
                onClick={() => setIsOpen(false)}
                className="block w-full"
              >
                <Button 
                  variant="ghost" 
                  className="w-full justify-center text-xs text-blue-600 hover:bg-blue-50 h-8"
                >
                  Voir tout
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
