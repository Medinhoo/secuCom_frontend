import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { ROUTES } from "@/config/routes.config";

interface NotificationBellClickableProps {
  className?: string;
  variant?: "sidebar" | "header";
}

export function NotificationBellClickable({ 
  className, 
  variant = "header" 
}: NotificationBellClickableProps) {
  const { unreadCount } = useNotifications({ mode: 'dropdown' });

  // Animation subtile pour le badge
  const [badgeAnimate, setBadgeAnimate] = React.useState(false);
  
  React.useEffect(() => {
    if (unreadCount > 0) {
      setBadgeAnimate(true);
      const timer = setTimeout(() => setBadgeAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  if (variant === "sidebar") {
    return (
      <Link to={ROUTES.NOTIFICATIONS}>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-8 w-8 text-white rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30",
            className
          )}
        >
          <Bell 
            size={16} 
            className={cn(
              "transition-colors duration-200",
              unreadCount > 0 ? "text-white" : "text-white/80"
            )}
          />
          
          {/* Badge avec animation pour sidebar */}
          {unreadCount > 0 && (
            <div 
              className={cn(
                "absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center transition-all duration-300 ring-2 ring-white/20",
                badgeAnimate && "animate-pulse scale-110"
              )}
            >
              <span className="text-xs font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </div>
          )}
        </Button>
      </Link>
    );
  }

  // Version header par défaut
  return (
    <Link to={ROUTES.NOTIFICATIONS}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "relative h-9 w-9 hover:bg-blue-50 transition-colors duration-200",
          className
        )}
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
    </Link>
  );
}
