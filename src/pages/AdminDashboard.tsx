import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import NavigationHeader from "@/components/NavigationHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ShieldCheck, Sparkles, Activity, Users, Home, Compass,
    ArrowUpRight, AlertCircle, FileText, CheckCircle2,
    Trash2, Search, ShieldAlert,
    Clock, Check, X
} from "lucide-react";
import { 
    Ticket, MessageSquare, History, Phone, Mail, Eye,
    TrendingUp, Award, UserCheck, ThumbsUp, MapPin
} from "lucide-react";
import apiClient from '@/config/axios';
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/contexts/AppContext";
import { resolveImage } from "@/lib/image-mapper";

const AdminDashboard = () => {
    const { toast } = useToast();
    const { t } = useAppContext();
    const [searchParams] = useSearchParams();
    const initialView = searchParams.get('view') || "overview";
    const [activeView, setActiveView] = useState(initialView);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
    const [detailedItem, setDetailedItem] = useState<{ type: string, data: any } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [supportMessages, setSupportMessages] = useState<any[]>([]);

    // Platform Health Stats (Calculated dynamically)
    const [stats, setStats] = useState([
        { label: t("activeStays"), value: "0", icon: Home, color: "bg-secondary" },
        { label: t("verifiedGuides"), value: "0", icon: Compass, color: "bg-nature" },
        { label: t("totalUsers"), value: "0", icon: Users, color: "bg-primary" },
        { label: t("systemHealth"), value: "99.9%", icon: Activity, color: "bg-gold" }
    ]);

    // --- State with localStorage persistence ---

    // Activities/Reports (Main feed)
    const [reports, setReports] = useState<any[]>([]);

    // Managed Entities
    const [tourists, setTourists] = useState<any[]>([]);

    const [guides, setGuides] = useState<any[]>([]);

    const [stays, setStays] = useState<any[]>([]);
    const [tours, setTours] = useState<any[]>([]);
    const [pendingTours, setPendingTours] = useState<any[]>([]);

    const [bookings, setBookings] = useState<any[]>([]);
    const [pendingStays, setPendingStays] = useState<any[]>([]);

    const [reviews, setReviews] = useState<any[]>([]);

    // --- Derived State ---
    const supportFeed = reports.filter(r => r.type === 'Support');

    useEffect(() => {
        const view = searchParams.get('view');
        if (view) {
            setActiveView(view);
        }
    }, [searchParams]);

    // --- Persistence Effects replaced with Fetch Effects ---
    useEffect(() => {
        const fetchData = async () => {
            // Fetch Users
            try {
                const usersRes = await apiClient.get(`/api/users`);
                if (usersRes.data) setTourists(usersRes.data);
            } catch (error) { console.error("Error fetching users:", error); }

            // Fetch Bookings
            try {
                const bookingsRes = await apiClient.get(`/api/bookings`);
                if (bookingsRes.data) setBookings(bookingsRes.data);
            } catch (error) { console.error("Error fetching bookings:", error); }

            // Fetch Stays
            try {
                const staysRes = await apiClient.get(`/api/homestays`);
                if (staysRes.data) setStays(staysRes.data);
            } catch (error) { console.error("Error fetching stays:", error); }

            // Fetch Attractions
            try {
                const attractionsRes = await apiClient.get(`/api/attractions`);
                if (attractionsRes.data) setTours(attractionsRes.data);
            } catch (error) { console.error("Error fetching tours:", error); }

            // Fetch Support Messages
            try {
                const supportRes = await apiClient.get(`/api/support`);
                if (supportRes.data) {
                    setSupportMessages(supportRes.data);
                    const supportReports = supportRes.data.map((r: any) => ({
                        id: r.id.toString(),
                        title: "Support: " + r.subject,
                        user: r.name,
                        email: r.email,
                        date: new Date(r.createdAt).toLocaleDateString(),
                        type: "Support",
                        priority: "Normal",
                        details: "[Subject: " + r.subject + "] - Message: " + r.message
                    }));
                    setReports(prev => [...prev.filter(p => p.type !== 'Support'), ...supportReports]);
                }
            } catch (error) { console.error("Error fetching support:", error); }

            // Fetch Pending Tours
            let tourReports: any[] = [];
            try {
                const pendingToursRes = await apiClient.get(`/api/attractions/pending`);
                if (pendingToursRes.data) {
                    setPendingTours(pendingToursRes.data);
                    tourReports = pendingToursRes.data.map((t: any) => ({
                        id: `tour_pending_${t.id}`,
                        tourId: t.id,
                        title: "New Tour Submission",
                        user: t.guideEmail ? t.guideEmail.split('@')[0] : "Guide",
                        email: t.guideEmail || "No Email Provided",
                        date: "Pending Approval",
                        type: "Application",
                        priority: "High",
                        details: `Submission for '${t.title}' in ${t.location}. Check details and authorize.`
                    }));
                }
            } catch (error) { console.error("Error fetching pending tours:", error); }

            // Fetch Pending Stays
            let stayReports: any[] = [];
            try {
                const pendingStaysRes = await apiClient.get(`/api/homestays/pending`);
                if (pendingStaysRes.data) {
                    setPendingStays(pendingStaysRes.data);
                    stayReports = pendingStaysRes.data.map((s: any) => ({
                        id: `stay_pending_${s.id}`,
                        stayId: s.id,
                        title: "New Property Listing",
                        user: s.host ? s.host.split('@')[0] : "Host",
                        email: s.host || "No Email Provided",
                        date: "Pending Approval",
                        type: "Application",
                        priority: "High",
                        details: `Host ${s.host} submitted '${s.title}' in ${s.location}. Check details and authorize.`
                    }));
                }
            } catch (error) { console.error("Error fetching pending stays:", error); }

            // Update Reports Feed
            setReports(prev => [
                ...prev.filter(p => !p.tourId && !p.stayId && p.type !== 'Application'),
                ...tourReports,
                ...stayReports
            ]);
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    // Update stats when data changes
    useEffect(() => {
        const approvedBookings = bookings.filter(b => b.status === 'Approved');
        const totalGuests = approvedBookings.reduce((acc, b) => acc + (b.guestsCount || 0), 0);
        
        setStats([
            { label: t("activeStays"), value: stays.length.toString(), icon: Home, color: "bg-secondary" },
            { label: t("verifiedGuides"), value: guides.length.toString(), icon: Compass, color: "bg-nature" },
            { label: t("totalUsers"), value: tourists.length.toString(), icon: Users, color: "bg-primary" },
            { label: "Total People", value: totalGuests.toString(), icon: Users, color: "bg-fuchsia-500" },
            { label: t("systemHealth"), value: "99.9%", icon: Activity, color: "bg-gold" }
        ]);
    }, [stays, guides, tourists, bookings, t]);


    // --- Handlers ---
    const handleDelete = async (type: string, id: string) => {
        try {
            let url = '';
            if (type === 'tourist') url = `/api/users/${id}`;
            if (type === 'booking') url = `/api/bookings/${id}`;
            if (type === 'stay') url = `/api/homestays/${id}`;
            if (type === 'tour') url = `/api/attractions/${id}`;

            if (url) {
                await apiClient.delete(url);
            }

            if (type === 'tourist') setTourists(prev => prev.filter(t => t.id !== id));
            if (type === 'guide') setGuides(prev => prev.filter(g => g.id !== id));
            if (type === 'stay') setStays(prev => prev.filter(s => s.id !== id));
            if (type === 'tour') setTours(prev => prev.filter(t => t.id !== id));
            if (type === 'booking') setBookings(prev => prev.filter(b => b.id !== id));
            if (type === 'review') setReviews(prev => prev.filter(r => r.id !== id));
            
            setReports(prev => prev.filter(r => r.id !== id || (r.tourId && r.tourId === id) || (r.id === `act_${id}`)));

            toast({
                title: "Administrative Action",
                description: `Permanently removed ${type} record #${id}.`,
                variant: "destructive"
            });
        } catch (error) {
            console.error("Delete error:", error);
            toast({
                title: "Action Failed",
                description: `Could not remove ${type} record. Check backend connection.`,
                variant: "destructive"
            });
        }
    };

    const resolveReport = (id: string) => {
        setReports(prev => prev.filter(r => r.id !== id));
        setSelectedActivity(null);
        toast({ title: "Resolved", description: "Issue archived successfully." });
    };

    const denyApplication = async (report: any) => {
        if (report.type === 'Support') {
            resolveReport(report.id);
            toast({ title: "Removed", description: "Inquiry discarded." });
            return;
        }
        try {
            if (report.tourId) {
                await apiClient.delete(`/api/attractions/${report.tourId}/deny`);
                setTours(prev => prev.filter(t => t.id !== report.tourId));
                setPendingTours(prev => prev.filter(t => t.id !== report.tourId));
                toast({ title: "Tour Denied", description: `Experience permanently discarded. Notification sent to ${report.email}.` });
            } else if (report.stayId) {
                await apiClient.delete(`/api/homestays/${report.stayId}/deny`);
                setStays(prev => prev.filter(s => s.id !== report.stayId));
                setPendingStays(prev => prev.filter(s => s.id !== report.stayId));
                toast({ title: "Property Denied", description: `Stay permanently discarded. Notification sent to ${report.email}.` });
            }
            resolveReport(report.id);
        } catch (error) {
            console.error("Denial error:", error);
            toast({ title: "Action Failed", description: "Failed to deny item.", variant: "destructive" });
        }
    };

    const approveApplication = async (report: any) => {
        if (report.type === 'Support') {
            resolveReport(report.id);
            toast({ title: "Responded", description: "Inquiry marked as handled." });
            return;
        }

        try {
            if (report.tourId) {
                await apiClient.put(`/api/attractions/${report.tourId}/approve`);
                setTours(prev => [...prev, pendingTours.find(t => t.id === report.tourId)].filter(Boolean));
                setPendingTours(prev => prev.filter(t => t.id !== report.tourId));
                toast({ title: "Tour Approved", description: `Experience is now live. Approval email sent to ${report.email}.` });
            } else if (report.stayId) {
                await apiClient.put(`/api/homestays/${report.stayId}/approve`);
                setStays(prev => [...prev, pendingStays.find(s => s.id === report.stayId)].filter(Boolean));
                setPendingStays(prev => prev.filter(s => s.id !== report.stayId));
                toast({ title: "Property Approved", description: `Stay is now live in the catalog. Approval email sent to ${report.email}.` });
            }
            resolveReport(report.id);
        } catch (error) {
            console.error("Approval error:", error);
            toast({ title: "Approval Failed", description: "Failed to authorize item.", variant: "destructive" });
        }
    };

    const updateBookingStatus = async (id: string, status: string) => {
        try {
            const booking = bookings.find(b => b.id === id);
            if (!booking) return;
            const response = await apiClient.put(`/api/bookings/${id}`, { ...booking, status });
            if (response.data) {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
                toast({ title: status === 'Approved' ? 'Booking Approved' : 'Booking Rejected', description: `Booking #${id} is now ${status}.` });
            } else throw new Error("Update failed");
        } catch (error) {
            console.error("Status update error:", error);
            toast({ title: "Action Failed", description: "Could not update status.", variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen bg-muted/20 selection:bg-secondary/20 font-sans">
            <NavigationHeader />
            <main className="pt-32 pb-16 px-6">
                <div className="container mx-auto max-w-7xl animate-fade-in">
                    {/* Hero Header (Empire Theme) */}
                    <div className="relative mb-12 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 md:p-14 shadow-2xl">
                        {/* Decorative blobs */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
                        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-primary/20 rounded-full blur-[80px] translate-y-1/2" />
                        {/* Grid pattern */}
                        <div className="absolute inset-0 opacity-5" style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '32px 32px'
                        }} />

                        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-end justify-between gap-8">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-white/80 font-black uppercase tracking-[0.2em] text-[10px]">Master Admin Hub · LIVE</span>
                                </div>
                                <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter text-white leading-tight">
                                    Your Administration<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-amber-400 italic">Empire.</span>
                                </h1>
                                <p className="text-white/50 font-medium text-sm">Managing {tourists.length} Users · {stays.length} Properties · {tours.length} Tours</p>
                            </div>

                            {/* Tab pills */}
                            <div className="flex flex-wrap bg-white/10 border border-white/20 backdrop-blur-md p-1.5 rounded-2xl gap-1 max-w-full overflow-x-auto premium-scrollbar">
                                {[
                                    { id: "overview", label: t("overview"), icon: Activity },
                                    { id: "tourists", label: "Users", icon: Users },
                                    { id: "stays", label: t("staysLabel"), icon: Home },
                                    { id: "tours", label: t("toursLabel"), icon: Compass },
                                    { id: "applications", label: "Applications", icon: FileText },
                                    { id: "bookings", label: t("bookings"), icon: Ticket },
                                    { id: "inbox", label: "Inbox", icon: Mail },
                                    { id: "support", label: t("supportLabel"), icon: MessageSquare },
                                    { id: "reviews", label: t("reviewsLabel"), icon: ThumbsUp }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveView(tab.id)}
                                        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                            activeView === tab.id
                                                ? "bg-white text-slate-900 shadow-lg"
                                                : "text-white/70 hover:text-white hover:bg-white/10"
                                            }`}
                                    >
                                        <tab.icon className="w-3.5 h-3.5" />
                                        {tab.label}
                                        {tab.id === 'applications' && (pendingStays.length + pendingTours.length) > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-secondary text-white text-[8px] font-black rounded-full flex items-center justify-center">
                                                {pendingStays.length + pendingTours.length}
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
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color === 'bg-secondary' ? 'from-secondary to-amber-500' : stat.color === 'bg-nature' ? 'from-nature to-emerald-500' : stat.color === 'bg-primary' ? 'from-primary to-blue-500' : 'from-gold to-yellow-500'} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
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

                    {/* Content Views */}
                    <div className="animate-scale-in">
                        {activeView === 'overview' && (
                            <div className="space-y-12">
                                <div className="grid lg:grid-cols-5 gap-6">
                                    {stats.map((stat, i) => (
                                        <Card key={i} className="rounded-[2.5rem] border-border/50 shadow-soft overflow-hidden group border border-border/50 flex flex-col h-full effect-3d">
                                            <CardContent className="p-8 flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-glow ${stat.color} group-hover:rotate-12 transition-all`}>
                                                    <stat.icon className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                                                    <h4 className="text-2xl font-display font-black">{stat.value}</h4>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <div className="grid lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-8">
                                        <h2 className="text-3xl font-display font-black">{t('platformFeed')}</h2>
                                        <div className="space-y-4">
                                            {reports.length === 0 ? (
                                                <div className="p-20 text-center bg-white/50 rounded-[3rem] border border-dashed border-border/50">
                                                    <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                                    <p className="font-black text-muted-foreground uppercase tracking-widest text-xs italic">All systems Green</p>
                                                </div>
                                            ) : (
                                                reports.map((report) => (
                                                    <Card key={report.id} className="rounded-[2.5rem] bg-white border-border/50 shadow-soft group cursor-pointer overflow-hidden border-l-4 border-l-secondary effect-3d" onClick={() => setSelectedActivity(report)}>
                                                        <CardContent className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                                            <div className="flex items-center gap-6">
                                                                <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-secondary/10 group-hover:text-secondary transition-all">
                                                                    {report.type === 'Support' ? <MessageSquare className="w-7 h-7" /> : <TrendingUp className="w-7 h-7" />}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-black text-xl group-hover:text-secondary transition-colors">{report.title}</h4>
                                                                    <p className="text-xs font-bold text-muted-foreground opacity-60 italic">Source: {report.user} • {report.date}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest italic ${report.type === 'Support' ? 'bg-nature/10 text-nature' : 'bg-secondary/10 text-secondary'
                                                                    }`}>{report.type}</div>
                                                                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all">
                                                                    <ArrowUpRight className="w-6 h-6" />
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <h2 className="text-3xl font-display font-black">{t('adminIntelligence')}</h2>
                                        <Card className="rounded-[3rem] p-10 bg-foreground text-background shadow-premium space-y-8 relative overflow-hidden effect-3d">
                                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-tricolor opacity-10" />
                                            <div className="relative z-10 space-y-8">
                                                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto border border-white/20">
                                                    <ShieldCheck className="w-10 h-10 text-nature" />
                                                </div>
                                                <div className="text-center space-y-2">
                                                    <h3 className="text-3xl font-display font-black tracking-tighter">{t('ultimateControl')}</h3>
                                                    <p className="text-xs font-medium opacity-60 uppercase tracking-[0.2em] font-sans">Full Database Override Active</p>
                                                </div>
                                                <div className="space-y-3">
                                                    <Button className="w-full h-18 py-6 rounded-2xl bg-secondary text-white font-black text-[10px] uppercase tracking-widest shadow-glow hover:scale-[1.03] transition-transform">
                                                        <ShieldAlert className="w-6 h-6 mr-3" /> {t('systemLockdown')}
                                                    </Button>
                                                    <Button variant="outline" className="w-full h-18 py-6 rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white font-black text-[10px] uppercase tracking-widest">
                                                        <History className="w-6 h-6 mr-3" /> {t('fullLogs')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Data Tables */}
                        {activeView !== 'overview' && (
                            <div className="bg-white dark:bg-card rounded-[3.5rem] border border-border/50 shadow-premium overflow-hidden border-t-8 border-t-secondary animate-scale-in">
                                <div className="p-10 border-b border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-muted/10">
                                    <h2 className="text-4xl font-display font-black capitalize italic">{activeView} {t('overview')}</h2>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-full sm:w-[400px]">
                                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <input type="text" placeholder={`${t('search')} in ${activeView}...`} className="w-full pl-16 h-16 rounded-3xl bg-white border-2 border-transparent focus:border-secondary transition-all outline-none font-bold shadow-soft" />
                                        </div>
                                        {['stays', 'tours', 'tourists'].includes(activeView) && (
                                            <Button className="h-16 px-8 rounded-3xl bg-secondary text-white font-black text-[10px] uppercase tracking-widest shadow-glow hover:scale-105 transition-all" onClick={() => { setIsEditing(true); setEditData({ type: activeView, isNew: true }); }}>
                                                Add New
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {['bookings', 'reviews', 'support', 'inbox'].includes(activeView) && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-muted/30">
                                                <th className="p-10 text-[10px] uppercase font-black tracking-widest text-muted-foreground">{t('detailedIdentity')}</th>
                                                <th className="p-10 text-[10px] uppercase font-black tracking-widest text-muted-foreground">{t('metricSignature')}</th>
                                                <th className="p-10 text-[10px] uppercase font-black tracking-widest text-muted-foreground text-center">{t('override')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">

                                            {activeView === 'bookings' && bookings.map(booking => (
                                                <tr key={booking.id} className="hover:bg-muted/5 transition-colors group">
                                                    <td className="p-10">
                                                        <div className="space-y-1">
                                                            <div className="font-black text-2xl group-hover:text-secondary transition-colors">{booking.entity}</div>
                                                            <div className="text-sm font-bold text-muted-foreground opacity-70 italic font-sans">{t('guests')}: {booking.user} ({booking.userEmail})</div>
                                                            <div className="text-xs text-muted-foreground/60">{booking.date}</div>
                                                        </div>
                                                    </td>
                                                    <td className="p-10">
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-xl font-black text-nature">{booking.amount}</div>
                                                            <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                                booking.status === 'Approved' ? 'bg-nature/10 text-nature' :
                                                                booking.status === 'Rejected' ? 'bg-destructive/10 text-destructive' :
                                                                'bg-gold/10 text-gold'
                                                            }`}>{booking.status || 'Pending'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="p-10 text-center space-x-2">
                                                        <Button title="Approve" variant="ghost" className="w-12 h-12 rounded-xl text-nature hover:bg-nature/10" onClick={() => updateBookingStatus(booking.id, 'Approved')}>
                                                            <CheckCircle2 className="w-6 h-6" />
                                                        </Button>
                                                        <Button title="Reject" variant="ghost" className="w-12 h-12 rounded-xl text-destructive hover:bg-destructive/10" onClick={() => updateBookingStatus(booking.id, 'Rejected')}>
                                                            <X className="w-6 h-6" />
                                                        </Button>
                                                        <Button title="Delete" variant="ghost" className="w-12 h-12 rounded-xl text-muted-foreground hover:bg-muted" onClick={() => handleDelete('booking', booking.id)}>
                                                            <Trash2 className="w-6 h-6" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {activeView === 'support' && supportMessages.map(msg => (
                                                <tr key={msg.id} className="hover:bg-muted/5 transition-colors group">
                                                    <td className="p-10">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-16 h-16 rounded-[1.5rem] bg-nature/10 flex items-center justify-center text-nature border-2 border-nature/20">
                                                                <MessageSquare className="w-8 h-8" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="font-black text-2xl group-hover:text-secondary transition-colors">{msg.user}</div>
                                                                <div className="text-sm font-bold text-muted-foreground opacity-70 italic font-sans">{msg.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-10">
                                                        <div className="space-y-1">
                                                            <div className="font-bold text-foreground text-sm leading-tight max-w-md truncate">
                                                                {(msg.details || "").replace('[Subject: ', '').split('] - Message: ')[0]}
                                                            </div>
                                                            <div className="text-xs font-bold text-muted-foreground italic font-sans">Received {msg.date}</div>
                                                        </div>
                                                    </td>
                                                    <td className="p-10 text-center space-x-2">
                                                        <Button variant="ghost" className="w-12 h-12 rounded-xl text-secondary hover:bg-secondary/10" onClick={() => setSelectedActivity(msg)}>
                                                            <Eye className="w-6 h-6" />
                                                        </Button>
                                                        <Button variant="ghost" className="w-12 h-12 rounded-xl text-destructive hover:bg-destructive/10" onClick={() => handleDelete('support', msg.id)}>
                                                            <Trash2 className="w-6 h-6" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {activeView === 'reviews' && reviews.map(rev => (
                                                <tr key={rev.id} className="hover:bg-muted/5 transition-colors group">
                                                    <td className="p-10">
                                                        <div className="space-y-1">
                                                            <div className="font-black text-2xl group-hover:text-secondary transition-colors">{rev.user}</div>
                                                            <div className="text-sm font-bold text-muted-foreground opacity-70 italic font-sans">Reviewed {rev.target} ({rev.type})</div>
                                                        </div>
                                                    </td>
                                                    <td className="p-10">
                                                        <div className="space-y-2">
                                                            <div className="flex gap-1">{[...Array(5)].map((_, i) => <Award key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-gold text-gold' : 'text-muted'}`} />)}</div>
                                                            <p className="text-xs font-bold text-muted-foreground italic max-w-sm line-clamp-1">"{rev.comment}"</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-10 text-center">
                                                        <Button variant="ghost" className="w-14 h-14 rounded-2xl text-destructive hover:bg-destructive/10" onClick={() => handleDelete('review', rev.id)}>
                                                            <Trash2 className="w-7 h-7" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                )}
                                
                                
                                {/* New CSS Grid Layout for Users, Stays, and Tours */}
                                {activeView === 'tourists' && (
                                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-muted/5">
                                        {tourists.map(tourist => (
                                            <div key={tourist.id} className="group relative bg-white dark:bg-card rounded-[2rem] border border-border/50 shadow-soft hover:shadow-premium transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col">
                                                <div className="h-32 w-full bg-gradient-tricolor opacity-10 relative overflow-hidden" />
                                                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-24 h-24 rounded-[2rem] bg-white dark:bg-card shadow-lg flex items-center justify-center border-4 border-white dark:border-card z-10">
                                                    <div className="w-full h-full rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary font-display font-black text-4xl">
                                                        {tourist.name?.[0] || tourist.fullName?.[0] || 'U'}
                                                    </div>
                                                </div>
                                                <div className="p-6 pt-16 space-y-4 flex-1 flex flex-col items-center text-center">
                                                    <div className="space-y-1">
                                                        <h4 className="text-2xl font-display font-black leading-tight group-hover:text-primary transition-colors">{tourist.fullName || tourist.name}</h4>
                                                        <p className="text-sm font-bold text-muted-foreground opacity-70 italic">{tourist.email}</p>
                                                    </div>
                                                    <div className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${tourist.role === 'ADMIN' ? 'bg-secondary/20 text-secondary' : tourist.role === 'GUIDE' ? 'bg-nature/20 text-nature' : 'bg-primary/20 text-primary'}`}>
                                                        {tourist.role || 'USER'}
                                                    </div>
                                                    <div className="flex gap-4 text-xs font-bold text-muted-foreground mt-4">
                                                        <span className="flex items-center gap-1"><Compass className="w-4 h-4 text-muted-foreground/60"/> {tours.filter(t => t.guideEmail === tourist.email).length} Tours</span>
                                                        <span className="flex items-center gap-1"><Ticket className="w-4 h-4 text-muted-foreground/60"/> {bookings.filter(b => b.userEmail === tourist.email).length} Bookings</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 p-6 pt-0 mt-auto justify-center">
                                                    <Button variant="outline" className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-2" onClick={() => setDetailedItem({ type: 'user_activity', data: { user: tourist.fullName || tourist.name, email: tourist.email } })}>
                                                        <Eye className="w-4 h-4 mr-2" /> Timeline
                                                    </Button>
                                                    <Button variant="secondary" size="icon" className="w-12 h-12 rounded-xl text-blue-500 hover:text-white hover:bg-blue-500 border-2 border-transparent hover:border-blue-500" onClick={() => { setIsEditing(true); setEditData({ type: 'tourists', ...tourist }); }}>
                                                        <FileText className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="destructive" size="icon" className="w-12 h-12 rounded-xl border-2 border-transparent hover:border-destructive" onClick={() => handleDelete('tourist', tourist.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeView === 'stays' && (
                                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-muted/5">
                                        {stays.map(stay => (
                                            <div key={stay.id} className="group relative bg-white dark:bg-card rounded-[2rem] border border-border/50 shadow-soft hover:shadow-premium transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col">
                                                <div className="h-48 w-full bg-muted/30 relative overflow-hidden">
                                                    <img src={resolveImage(stay.image || 'havelock-eco.png')} alt={stay.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                                        <span className="text-white font-black text-xl leading-tight drop-shadow-md">{stay.title}</span>
                                                        <div className="flex gap-2">
                                                            <Button variant="secondary" size="icon" className="w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 delay-75" onClick={() => setDetailedItem({ type: 'stay_reviews', data: stay })}>
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="secondary" size="icon" className="w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 delay-100" onClick={() => { setIsEditing(true); setEditData({ type: 'stays', ...stay }); }}>
                                                                <FileText className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="destructive" size="icon" className="w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0" onClick={() => handleDelete('stay', stay.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                                            <Home className="w-4 h-4 text-secondary" /> {stay.category}
                                                        </div>
                                                        <p className="text-sm text-foreground/80 font-medium italic line-clamp-2">"{stay.description}"</p>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                                        <span className="font-black text-secondary">{stay.price}/night</span>
                                                        <div className="flex items-center gap-1 text-sm font-bold">
                                                            <Award className="w-4 h-4 text-gold fill-gold" /> {stay.rating}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {activeView === 'tours' && (
                                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-muted/5">
                                        {tours.map(tour => (
                                            <div key={tour.id} className="group relative bg-white dark:bg-card rounded-[2rem] border border-border/50 shadow-soft hover:shadow-premium transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col">
                                                <div className="h-48 w-full bg-muted/30 relative overflow-hidden">
                                                    <img src={resolveImage(tour.image || 'qutub-minar.png')} alt={tour.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                                        <span className="text-white font-black text-xl leading-tight drop-shadow-md">{tour.title}</span>
                                                        <div className="flex gap-2">
                                                            <Button variant="secondary" size="icon" className="w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 delay-75" onClick={() => setDetailedItem({ type: 'stay_reviews', data: tour })}>
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="secondary" size="icon" className="w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 delay-100" onClick={() => { setIsEditing(true); setEditData({ type: 'tours', ...tour }); }}>
                                                                <FileText className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="destructive" size="icon" className="w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0" onClick={() => handleDelete('tour', tour.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                                            <div className="flex items-center gap-2"><Compass className="w-4 h-4 text-nature" /> {tour.category}</div>
                                                            <div className="text-nature">{tour.duration}</div>
                                                        </div>
                                                        <p className="text-sm text-foreground/80 font-medium italic line-clamp-2">"{tour.description}"</p>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                                        <span className="font-black text-primary">₹{tour.price}</span>
                                                        <div className="flex items-center gap-1 text-sm font-bold bg-muted/50 px-2 py-1 rounded-lg">
                                                            <MapPin className="w-4 h-4" /> {tour.location}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeView === 'applications' && (
                                    <div className="p-10 space-y-12 bg-muted/5">
                                        <div className="space-y-6">
                                            <h3 className="text-3xl font-display font-black flex items-center gap-4">
                                                <Compass className="w-8 h-8 text-nature" /> Pending Tour Experiences ({pendingTours.length})
                                            </h3>
                                            {pendingTours.length === 0 ? (
                                                <div className="p-20 text-center bg-white/50 rounded-[3rem] border border-dashed border-border/50">
                                                    <p className="font-black text-muted-foreground uppercase tracking-widest text-[10px] italic">No pending tours at the moment</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                    {pendingTours.map(tour => (
                                                        <div key={tour.id} className="group relative bg-white dark:bg-card rounded-[2.5rem] border-2 border-nature/20 shadow-soft hover:shadow-premium transition-all overflow-hidden flex flex-col">
                                                            <div className="h-48 w-full bg-muted/30 relative">
                                                                <img src={resolveImage(tour.image || 'qutub-minar.png')} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={tour.title} />
                                                                <div className="absolute top-4 left-4 px-3 py-1 bg-nature text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-glow">Pending Approval</div>
                                                            </div>
                                                            <div className="p-8 space-y-6 flex-1 flex flex-col">
                                                                <div className="space-y-2">
                                                                    <h4 className="text-2xl font-display font-black leading-tight group-hover:text-nature transition-colors">{tour.title}</h4>
                                                                    <p className="text-xs font-bold text-muted-foreground italic">By {tour.guideEmail || 'Independent Guide'}</p>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="p-4 bg-muted/30 rounded-2xl">
                                                                        <p className="text-[10px] uppercase font-black text-muted-foreground opacity-50 mb-1">Price</p>
                                                                        <p className="font-black text-lg">₹{tour.price}</p>
                                                                    </div>
                                                                    <div className="p-4 bg-muted/30 rounded-2xl">
                                                                        <p className="text-[10px] uppercase font-black text-muted-foreground opacity-50 mb-1">Location</p>
                                                                        <p className="font-black text-lg">{tour.location}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-3 pt-2">
                                                                    <Button className="flex-1 h-14 rounded-2xl bg-nature text-white font-black text-[10px] uppercase tracking-widest shadow-glow" onClick={() => approveApplication({ tourId: tour.id, email: tour.guideEmail, title: tour.title })}>
                                                                        Authorize
                                                                    </Button>
                                                                    <Button variant="outline" size="icon" className="w-14 h-14 rounded-2xl border-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-white" onClick={() => denyApplication({ tourId: tour.id, email: tour.guideEmail })}>
                                                                        <Trash2 className="w-6 h-6" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-3xl font-display font-black flex items-center gap-4">
                                                <Home className="w-8 h-8 text-secondary" /> Pending Property Listings ({pendingStays.length})
                                            </h3>
                                            {pendingStays.length === 0 ? (
                                                <div className="p-20 text-center bg-white/50 rounded-[3rem] border border-dashed border-border/50">
                                                    <p className="font-black text-muted-foreground uppercase tracking-widest text-[10px] italic">No pending properties at the moment</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                    {pendingStays.map(stay => (
                                                        <div key={stay.id} className="group relative bg-white dark:bg-card rounded-[2.5rem] border-2 border-secondary/20 shadow-soft hover:shadow-premium transition-all overflow-hidden flex flex-col">
                                                            <div className="h-48 w-full bg-muted/30 relative">
                                                                <img src={resolveImage(stay.image || 'havelock-eco.png')} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={stay.title} />
                                                                <div className="absolute top-4 left-4 px-3 py-1 bg-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-glow">Pending Review</div>
                                                            </div>
                                                            <div className="p-8 space-y-6 flex-1 flex flex-col">
                                                                <div className="space-y-2">
                                                                    <h4 className="text-2xl font-display font-black leading-tight group-hover:text-secondary transition-colors">{stay.title}</h4>
                                                                    <p className="text-xs font-bold text-muted-foreground italic">Host: {stay.host}</p>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="p-4 bg-muted/30 rounded-2xl">
                                                                        <p className="text-[10px] uppercase font-black text-muted-foreground opacity-50 mb-1">Per Night</p>
                                                                        <p className="font-black text-lg">₹{stay.price}</p>
                                                                    </div>
                                                                    <div className="p-4 bg-muted/30 rounded-2xl">
                                                                        <p className="text-[10px] uppercase font-black text-muted-foreground opacity-50 mb-1">Category</p>
                                                                        <p className="font-black text-lg">{stay.category}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-3 pt-2">
                                                                    <Button className="flex-1 h-14 rounded-2xl bg-secondary text-white font-black text-[10px] uppercase tracking-widest shadow-glow" onClick={() => approveApplication({ stayId: stay.id, email: stay.host, title: stay.title })}>
                                                                        Authorize
                                                                    </Button>
                                                                    <Button variant="outline" size="icon" className="w-14 h-14 rounded-2xl border-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-white" onClick={() => denyApplication({ stayId: stay.id, email: stay.host })}>
                                                                        <Trash2 className="w-6 h-6" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {activeView === 'support' && supportFeed.length === 0 && (
                                    <div className="p-20 text-center bg-muted/5">
                                        <p className="font-black text-muted-foreground uppercase tracking-widest text-[10px] italic">No support inquiries found.</p>
                                    </div>
                                )}
                                {activeView === 'inbox' && (
                                    <div className="p-8 space-y-4">
                                        {supportMessages.length === 0 ? (
                                            <div className="text-center py-20">
                                                <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                                <p className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">No customer messages yet</p>
                                            </div>
                                        ) : supportMessages.map((msg: any) => (
                                            <div key={msg.id} className="group flex items-start gap-6 p-8 bg-muted/20 rounded-[2rem] border border-border/40 hover:border-secondary/30 hover:shadow-soft transition-all">
                                                <div className="w-14 h-14 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary font-black text-2xl flex-shrink-0">
                                                    {msg.name?.charAt(0)?.toUpperCase() || 'G'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <div>
                                                            <h4 className="font-black text-xl group-hover:text-secondary transition-colors">{msg.name}</h4>
                                                            <p className="text-sm font-bold text-muted-foreground">{msg.email}</p>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-muted-foreground/60 shrink-0">
                                                            {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent'}
                                                        </span>
                                                    </div>
                                                    <p className="text-secondary font-bold text-sm mb-1">{msg.subject}</p>
                                                    <p className="text-muted-foreground font-medium leading-relaxed line-clamp-2">{msg.message}</p>
                                                </div>
                                                <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}>
                                                    <Button size="sm" className="rounded-xl h-10 px-4 bg-secondary text-white font-bold text-xs flex-shrink-0">Reply</Button>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Platform Activity Modal (Standard) */}
            {selectedActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-fade-in">
                    <div className="bg-white dark:bg-card p-16 rounded-[4rem] w-full max-w-3xl shadow-premium border-4 border-secondary/20 animate-scale-in relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-tricolor" />

                        <div className="space-y-12">
                            <div className="flex items-start justify-between">
                                <div className="space-y-4">
                                    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-soft ${selectedActivity.type === 'Support' ? 'bg-nature/10 text-nature' : 'bg-secondary/10 text-secondary'
                                        }`}>
                                        <AlertCircle className="w-4 h-4" /> {selectedActivity.type} Action Required
                                    </div>
                                    <h3 className="text-5xl font-display font-black tracking-tight leading-tight">{selectedActivity.title}</h3>
                                    <p className="text-lg text-muted-foreground font-bold italic font-sans flex items-center gap-3">
                                        <Mail className="w-5 h-5" /> {selectedActivity.email || selectedActivity.user}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedActivity(null)} className="p-4 bg-muted/50 rounded-3xl hover:bg-muted transition-all text-muted-foreground hover:rotate-90">
                                    <X className="w-8 h-8" />
                                </button>
                            </div>

                            <div className="bg-muted/30 p-12 rounded-[3.5rem] border-2 border-border/50 relative overflow-hidden group shadow-inner">
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-all" />
                                <span className="relative z-10 text-2xl font-medium leading-relaxed italic text-muted-foreground block font-sans">
                                    "{selectedActivity.details}"
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <Button variant="outline" className="h-20 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.2em] border-2 border-muted-foreground/20 hover:bg-destructive hover:text-white hover:border-destructive transition-all" onClick={() => denyApplication(selectedActivity)}>
                                    <Trash2 className="w-6 h-6 mr-3" /> {t('discard')}
                                </Button>
                                <Button className={`h-20 rounded-[2.5rem] text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-glow flex items-center justify-center gap-4 hover:scale-105 transition-all ${selectedActivity.type === 'Support' ? 'bg-nature' : 'bg-secondary'
                                    }`} onClick={() => approveApplication(selectedActivity)}>
                                    <CheckCircle2 className="w-7 h-7" /> {selectedActivity.type === 'Support' ? t('approve') : t('authorize')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Deep Detail Modal (Cross-linking) */}
            {detailedItem && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 animate-fade-in">
                    <div className="bg-white dark:bg-card p-16 rounded-[4rem] w-full max-w-4xl shadow-premium border-4 border-primary/20 animate-scale-in relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-3 bg-primary" />

                        <div className="space-y-12">
                            <div className="flex items-start justify-between">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary">
                                        <TrendingUp className="w-4 h-4" /> {t('comprehensiveInsight')}
                                    </div>
                                    <h3 className="text-5xl font-display font-black tracking-tight leading-tight">
                                        {detailedItem.type === 'user_activity' ? `${detailedItem.data.user}'s ${t('timeline')}` : `Reviews for ${detailedItem.data.name}`}
                                    </h3>
                                </div>
                                <button onClick={() => setDetailedItem(null)} className="p-4 bg-muted/50 rounded-3xl hover:bg-muted transition-all">
                                    <X className="w-8 h-8" />
                                </button>
                            </div>

                            <div className="max-h-[50vh] overflow-y-auto pr-6 space-y-6">
                                {detailedItem.type === 'user_activity' ? (
                                    <>
                                        {bookings.filter(b => b.userEmail === detailedItem.data.email).map(b => (
                                            <div key={b.id} className="p-8 bg-muted/20 rounded-[2.5rem] border border-border/50 flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-soft">
                                                        <Ticket className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-xl">{b.entity} (Booking)</h4>
                                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-sans">{b.date}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-2xl text-nature">{b.amount}</p>
                                                    <p className="text-[10px] font-black uppercase text-gold">{b.status}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {tours.filter(t => t.guideEmail === detailedItem.data.email).map(t => (
                                            <div key={`tour_${t.id}`} className="p-8 bg-nature/5 rounded-[2.5rem] border border-nature/20 flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-nature/20 flex items-center justify-center shadow-soft text-nature">
                                                        <Compass className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-xl">{t.title} (Tour Host)</h4>
                                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-sans">{t.location} - {t.category}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-2xl text-nature">Live</p>
                                                </div>
                                            </div>
                                        ))}
                                        {stays.filter(s => s.host === detailedItem.data.email).map(s => (
                                            <div key={`stay_${s.id}`} className="p-8 bg-secondary/5 rounded-[2.5rem] border border-secondary/20 flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center shadow-soft text-secondary">
                                                        <Home className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-xl">{s.title} (Property Host)</h4>
                                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-sans">{s.location} - {s.category}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-2xl text-secondary">Live</p>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    reviews.filter(r => r.target === detailedItem.data.name).map(r => (
                                        <div key={r.id} className="p-8 bg-muted/20 rounded-[2.5rem] border border-border/50 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{r.user?.[0] || 'U'}</div>
                                                    <div>
                                                        <h4 className="font-black text-lg">{r.user}</h4>
                                                        <div className="flex gap-1">
                                                            {[...Array(r.rating)].map((_, i) => <Award key={i} className="w-3 h-3 fill-gold text-gold" />)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold text-muted-foreground uppercase opacity-60 font-sans">{r.date}</span>
                                            </div>
                                            <p className="text-lg font-medium italic text-foreground/80 font-sans">"{r.comment}"</p>
                                        </div>
                                    ))
                                )}
                                {(detailedItem.type === 'user_activity' && bookings.filter(b => b.userEmail === detailedItem.data.email).length === 0 && tours.filter(t => t.guideEmail === detailedItem.data.email).length === 0 && stays.filter(s => s.host === detailedItem.data.email).length === 0) && (
                                    <p className="text-center py-10 font-black text-muted-foreground uppercase tracking-widest text-xs">No activity found for this user.</p>
                                )}
                            </div>

                            <Button className="w-full h-18 rounded-2xl bg-foreground text-background font-black text-[10px] uppercase tracking-widest py-8" onClick={() => setDetailedItem(null)}>
                                {t("closeView")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* CRUD Edit/Create Modal */}
            {isEditing && editData && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-fade-in">
                    <div className="bg-white dark:bg-card p-12 rounded-[3rem] w-full max-w-2xl shadow-premium border-2 border-border relative overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-4xl font-display font-black capitalize">{editData.isNew ? 'Create New' : 'Edit'} {editData.type.replace(/s$/, '')}</h3>
                            <button onClick={() => { setIsEditing(false); setEditData(null); }} className="p-3 bg-muted rounded-full hover:bg-destructive/10 hover:text-destructive transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            {editData.type === 'tourists' && (
                                <>
                                    <div><label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Name</label><input type="text" className="w-full mt-2 h-14 rounded-2xl bg-muted/30 border border-border px-6 font-medium" defaultValue={editData.fullName || editData.name} onChange={e => setEditData({...editData, name: e.target.value})} /></div>
                                    <div><label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Email</label><input type="email" className="w-full mt-2 h-14 rounded-2xl bg-muted/30 border border-border px-6 font-medium" defaultValue={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} /></div>
                                    <div><label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Role</label>
                                        <select className="w-full mt-2 h-14 rounded-2xl bg-muted/30 border border-border px-6 font-medium" defaultValue={editData.role || 'USER'} onChange={e => setEditData({...editData, role: e.target.value})}>
                                            <option value="USER">USER</option>
                                            <option value="GUIDE">GUIDE</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            {editData.type === 'stays' && (
                                <>
                                    <div><label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Title</label><input type="text" className="w-full mt-2 h-14 rounded-2xl bg-muted/30 border border-border px-6 font-medium" defaultValue={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Location</label><input type="text" className="w-full mt-2 h-14 rounded-2xl bg-muted/30 border border-border px-6 font-medium" defaultValue={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} /></div>
                                        <div><label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Price (₹)</label><input type="number" className="w-full mt-2 h-14 rounded-2xl bg-muted/30 border border-border px-6 font-medium" defaultValue={editData.price} onChange={e => setEditData({...editData, price: e.target.value})} /></div>
                                    </div>
                                    <div><label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Host Email</label><input type="email" className="w-full mt-2 h-14 rounded-2xl bg-muted/30 border border-border px-6 font-medium" defaultValue={editData.host} onChange={e => setEditData({...editData, host: e.target.value})} /></div>
                                </>
                            )}
                            {editData.type === 'tours' && (
                                <>
                                    <div><label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Title</label><input type="text" className="w-full mt-2 h-14 rounded-2xl bg-muted/30 border border-border px-6 font-medium" defaultValue={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Location</label><input type="text" className="w-full mt-2 h-14 rounded-2xl bg-muted/30 border border-border px-6 font-medium" defaultValue={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} /></div>
                                        <div><label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Price (₹)</label><input type="number" className="w-full mt-2 h-14 rounded-2xl bg-muted/30 border border-border px-6 font-medium" defaultValue={editData.price} onChange={e => setEditData({...editData, price: e.target.value})} /></div>
                                    </div>
                                    <div><label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Guide Email</label><input type="email" className="w-full mt-2 h-14 rounded-2xl bg-muted/30 border border-border px-6 font-medium" defaultValue={editData.guideEmail} onChange={e => setEditData({...editData, guideEmail: e.target.value})} /></div>
                                </>
                            )}
                            <div className="pt-6">
                                <Button className="w-full h-16 rounded-2xl bg-foreground text-background font-black text-[12px] uppercase tracking-widest shadow-glow" onClick={async () => {
                                    try {
                                        const endpoint = editData.type === 'tourists' ? '/api/users' : editData.type === 'stays' ? '/api/homestays' : '/api/attractions';
                                        if (editData.isNew) {
                                            const payload = { ...editData, approved: true }; // Admin bypasses approval queue
                                            await apiClient.post(endpoint, payload);
                                            toast({ title: "Created", description: `Successfully created new ${editData.type.replace(/s$/, '')}` });
                                        } else {
                                            const updateEndpoint = editData.type === 'tourists' ? `/api/users/${editData.email}` : `${endpoint}/${editData.id}`;
                                            await apiClient.put(updateEndpoint, editData);
                                            toast({ title: "Updated", description: `Successfully updated ${editData.type.replace(/s$/, '')}` });
                                        }
                                        setIsEditing(false);
                                        setEditData(null);
                                        // Need to trigger a refresh here ideally, but toast is enough for demo
                                    } catch (err: any) {
                                        toast({ title: "Error", description: err.message, variant: "destructive" });
                                    }
                                }}>
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
