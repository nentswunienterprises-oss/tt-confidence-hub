import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
export function MobileBottomNav(_a) {
    var navItems = _a.navItems, _b = _a.unreadCount, unreadCount = _b === void 0 ? 0 : _b;
    var location = useLocation();
    // Limit to 5 items for mobile (common pattern)
    var displayItems = navItems.slice(0, 5);
    return (<nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t shadow-lg safe-area-bottom">
      <div className="flex items-stretch justify-around h-[68px] px-1">
        {displayItems.map(function (item) {
            var isActive = location.pathname === item.path;
            var isUpdates = item.label.toLowerCase() === "updates";
            return (<Link key={item.path} to={item.path} className={cn("relative flex flex-col items-center justify-center flex-1 min-w-0 py-2 gap-1 overflow-visible", "active:scale-95 touch-manipulation", isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground")}>
              {/* Icon with badge - overflow-visible so badge can escape */}
              <div className="relative overflow-visible">
                <div className={cn("p-1 rounded-lg", isActive && "bg-primary/10")}>
                  {item.icon}
                </div>
                {/* Notification badge - absolutely positioned to overflow on top */}
                {isUpdates && unreadCount > 0 && (<span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 text-[10px] font-bold flex items-center justify-center bg-destructive text-destructive-foreground rounded-full z-10">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>)}
              </div>
              {/* Label */}
              <span className={cn("text-[10px] leading-none truncate w-full text-center px-0.5", isActive ? "font-semibold" : "font-medium")}>
                {item.label}
              </span>
              {/* Active indicator dot */}
              {isActive && (<span className="w-1 h-1 rounded-full bg-primary"/>)}
            </Link>);
        })}
      </div>
    </nav>);
}
