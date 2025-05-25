import { apiClient } from "./baseApi";
import { 
  NotificationDto, 
  PaginatedNotifications, 
  NotificationCountResponse 
} from "@/types/notification";
import { NOTIFICATION_ENDPOINTS } from "@/config/api.config";

export class NotificationService {
  // Récupérer toutes les notifications
  static async getAllNotifications(): Promise<NotificationDto[]> {
    return apiClient.get<NotificationDto[]>(NOTIFICATION_ENDPOINTS.GET_ALL, { 
      requiresAuth: true 
    });
  }

  // Récupérer les notifications avec pagination
  static async getPaginatedNotifications(
    page: number = 0, 
    size: number = 10
  ): Promise<PaginatedNotifications> {
    return apiClient.get<PaginatedNotifications>(
      NOTIFICATION_ENDPOINTS.GET_PAGINATED(page, size),
      { requiresAuth: true }
    );
  }

  // Récupérer les notifications non lues
  static async getUnreadNotifications(): Promise<NotificationDto[]> {
    return apiClient.get<NotificationDto[]>(
      NOTIFICATION_ENDPOINTS.GET_UNREAD, 
      { requiresAuth: true }
    );
  }

  // Récupérer le nombre de notifications non lues
  static async getUnreadCount(): Promise<number> {
    return apiClient.get<number>(
      NOTIFICATION_ENDPOINTS.GET_UNREAD_COUNT,
      { requiresAuth: true }
    );
  }

  // Marquer une notification comme lue
  static async markAsRead(notificationId: string): Promise<NotificationDto> {
    return apiClient.put<NotificationDto>(
      NOTIFICATION_ENDPOINTS.MARK_AS_READ(notificationId),
      {},
      { requiresAuth: true }
    );
  }

  // Marquer toutes les notifications comme lues
  static async markAllAsRead(): Promise<void> {
    return apiClient.put<void>(
      NOTIFICATION_ENDPOINTS.MARK_ALL_AS_READ, 
      {}, 
      { requiresAuth: true }
    );
  }

  // Supprimer une notification
  static async deleteNotification(notificationId: string): Promise<void> {
    return apiClient.delete<void>(
      NOTIFICATION_ENDPOINTS.DELETE(notificationId), 
      { requiresAuth: true }
    );
  }
}
