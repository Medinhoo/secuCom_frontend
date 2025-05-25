import { useState, useEffect, useCallback } from "react";
import { NotificationService } from "@/services/api/notificationService";
import { NotificationDto } from "@/types/notification";
import { toast } from "sonner";

interface UseNotificationsOptions {
  mode?: 'dropdown' | 'page'; // Mode dropdown (5 récentes non lues) ou page (toutes)
  autoRefresh?: boolean; // Auto-refresh du compteur
}

interface UseNotificationsReturn {
  notifications: NotificationDto[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  // Nouvelles fonctions pour la page
  allNotifications: NotificationDto[];
  unreadNotifications: NotificationDto[];
  readNotifications: NotificationDto[];
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { mode = 'dropdown', autoRefresh = true } = options;
  
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [allNotifications, setAllNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculer les notifications filtrées
  const unreadNotifications = allNotifications.filter(n => !n.read);
  const readNotifications = allNotifications.filter(n => n.read);

  // Récupérer les notifications selon le mode
  const refreshNotifications = useCallback(async () => {
    try {
      setError(null);
      
      if (mode === 'dropdown') {
        // Pour le dropdown : 5 notifications non lues récentes
        const unreadNotifications = await NotificationService.getUnreadNotifications();
        setNotifications(unreadNotifications.slice(0, 5));
      } else {
        // Pour la page : toutes les notifications
        const allNotifs = await NotificationService.getAllNotifications();
        setAllNotifications(allNotifs);
        setNotifications(allNotifs);
      }
    } catch (err) {
      setError("Erreur lors du chargement des notifications");
      console.error("Error fetching notifications:", err);
    }
  }, [mode]);

  // Récupérer le nombre de notifications non lues
  const refreshUnreadCount = useCallback(async () => {
    try {
      setError(null);
      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      setError("Erreur lors du chargement du compteur");
      console.error("Error fetching unread count:", err);
    }
  }, []);

  // Marquer une notification comme lue avec optimistic update
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Optimistic update pour les deux listes
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      
      if (mode === 'page') {
        setAllNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
      }
      
      setUnreadCount(prev => Math.max(0, prev - 1));

      // API call
      await NotificationService.markAsRead(notificationId);
      
      // Refresh pour s'assurer de la cohérence
      await refreshNotifications();
      await refreshUnreadCount();
    } catch (err) {
      // Revert optimistic update on error
      await refreshNotifications();
      await refreshUnreadCount();
      toast.error("Erreur lors de la mise à jour de la notification");
      console.error("Error marking notification as read:", err);
    }
  }, [refreshNotifications, refreshUnreadCount, mode]);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update pour les deux listes
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      if (mode === 'page') {
        setAllNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
      }
      
      setUnreadCount(0);

      // API call
      await NotificationService.markAllAsRead();
      
      // Refresh pour s'assurer de la cohérence
      await refreshNotifications();
      await refreshUnreadCount();
      
      toast.success("Toutes les notifications ont été marquées comme lues");
    } catch (err) {
      // Revert optimistic update on error
      await refreshNotifications();
      await refreshUnreadCount();
      toast.error("Erreur lors de la mise à jour des notifications");
      console.error("Error marking all notifications as read:", err);
    }
  }, [refreshNotifications, refreshUnreadCount, mode]);

  // Supprimer une notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const notificationToDelete = notifications.find(n => n.id === notificationId) ||
                                   allNotifications.find(n => n.id === notificationId);
      
      // Optimistic update pour les deux listes
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      if (mode === 'page') {
        setAllNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      }
      
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // API call
      await NotificationService.deleteNotification(notificationId);
      
      // Refresh pour s'assurer de la cohérence
      await refreshNotifications();
      await refreshUnreadCount();
      
      toast.success("Notification supprimée");
    } catch (err) {
      // Revert optimistic update on error
      await refreshNotifications();
      await refreshUnreadCount();
      toast.error("Erreur lors de la suppression de la notification");
      console.error("Error deleting notification:", err);
    }
  }, [notifications, allNotifications, refreshNotifications, refreshUnreadCount, mode]);

  // Chargement initial
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([
        refreshNotifications(),
        refreshUnreadCount()
      ]);
      setIsLoading(false);
    };

    loadInitialData();
  }, [refreshNotifications, refreshUnreadCount]);

  // Auto-refresh du compteur toutes les 30 secondes (seulement si activé)
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [refreshUnreadCount, autoRefresh]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    // Nouvelles propriétés pour la page
    allNotifications,
    unreadNotifications,
    readNotifications,
  };
}
