import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface MobileBottomNavProps {
  navItems: NavItem[];
  unreadCount?: number;
}

export function MobileBottomNav({ navItems, unreadCount = 0 }: MobileBottomNavProps) {
  const location = useLocation();

  // Limit to 5 items for mobile (common pattern)
  const displayItems = navItems.slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t shadow-lg safe-area-bottom">
      <div className="flex items-stretch justify-around h-[68px] px-1">
        {displayItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isUpdates = item.label.toLowerCase() === "updates";
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 min-w-0 py-2 gap-1",
                "active:scale-95 touch-manipulation",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Icon with badge */}
              <div className="relative">
                <div className={cn(
                  "p-1 rounded-lg",
                  isActive && "bg-primary/10"
                )}>
                  {item.icon}
                </div>
                {/* Notification badge for Updates */}
                {isUpdates && unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[10px] font-bold flex items-center justify-center"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </div>
              {/* Label */}
              <span className={cn(
                "text-[10px] leading-none truncate w-full text-center px-0.5",
                isActive ? "font-semibold" : "font-medium"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
