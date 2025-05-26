import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import { Bell, RefreshCw, Filter, CheckCircle, Circle, Mail, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FilterType = 'all' | 'unread' | 'read';

export function NotificationsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  
  const {
    notifications,
    allNotifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications({ mode: 'page' });

  // Obtenir les notifications à afficher selon le filtre
  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return unreadNotifications;
      case 'read':
        return readNotifications;
      default:
        return allNotifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Gérez vos notifications et restez informé des dernières activités"
      />

      {/* Stats et actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-blue-600" />
            <span className="text-sm text-gray-600">
              <span className="font-medium">{allNotifications.length}</span> notification{allNotifications.length > 1 ? "s" : ""} au total
            </span>
          </div>
          
          {unreadCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-600 font-medium">
                {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshNotifications}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Actualiser
          </Button>

          {unreadCount > 0 && (
            <Button
              size="sm"
              onClick={markAllAsRead}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200"
            >
              <CheckCircle size={16} />
              Marquer toutes comme lues
            </Button>
          )}
        </div>
      </div>

      {/* Filtres avec onglets */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-96">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Mail size={16} />
            Toutes
            <Badge variant="secondary" className="ml-1">
              {allNotifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            <Circle size={16} />
            Non lues
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read" className="flex items-center gap-2">
            <MailOpen size={16} />
            Lues
            <Badge variant="outline" className="ml-1">
              {readNotifications.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <NotificationsList 
            notifications={allNotifications}
            isLoading={isLoading}
            markAsRead={markAsRead}
            deleteNotification={deleteNotification}
            emptyMessage="Vous n'avez aucune notification."
          />
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          <NotificationsList 
            notifications={unreadNotifications}
            isLoading={isLoading}
            markAsRead={markAsRead}
            deleteNotification={deleteNotification}
            emptyMessage="Toutes vos notifications sont lues !"
            emptyIcon={<CheckCircle size={48} className="text-green-400" />}
          />
        </TabsContent>

        <TabsContent value="read" className="mt-6">
          <NotificationsList 
            notifications={readNotifications}
            isLoading={isLoading}
            markAsRead={markAsRead}
            deleteNotification={deleteNotification}
            emptyMessage="Aucune notification lue pour le moment."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Composant pour afficher la liste des notifications
interface NotificationsListProps {
  notifications: any[];
  isLoading: boolean;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  emptyMessage: string;
  emptyIcon?: React.ReactNode;
}

function NotificationsList({ 
  notifications, 
  isLoading, 
  markAsRead, 
  deleteNotification, 
  emptyMessage,
  emptyIcon 
}: NotificationsListProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-8">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="p-8 text-center">
          {emptyIcon || <Bell size={48} className="text-gray-300 mx-auto mb-4" />}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-500">
            {emptyIcon ? "Excellent travail !" : "Les nouvelles notifications apparaîtront ici."}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="divide-y divide-gray-100">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            compact={false}
          />
        ))}
      </div>
    </Card>
  );
}
