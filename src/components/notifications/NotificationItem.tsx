import React from "react";
import { NotificationDto, NotificationType } from "@/types/notification";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  FileText, 
  RefreshCw, 
  Check, 
  Trash2,
  Clock,
  Mail,
  MailOpen
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotificationItemProps {
  notification: NotificationDto;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean; // Pour le dropdown vs la page complète
}

// Fonction utilitaire pour formater le timestamp relatif
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "À l'instant";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}min`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}j`;
  } else {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
  }
}

// Fonction pour obtenir l'icône selon le type de notification
function getNotificationIcon(type: NotificationType, isRead: boolean) {
  const baseClasses = isRead ? "opacity-60" : "";
  
  switch (type) {
    case NotificationType.COLLABORATOR_CREATED:
      return <UserPlus size={18} className={cn("text-green-500", baseClasses)} />;
    case NotificationType.DIMONA_CREATED:
      return <FileText size={18} className={cn("text-blue-500", baseClasses)} />;
    case NotificationType.DIMONA_STATUS_CHANGED:
      return <RefreshCw size={18} className={cn("text-orange-500", baseClasses)} />;
    default:
      return <FileText size={18} className={cn("text-gray-500", baseClasses)} />;
  }
}

export function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  compact = false 
}: NotificationItemProps) {
  const relativeTime = getRelativeTime(notification.createdAt);
  const icon = getNotificationIcon(notification.type, notification.read);

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  return (
    <div
      className={cn(
        "group relative transition-all duration-200 border-b border-gray-100 last:border-b-0",
        !notification.read 
          ? "bg-gradient-to-r from-blue-50 via-blue-25 to-transparent border-l-4 border-l-blue-400 shadow-sm" 
          : "bg-white hover:bg-gray-50",
        compact ? "p-3" : "p-4",
        "hover:shadow-md"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icône de statut et type */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-full transition-colors",
            !notification.read 
              ? "bg-blue-100 ring-2 ring-blue-200" 
              : "bg-gray-100"
          )}>
            {icon}
          </div>
          
          {/* Indicateur de statut lu/non lu */}
          <div className="flex flex-col items-center gap-1">
            {!notification.read ? (
              <Mail size={14} className="text-blue-600" />
            ) : (
              <MailOpen size={14} className="text-gray-400" />
            )}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          {/* Message */}
          <div className="flex items-start justify-between gap-2">
            <p 
              className={cn(
                "text-sm leading-relaxed",
                !notification.read 
                  ? "font-semibold text-gray-900" 
                  : "text-gray-600 font-normal",
                compact && "line-clamp-2"
              )}
            >
              {notification.message}
            </p>
            
            {/* Badge non lu plus visible */}
            {!notification.read && (
              <div className="flex-shrink-0 flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  Nouveau
                </span>
              </div>
            )}
          </div>

          {/* Timestamp et actions */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <Clock size={12} className={cn(
                !notification.read ? "text-blue-500" : "text-gray-400"
              )} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={cn(
                      "text-xs",
                      !notification.read ? "text-blue-600 font-medium" : "text-gray-500"
                    )}>
                      {relativeTime}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {new Date(notification.createdAt).toLocaleString("fr-FR")}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Statut textuel */}
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                !notification.read 
                  ? "bg-blue-100 text-blue-700 font-medium" 
                  : "bg-gray-100 text-gray-500"
              )}>
                {!notification.read ? "Non lue" : "Lue"}
              </span>
            </div>

            {/* Actions */}
            <div className={cn(
              "flex items-center gap-1 transition-opacity duration-200",
              compact ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            )}>
              {!notification.read && onMarkAsRead && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-green-100 border border-transparent hover:border-green-200"
                        onClick={handleMarkAsRead}
                      >
                        <Check size={14} className="text-green-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Marquer comme lu
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {onDelete && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-red-100 border border-transparent hover:border-red-200"
                        onClick={handleDelete}
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Supprimer
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
