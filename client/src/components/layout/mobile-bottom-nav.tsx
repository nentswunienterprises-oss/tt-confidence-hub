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
      <div className="flex items-center justify-around h-16 px-2">
        {displayItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isUpdates = item.label.toLowerCase() === "updates";
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full px-1 py-2 transition-all duration-200",
                "active:scale-95 touch-manipulation",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-200",
                  isActive && "bg-primary/10"
                )}>
                  {item.icon}
                </div>
                {/* Notification badge for Updates */}
                {isUpdates && unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] font-bold flex items-center justify-center"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium mt-0.5 truncate max-w-full",
                isActive && "font-semibold"
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
