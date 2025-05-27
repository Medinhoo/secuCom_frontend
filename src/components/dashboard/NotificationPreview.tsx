import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Eye, RefreshCw, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'unread';

export const NotificationPreview: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications({ mode: 'dashboard' });

  // Limiter à 6 notifications pour le dashboard
  const displayNotifications = notifications.slice(0, 6);
  const filteredNotifications = filter === 'unread' 
    ? displayNotifications.filter(n => !n.read)
    : displayNotifications;

  return (
    <Card className="border border-slate-200 shadow-sm h-[400px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0 border-b border-slate-100">
        <CardTitle className="text-lg font-bold text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Notifications récentes
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge className="bg-blue-100 text-blue-700 animate-pulse">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshNotifications}
              className="h-7 w-7 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
        
        {/* Mini filtres */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="all" className="text-xs">
                  Toutes ({displayNotifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Non lues ({displayNotifications.filter(n => !n.read).length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        {notifications.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1 font-medium">Aucune notification</p>
            <p className="text-xs text-gray-400">Vous êtes à jour !</p>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">Toutes vos notifications sont lues !</p>
                  <p className="text-xs text-gray-400">Excellent travail !</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                      compact={true}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Actions footer */}
            <div className="border-t border-slate-100 p-3 bg-gray-50">
              <div className="flex items-center justify-between gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:bg-blue-50 flex-1"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Marquer toutes comme lues
                  </Button>
                )}
                
                <Link to="/notifications" className={cn("flex-1", unreadCount === 0 && "w-full")}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "text-xs text-blue-600 hover:bg-blue-50",
                      unreadCount === 0 ? "w-full" : "flex-1"
                    )}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Voir toutes ({notifications.length})
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
