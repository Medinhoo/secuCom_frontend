export enum NotificationType {
  DIMONA_CREATED = "DIMONA_CREATED",
  DIMONA_STATUS_CHANGED = "DIMONA_STATUS_CHANGED", 
  COLLABORATOR_CREATED = "COLLABORATOR_CREATED"
}

export interface NotificationDto {
  id: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string; // ISO date
  recipientId: string;
  entityId?: string;
}

export interface PaginatedNotifications {
  content: NotificationDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface NotificationCountResponse {
  count: number;
}
