import { useState, useEffect, useCallback } from 'react';
import { Bell, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationBellProps {
  compact?: boolean;
}

const NotificationBell = ({ compact = false }: NotificationBellProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/user/${user.email}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.slice(0, 20));
        setUnreadCount(data.filter((n: any) => !n.read).length);
      }
    } catch { /* silent */ }
  }, [user?.email]);

  // Real-time polling via shared hook
  useNotifications((count) => setUnreadCount(count));

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: 'POST' });
      fetchNotifications();
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => markAsRead(n.id)));
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'bg-emerald-500';
      case 'WARNING': return 'bg-amber-500';
      case 'ERROR': return 'bg-red-500';
      default: return 'bg-primary';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl hover:bg-primary/5 group"
        >
          {/* 3D Bell with glow */}
          <div className="relative">
            <Bell className={`w-5 h-5 transition-all duration-300 ${unreadCount > 0 ? 'text-secondary animate-[wiggle_1s_ease-in-out]' : 'text-muted-foreground group-hover:text-primary'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-2.5 -right-2.5 min-w-[18px] h-[18px] px-1 bg-secondary text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-glow ring-2 ring-background animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-96 p-0 rounded-3xl mt-4 border-border/50 overflow-hidden"
        align="end"
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)' }}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-secondary/10 to-primary/10 border-b border-border/40 flex items-center justify-between backdrop-blur-sm">
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-[10px] text-muted-foreground font-bold">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-colors flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Mark all read
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className="max-h-[420px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-border/30">
                <Bell className="w-7 h-7 text-muted-foreground/30" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No alerts yet</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`px-5 py-4 border-b border-border/20 hover:bg-muted/30 transition-colors cursor-pointer group relative ${!n.read ? 'bg-secondary/[0.03]' : ''}`}
                onClick={() => !n.read && markAsRead(n.id)}
              >
                {/* Unread indicator bar */}
                {!n.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-secondary rounded-r-full" />
                )}
                <div className="flex gap-3 items-start">
                  <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${typeColor(n.type)}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                      {n.message}
                    </p>
                    <span className="text-[10px] uppercase tracking-wider font-black text-muted-foreground/50 mt-1 block">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {!n.read && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Check className="w-3.5 h-3.5 text-secondary" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-muted/10 flex justify-center border-t border-border/30">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
              TourNest Alerts
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
