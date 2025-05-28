import React from "react";
import { NotificationDto, NotificationType } from "@/types/notification";
import { cn } from "@/lib/utils";
import { 
  UserPlus, 
  FileText, 
  RefreshCw,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes.config";

interface NotificationItemMinimalProps {
  notification: NotificationDto;
  onMarkAsRead?: (id: string) => void;
  onClose?: () => void;
}

// Fonction pour obtenir l'icône selon le type de notification
function getNotificationIcon(type: NotificationType, isRead: boolean) {
  const baseClasses = cn(
    "flex-shrink-0",
    isRead ? "text-gray-400" : "text-blue-500"
  );
  
  switch (type) {
    case NotificationType.COLLABORATOR_CREATED:
      return <UserPlus size={16} className={cn(baseClasses, !isRead && "text-green-500")} />;
    case NotificationType.DIMONA_CREATED:
      return <FileText size={16} className={cn(baseClasses, !isRead && "text-blue-500")} />;
    case NotificationType.DIMONA_STATUS_CHANGED:
      return <RefreshCw size={16} className={cn(baseClasses, !isRead && "text-orange-500")} />;
    default:
      return <FileText size={16} className={baseClasses} />;
  }
}

// Fonction pour formater le timestamp relatif de manière très courte
function getShortRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "1min";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}min`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}j`;
  }
}

// Fonction pour raccourcir le message
function getTruncatedMessage(message: string, maxLength: number = 60): string {
  // Nettoyer le message d'abord
  let cleanMessage = message
    .replace(/a été mis à jour:/g, "a été mise à jour")
    .replace(/Le statut de la déclaration DIMONA pour/g, "Dimona pour")
    .replace(/Le statut de la déclaration Dimona pour/g, "Dimona pour")
    .replace(/TO_SEND|TO_CONFIRM|IN_PROGRESS|ACCEPTED|REJECTED/g, (match) => {
      switch (match) {
        case 'TO_SEND': return 'à envoyer';
        case 'TO_CONFIRM': return 'à confirmer';
        case 'IN_PROGRESS': return 'en cours';
        case 'ACCEPTED': return 'acceptée';
        case 'REJECTED': return 'rejetée';
        default: return match;
      }
    });

  if (cleanMessage.length <= maxLength) {
    return cleanMessage;
  }
  
  return cleanMessage.substring(0, maxLength).trim() + "...";
}

export function NotificationItemMinimal({ 
  notification, 
  onMarkAsRead,
  onClose
}: NotificationItemMinimalProps) {
  const navigate = useNavigate();
  const relativeTime = getShortRelativeTime(notification.createdAt);
  const icon = getNotificationIcon(notification.type, notification.read);
  const truncatedMessage = getTruncatedMessage(notification.message);

  const handleClick = () => {
    // Marquer comme lu si pas encore lu
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    
    // Fermer le dropdown
    if (onClose) {
      onClose();
    }
    
    // Naviguer vers la page notifications
    navigate(ROUTES.NOTIFICATIONS);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0",
        !notification.read 
          ? "bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 hover:to-blue-50" 
          : "bg-white hover:bg-gray-50",
        "p-3 hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icône */}
        <div className="flex-shrink-0 mt-0.5">
          {icon}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          {/* Message tronqué */}
          <p className={cn(
            "text-sm leading-relaxed line-clamp-2",
            !notification.read 
              ? "font-medium text-gray-900" 
              : "text-gray-600"
          )}>
            {truncatedMessage}
          </p>

          {/* Timestamp et indicateur */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">
                {relativeTime}
              </span>
            </div>
            
            {/* Indicateur non lu */}
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </div>
        </div>
      </div>

      {/* Effet hover subtil */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50 opacity-0 group-hover:opacity-30 transition-opacity duration-200 pointer-events-none" />
    </div>
  );
}
