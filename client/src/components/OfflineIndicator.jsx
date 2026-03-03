import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
export function OfflineIndicator() {
    var _a = useState(navigator.onLine), isOnline = _a[0], setIsOnline = _a[1];
    useEffect(function () {
        var handleOnline = function () { return setIsOnline(true); };
        var handleOffline = function () { return setIsOnline(false); };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return function () {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    if (isOnline)
        return null;
    return (<div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm">
      <WifiOff className="w-4 h-4"/>
      <span>You're offline. Changes will sync when you're back online.</span>
    </div>);
}
