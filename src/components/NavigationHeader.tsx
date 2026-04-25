import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Home, User, Menu, Heart, LogOut, Mail, Sparkles, Globe, Check, Bell } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { API_BASE_URL } from "@/config/api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

const NavigationHeader = () => {
    const { user, signOut } = useAuth();
    const { t, userPreferences, updatePreferences } = useAppContext();
    const lang = userPreferences.language;
    const userRole = localStorage.getItem("user_role")?.toUpperCase() || "USER";

    const handleLangChange = (newLang: string) => {
        updatePreferences({ language: newLang });
    };

    const [displayName, setDisplayName] = useState(localStorage.getItem('user_name') || user?.email?.split('@')[0] || 'Explorer');

    // Always fetch real name from backend when user is logged in
    useEffect(() => {
        if (user?.email) {
            fetch(`${API_BASE_URL}/api/users/email/${user.email}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data) {
                        const realName = data.fullName || data.name;
                        if (realName && realName !== 'OAUTH_NO_PASSWORD') {
                            localStorage.setItem('user_name', realName);
                            setDisplayName(realName);
                        }
                    }
                })
                .catch(() => {});
        }
    }, [user]);

    const getInitials = () => {
        if (displayName) return displayName.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return 'U';
    };

    const getUserDisplayName = () => displayName;

    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/notifications/user/${user.email}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: any) => !n.read).length);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    const markAsRead = async (id: number) => {
        try {
            await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: 'POST' });
            fetchNotifications();
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-soft">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-500">
                            <img src="/logo.png" alt="TourNest Logo" className="w-full h-full object-contain filter drop-shadow-sm" />
                        </div>
                        <div className="flex flex-col -space-y-1">
                            <span className="text-2xl font-display font-black text-foreground tracking-tighter">TourNest</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/70 ml-0.5">India</span>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden lg:flex items-center space-x-10">
                        <Link to="/homestays" className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                            {t("stays")}
                        </Link>
                        <Link to="/attractions" className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                            {t("tours")}
                        </Link>
                        <Link to="/contact" className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                            {t("support")}
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5 transition-all">
                                    <Globe className="w-5 h-5 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-32 rounded-2xl border-border/50 shadow-premium" align="end">
                                <DropdownMenuItem onClick={() => handleLangChange("EN")} className="rounded-xl flex items-center justify-between font-bold">
                                    English {lang === "EN" && <Check className="w-4 h-4 text-primary" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleLangChange("HI")} className="rounded-xl flex items-center justify-between font-bold">
                                    Hindi {lang === "HI" && <Check className="w-4 h-4 text-primary" />}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <ThemeToggle />

            <div className="hidden sm:flex items-center gap-4">
              {userRole === "GUIDE" ? (
                <Link to="/guide-dashboard">
                  <Button variant="ghost" className="rounded-xl font-black text-primary hover:bg-primary/5 px-6">
                    Guide Studio
                  </Button>
                </Link>
              ) : userRole === "ADMIN" ? (
                <Link to="/admin-dashboard">
                  <Button variant="ghost" className="rounded-xl font-black text-secondary hover:bg-secondary/5 px-6">
                    Admin Hub
                  </Button>
                </Link>
              ) : (
                <Link to="/become-host">
                  <Button variant="ghost" className="rounded-xl font-bold text-primary hover:bg-primary/5 px-6">
                    {t("host")}
                  </Button>
                </Link>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-primary/5 group">
                            <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full animate-pulse" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 p-0 rounded-3xl mt-4 shadow-premium border-border/50 overflow-hidden" align="end">
                        <div className="p-4 bg-muted/30 border-b border-border/50">
                            <h3 className="font-black text-sm uppercase tracking-widest text-foreground">Notifications</h3>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto overflow-x-hidden premium-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-border/30">
                                        <Bell className="w-8 h-8 text-muted-foreground/30" />
                                    </div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No Alerts Yet</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div 
                                        key={n.id} 
                                        className={`p-4 border-b border-border/30 hover:bg-muted/30 transition-all cursor-pointer relative group ${!n.read ? 'bg-primary/[0.02]' : ''}`}
                                        onClick={() => !n.read && markAsRead(n.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                                n.type === 'SUCCESS' ? 'bg-secondary' : 
                                                n.type === 'WARNING' ? 'bg-orange-500' : 'bg-primary'
                                            }`} />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold leading-tight text-foreground pr-4">{n.message}</p>
                                                <span className="text-[10px] uppercase tracking-wider font-black text-muted-foreground/60 mt-1 block">
                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {!n.read && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Check className="w-4 h-4 text-primary" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-3 bg-muted/10 flex justify-center">
                            <Button variant="link" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 hover:text-primary">
                                Clear All Alerts
                            </Button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Link to="/favorites">
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5">
                    <Heart className="w-5 h-5 text-primary" />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-12 w-12 rounded-2xl p-0 hover:scale-105 transition-transform">
                      <Avatar className="h-12 w-12 border-2 border-primary/20 rounded-2xl">
                        <AvatarFallback className="bg-primary text-white font-black text-lg rounded-2xl">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-3 rounded-3xl mt-4 shadow-premium border-border/50" align="end">
                    <div className="p-4 mb-2 bg-muted/50 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{t("welcome")},</p>
                      <p className="font-black text-xl text-foreground truncate">{getUserDisplayName()}</p>
                      <p className="text-[10px] font-bold text-muted-foreground truncate opacity-70">{user.email}</p>
                    </div>
                    <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-primary/5 cursor-pointer">
                      <Link to={
                        userRole === 'ADMIN' ? "/admin-dashboard" :
                        userRole === 'GUIDE' ? "/guide-dashboard" :
                        userRole === 'HOST' ? "/host-dashboard" : 
                        "/tourist-dashboard"
                      } className="flex items-center font-bold">
                        <User className="mr-3 h-5 w-5 text-primary" />
                        {t("dashboard")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-primary/5 cursor-pointer">
                      <Link to="/favorites" className="flex items-center font-bold">
                        <Heart className="mr-3 h-5 w-5 text-primary" />
                        {t("wishlist")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem onClick={signOut} className="rounded-xl p-3 focus:bg-destructive/10 text-destructive cursor-pointer font-bold">
                      <LogOut className="mr-3 h-5 w-5" />
                      {t("signOut")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link to="/auth">
                <Button className="h-12 px-8 rounded-2xl bg-primary text-white font-bold shadow-glow hover:scale-105 transition-transform group">
                  <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  {t("login")}
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationHeader;