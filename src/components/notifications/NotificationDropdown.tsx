import React from "react";
import { NotificationDto } from "@/types/notification";
import { NotificationItem } from "./NotificationItem";
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
  CheckCheck, 
  Eye,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes.config";

interface NotificationDropdownProps {
  notifications: NotificationDto[];
  unreadCount: number;
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function NotificationDropdown({
  notifications,
  unreadCount,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onRefresh,
}: NotificationDropdownProps) {
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 hover:bg-blue-50 transition-colors duration-200"
        >
          <Bell 
            size={20} 
            className={cn(
              "transition-colors duration-200",
              unreadCount > 0 ? "text-blue-600" : "text-gray-600"
            )}
          />
          
          {/* Badge avec animation */}
          {unreadCount > 0 && (
            <div 
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center transition-all duration-300",
                badgeAnimate && "animate-pulse scale-110"
              )}
            >
              <span className="text-xs font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
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
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            
            {/* Actions du header */}
            <div className="flex items-center gap-1">
              {isLoading ? (
                <Loader2 size={16} className="animate-spin text-blue-600" />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-blue-200"
                  onClick={onRefresh}
                >
                  <Bell size={14} />
                </Button>
              )}
              
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-green-200"
                  onClick={onMarkAllAsRead}
                >
                  <CheckCheck size={14} className="text-green-600" />
                </Button>
              )}
            </div>
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
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                  compact={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer avec lien vers la page complète */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3 bg-gray-50">
              <Link 
                to={ROUTES.NOTIFICATIONS}
                onClick={() => setIsOpen(false)}
                className="block w-full"
              >
                <Button 
                  variant="ghost" 
                  className="w-full justify-center text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  <Eye size={16} className="mr-2" />
                  Voir toutes les notifications
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
