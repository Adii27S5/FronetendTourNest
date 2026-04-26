import { useState, useEffect } from "react";
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
    const [activeView, setActiveView] = useState("overview");
    const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
    const [detailedItem, setDetailedItem] = useState<{ type: string, data: any } | null>(null);
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

    // --- Persistence Effects replaced with Fetch Effects ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, bookingsRes, staysRes, attractionsRes, supportRes] = await Promise.all([
                    apiClient.get(`/api/users`),
                    apiClient.get(`/api/bookings`),
                    apiClient.get(`/api/homestays`),
                    apiClient.get(`/api/attractions`),
                    apiClient.get(`/api/support`)
                ]);

                if (usersRes.data) {
                    setTourists(usersRes.data);
                }
                if (bookingsRes.data) {
                    setBookings(bookingsRes.data);
                }
                if (staysRes.data) {
                    setStays(staysRes.data);
                }
                if (attractionsRes.data) {
                    setTours(attractionsRes.data);
                }
                // fetch support/inbox messages
                try {
                    const suppRes = await apiClient.get(`/api/support`);
                    if (suppRes.data) setSupportMessages(suppRes.data);
                } catch {}
                if (supportRes.data) {
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

                // Fetch Pending Tours for Approval
                const pendingToursRes = await apiClient.get(`/api/attractions/pending`);
                const tourReports = (pendingToursRes.data || []).map((t: any) => ({
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

                // Fetch Pending Stays for Approval
                const pendingStaysRes = await apiClient.get(`/api/homestays/pending`);
                if (pendingStaysRes.data) {
                    setPendingStays(pendingStaysRes.data);
                }
                const stayReports = (pendingStaysRes.data || []).map((s: any) => ({
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

                setReports(prev => [
                    ...prev.filter(p => !p.tourId && !p.stayId),
                    ...tourReports,
                    ...stayReports
                ]);
            } catch (error) {
                console.error("Error fetching admin data:", error);
            }
        };

        fetchData();
    }, []);

    // Update stats when data changes
    useEffect(() => {
        setStats(prev => [
            { ...prev[0], value: stays.length.toString() },
            { ...prev[1], value: guides.length.toString() },
            { ...prev[2], value: tourists.length.toString() },
            { ...prev[3] }
        ]);
    }, [stays, guides, tourists]);


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
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/5 rounded-full border border-secondary/20">
                                <ShieldCheck className="w-4 h-4 text-secondary" />
                                <span className="text-secondary font-black uppercase tracking-[0.2em] text-[10px]">{t('masterAdminHub')}</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter text-foreground leading-none">
                                {t("adminDashboard")}
                            </h1>
                        </div>

                        <div className="flex flex-wrap bg-white dark:bg-card p-2 rounded-3xl shadow-premium border border-border/50">
                            {[
                                { id: "overview", label: t("overview"), icon: Activity },
                                { id: "tourists", label: t("touristsLabel"), icon: Users },
                                { id: "stays", label: t("staysLabel"), icon: Home },
                                { id: "tours", label: t("toursLabel"), icon: Compass },
                                { id: "bookings", label: t("bookings"), icon: Ticket },
                                { id: "inbox", label: "Inbox", icon: Mail },
                                { id: "support", label: t("supportLabel"), icon: MessageSquare },
                                { id: "reviews", label: t("reviewsLabel"), icon: ThumbsUp }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveView(tab.id)}
                                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === tab.id ? "bg-secondary text-white shadow-glow" : "text-muted-foreground hover:bg-muted/50"
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Views */}
                    <div className="animate-scale-in">
                        {activeView === 'overview' && (
                            <div className="space-y-12">
                                <div className="grid lg:grid-cols-4 gap-6">
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
                                    <div className="relative w-full sm:w-[400px]">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input type="text" placeholder={`${t('search')} in ${activeView}...`} className="w-full pl-16 h-16 rounded-3xl bg-white border-2 border-transparent focus:border-secondary transition-all outline-none font-bold shadow-soft" />
                                    </div>
                                </div>
                                {['tourists', 'bookings', 'reviews', 'support', 'inbox'].includes(activeView) && (
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
                                            {activeView === 'tourists' && tourists.map(tourist => (
                                                <tr key={tourist.id} className="hover:bg-muted/5 transition-colors group">
                                                    <td className="p-10">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary font-display font-black text-2xl border-2 border-primary/20">
                                                                {tourist.name?.[0] || 'U'}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="font-black text-2xl group-hover:text-secondary transition-colors">{tourist.name}</div>
                                                                <div className="text-sm font-bold text-muted-foreground opacity-70 italic">{tourist.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-10">                                                         
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center gap-4 text-sm font-black text-muted-foreground">                                                             
                                                                <div className="px-3 py-1 bg-muted/50 rounded-lg">{t('joinedLabel')}: {tourist.joined || '—'}</div>
                                                                <div className={`px-3 py-1 rounded-lg ${tourist.role === 'ADMIN' ? 'bg-secondary/20 text-secondary' : tourist.role === 'GUIDE' ? 'bg-nature/20 text-nature' : 'bg-primary/20 text-primary'}`}>Role: {tourist.role || 'USER'}</div>
                                                            </div>
                                                            <div className="text-xs font-bold text-muted-foreground/80">
                                                                Tours Posted: {tours.filter(t => t.guideEmail === tourist.email).length} | Foods Posted: 0
                                                            </div>
                                                            <Button variant="ghost" className="w-fit mt-2 px-3 py-1 bg-secondary/10 text-secondary rounded-lg italic hover:bg-secondary/20" onClick={() => setDetailedItem({ type: 'user_activity', data: { user: tourist.name, email: tourist.email } })}>
                                                                View Activity <ArrowUpRight className="w-3 h-3 ml-2" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                    <td className="p-10 text-center">
                                                        <Button variant="ghost" className="w-14 h-14 rounded-2xl text-destructive hover:bg-destructive/10" onClick={() => handleDelete('tourist', tourist.id)}>
                                                            <Trash2 className="w-7 h-7" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}

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
                                
                                {/* New CSS Grid Layout for Stays and Tours */}
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
        </div>
    );
};

export default AdminDashboard;
