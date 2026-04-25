import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavigationHeader from "@/components/NavigationHeader";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/config/axios';
import { Button } from "@/components/ui/button";
import { Home, Calendar, TrendingUp, Star, Sparkles, Plus, MapPin, Check, X, MessageSquare, Clock, Eye, ChevronRight, Activity, Users, ArrowUpRight } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { resolveImage } from "@/lib/image-mapper";
import { toast } from "sonner";

const HostDashboard = () => {
  const { t } = useAppContext();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("listings");
  const [listings, setListings] = useState<any[]>([]);
  const [incomingBookings, setIncomingBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listingsRes, bookingsRes] = await Promise.all([
        apiClient.get(`/api/homestays`),
        apiClient.get(`/api/bookings`)
      ]);
      if (listingsRes.data) setListings(listingsRes.data);
      if (bookingsRes.data) setIncomingBookings(bookingsRes.data);
    } catch (error) {
      console.error("Error fetching host data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Also fetch support/inbox messages
  const fetchMessages = async () => {
    try {
      const res = await apiClient.get(`/api/support`);
      if (res.data) setMessages(res.data);
    } catch (e) { /* silent */ }
  };

  useEffect(() => { fetchData(); fetchMessages(); }, []);

  const totalRevenue = incomingBookings.reduce((acc, b) => {
    const amount = typeof b.amount === 'string' ? parseFloat(b.amount.replace(/[₹,]/g, '')) : (b.amount || 0);
    return acc + amount;
  }, 0);

  const handleApproveBooking = async (b: any) => {
    try {
      await apiClient.put(`/api/bookings/${b.id}`, { ...b, status: 'Approved' });
      setIncomingBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'Approved' } : x));
      toast.success(`Booking for ${b.entity} approved!`);
    } catch { toast.error("Failed to approve booking"); }
  };

  const handleRejectBooking = async (b: any) => {
    try {
      await apiClient.put(`/api/bookings/${b.id}`, { ...b, status: 'Rejected' });
      setIncomingBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'Rejected' } : x));
      toast.error(`Booking rejected.`);
    } catch { toast.error("Failed to reject booking"); }
  };

  const tabs = [
    { id: "listings", label: "Properties", icon: Home },
    { id: "bookings", label: "Bookings", icon: Calendar, count: incomingBookings.filter(b => b.status === 'Pending').length },
    { id: "inbox", label: "Inbox", icon: MessageSquare, count: messages.length },
  ];

  const stats = [
    { label: "Total Views", value: (listings.length * 168 + incomingBookings.length * 12).toLocaleString(), icon: Eye, color: "from-orange-400 to-pink-500", bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-500" },
    { label: "Bookings", value: incomingBookings.length.toString(), icon: Calendar, color: "from-emerald-400 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-500" },
    { label: "Revenue", value: `₹${(totalRevenue / 1000).toFixed(1)}K`, icon: TrendingUp, color: "from-blue-400 to-indigo-500", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-500" },
    { label: "Avg Rating", value: "4.9", icon: Star, color: "from-yellow-400 to-amber-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-sans">
      <NavigationHeader />
      <main className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6">

          {/* Hero Header */}
          <div className="relative mb-12 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 md:p-14 shadow-2xl">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-primary/20 rounded-full blur-[80px] translate-y-1/2" />
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }} />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-white/80 font-black uppercase tracking-[0.2em] text-[10px]">Host Management Center</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter text-white leading-tight">
                  Your Hospitality<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-amber-400 italic">Empire.</span>
                </h1>
                <p className="text-white/50 font-medium text-sm">Managing {listings.length} properties · {incomingBookings.length} total bookings</p>
              </div>

              {/* Tab pills */}
              <div className="flex bg-white/10 border border-white/20 backdrop-blur-md p-1.5 rounded-2xl gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-slate-900 shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {tab.count != null && tab.count > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-secondary text-white text-[8px] font-black rounded-full flex items-center justify-center">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats row inside hero */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-10 border-t border-white/10">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/50 text-[10px] uppercase font-black tracking-widest">{stat.label}</p>
                    <p className="text-white font-black text-xl font-display">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── LISTINGS ── */}
          {activeTab === "listings" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-black text-foreground">Your Properties</h2>
                <Link to="/become-host">
                  <Button className="h-11 px-6 rounded-2xl bg-foreground text-background font-black text-[10px] uppercase tracking-widest hover:bg-secondary hover:text-white transition-colors shadow-lg flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Listing
                  </Button>
                </Link>
              </div>

              {listings.length === 0 ? (
                <div className="text-center py-24 rounded-[2.5rem] border-2 border-dashed border-border/50 bg-muted/10">
                  <Home className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="font-black text-muted-foreground uppercase tracking-widest text-xs">No properties yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {listings.map((item) => (
                    <div key={item.id} className="group relative bg-white dark:bg-card rounded-[2rem] overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 border border-border/30">
                      {/* Image */}
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={resolveImage(item.image)}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {/* Status badge */}
                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${
                          item.approved ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white animate-pulse'
                        }`}>
                          {item.approved ? '● Live' : '⏳ Pending'}
                        </div>
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-black text-lg text-foreground mb-1 leading-tight group-hover:text-secondary transition-colors">{item.title}</h3>
                        <p className="text-muted-foreground text-sm font-medium flex items-center gap-1.5 mb-4">
                          <MapPin className="w-3.5 h-3.5 text-secondary" /> {item.location}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-border/40">
                          <div>
                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Price / night</p>
                            <p className="text-xl font-display font-black text-secondary">₹{item.price?.toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Link to={`/homestay/${item.id}`}>
                              <Button size="sm" variant="ghost" className="rounded-xl h-9 px-4 bg-muted/60 font-bold text-xs hover:bg-muted">
                                View
                              </Button>
                            </Link>
                            <Link to={`/become-host?edit=${item.id}`}>
                              <Button size="sm" className="rounded-xl h-9 px-4 bg-secondary text-white font-bold text-xs">
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {activeTab === "bookings" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-display font-black">Incoming Bookings</h2>

              {incomingBookings.length === 0 ? (
                <div className="text-center py-24 rounded-[2.5rem] border-2 border-dashed border-border/50 bg-muted/10">
                  <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="font-black text-muted-foreground uppercase tracking-widest text-xs">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incomingBookings.map((b) => {
                    const statusColor = b.status === 'Approved' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700' :
                      b.status === 'Rejected' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700' :
                      'bg-white dark:bg-card border-border/40';
                    return (
                      <div key={b.id} className={`group rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all ${statusColor}`}>
                        {/* Guest */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-secondary to-amber-400 flex items-center justify-center text-white font-black text-lg shadow-md flex-shrink-0">
                            {b.user?.charAt(0)?.toUpperCase() || 'G'}
                          </div>
                          <div>
                            <p className="font-black text-foreground">{b.user}</p>
                            <p className="text-muted-foreground text-xs font-medium">{b.entity}</p>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="hidden md:flex items-center gap-2 text-muted-foreground text-sm font-bold">
                          <Clock className="w-4 h-4" />
                          {b.date}
                        </div>

                        {/* Amount */}
                        <div className="font-display font-black text-secondary text-lg">{b.amount}</div>

                        {/* Status + Actions */}
                        <div className="flex items-center gap-3">
                          {b.status === 'Approved' ? (
                            <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">✓ Approved</span>
                          ) : b.status === 'Rejected' ? (
                            <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">✗ Rejected</span>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveBooking(b)}
                                className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectBooking(b)}
                                className="h-9 px-4 rounded-xl border-red-300 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 gap-1.5"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── INBOX ── */}
          {activeTab === "inbox" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-display font-black">Guest Inbox</h2>

              {messages.length === 0 ? (
                <div className="text-center py-24 rounded-[2.5rem] border-2 border-dashed border-border/50 bg-muted/10">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="font-black text-muted-foreground uppercase tracking-widest text-xs">No messages yet</p>
                  <p className="text-muted-foreground/60 text-sm mt-1">Guest inquiries will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className="group bg-white dark:bg-card rounded-2xl border border-border/40 p-5 flex items-start gap-4 hover:shadow-md hover:border-secondary/30 transition-all cursor-pointer">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-black flex-shrink-0">
                        {msg.name?.charAt(0)?.toUpperCase() || 'G'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-black text-foreground">{msg.name}</p>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase shrink-0">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent'}
                          </span>
                        </div>
                        <p className="text-secondary font-bold text-xs mb-1">{msg.subject}</p>
                        <p className="text-muted-foreground text-sm font-medium leading-snug line-clamp-2">{msg.message}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-secondary transition-colors flex-shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HostDashboard;
