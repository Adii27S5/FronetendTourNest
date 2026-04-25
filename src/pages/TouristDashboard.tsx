import { useState, useEffect } from "react";
import NavigationHeader from "@/components/NavigationHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Heart, Star, Compass, Sparkles, Clock, ArrowRight, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from '@/config/api';
import apiClient from '@/config/axios';
import { useToast } from "@/hooks/use-toast";
import { resolveImage } from "@/lib/image-mapper";
import { useAppContext } from "@/contexts/AppContext";

// Mock assets
import manaliSnow from "@/assets/manali-snow.jpg";
import jaipurHaveli from "@/assets/jaipur-haveli.jpg";

const TouristDashboard = () => {
    const { t } = useAppContext();
    const [activeTab, setActiveTab] = useState("bookings");
    const { toast } = useToast();
    const navigate = useNavigate();

    const { user } = useAuth(); // Already imported, used here for filtering
    const userEmail = user?.email;

    // State with localStorage persistence
    const [bookings, setBookings] = useState<any[]>([]);

    const [favorites, setFavorites] = useState<any[]>([]);

    // Edit modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBooking, setEditingBooking] = useState<any | null>(null);
    const [editedTime, setEditedTime] = useState<string>("");

    // --- Persistence Effects replaced with Fetch Effects ---
    useEffect(() => {
        const fetchData = async () => {
            if (!userEmail) return;
            try {
                const [bookingsRes, favoritesRes] = await Promise.all([
                    apiClient.get(`/api/bookings?email=${userEmail}`),
                    apiClient.get(`/api/favorites?email=${userEmail}`)
                ]);

                if (bookingsRes.data) {
                    setBookings(bookingsRes.data);
                }
                if (favoritesRes.data) {
                    setFavorites(favoritesRes.data);
                }
            } catch (error) {
                console.error("Error fetching tourist data:", error);
            }
        };

        fetchData();
    }, [userEmail]);

    const handleSaveEdit = async () => {
        if (!editingBooking) return;
        
        try {
            // Merge the new time with the existing date (YYYY-MM-DD)
            const datePart = editingBooking.date.split(' ')[0];
            const updatedDate = `${datePart} ${editedTime}`;

            const updatedBooking = {
                ...editingBooking,
                date: updatedDate,
                startISO: `${datePart}T${editedTime}:00Z`,
            };

            const response = await apiClient.put(`/api/bookings/${editingBooking.id}`, updatedBooking);

            if (response.data) {
                toast({
                    title: "Booking Updated",
                    description: "Your preferred check-in time has been registered.",
                });
                // Refresh data
                setBookings(prev => prev.map(b => b.id === editingBooking.id ? response.data : b));
                setShowEditModal(false);
                setEditingBooking(null);
            }
        } catch (error) {
            console.error("Update failed:", error);
            toast({
                title: t('bookingFailed'),
                description: t('dbError'),
                variant: "destructive"
            });
        }
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingBooking(null);
    };

    return (
        <div className="min-h-screen bg-muted/20 selection:bg-secondary/20 font-sans">
            <NavigationHeader />
            <main className="pt-32 pb-16 px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/5 rounded-full">
                                <Sparkles className="w-4 h-4 text-secondary" />
                                <span className="text-secondary font-black uppercase tracking-[0.2em] text-[10px]">{t('explorerDashboard')}</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-foreground leading-none">
                                {t('yourIndian')} <br />
                                <span className="text-secondary italic">{t('chronicle')}</span>
                            </h1>
                        </div>
                        <div className="flex bg-white dark:bg-card p-2 rounded-2xl shadow-soft border border-border/50">
                            <button
                                onClick={() => setActiveTab("bookings")}
                                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "bookings" ? "bg-secondary text-white shadow-glow" : "text-muted-foreground hover:text-secondary"
                                    }`}
                            >
                                {t('myJourneys')}
                            </button>
                            <button
                                onClick={() => setActiveTab("favorites")}
                                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "favorites" ? "bg-secondary text-white shadow-glow" : "text-muted-foreground hover:text-secondary"
                                    }`}
                            >
                                {t('savedGems')}
                            </button>
                        </div>
                    </div>

                    {activeTab === "bookings" ? (
                        <div className="relative overflow-hidden group py-4 -mx-4 px-4 md:-mx-12 md:px-12">
                            <div className="flex gap-8 min-w-full w-max animate-auto-scroll-x">
                                {[...bookings, ...bookings].map((booking, index) => (
                                    <div key={`${booking.id}-${index}`} className="w-[350px] lg:w-[600px] shrink-0">
                                        <Card className="group overflow-hidden rounded-[3rem] border-border/50 shadow-soft hover:shadow-premium transition-all duration-500 h-full">
                                            <CardContent className="p-0 flex flex-col sm:flex-row h-full">
                                                <div className="w-full sm:w-1/2 h-64 sm:h-auto overflow-hidden relative">
                                                    <img src={resolveImage(booking.image || "munnar-tea.jpg")} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                                    <div className="absolute top-6 left-6 bg-nature/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                                                        {booking.status}
                                                    </div>
                                                </div>
                                                <div className="p-10 flex-1 flex flex-col">
                                                    <div className="flex items-center gap-2 text-secondary font-bold text-[10px] uppercase tracking-widest mb-3">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {booking.location || "India"}
                                                    </div>
                                                    <h3 className="text-3xl font-display font-black mb-4 line-clamp-1">{booking.title || booking.entity}</h3>
                                                    <div className="space-y-3 mb-8">
                                                        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                                                            <Calendar className="w-4 h-4 text-secondary" />
                                                            {booking.date}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                                                            <Clock className="w-4 h-4 text-secondary" />
                                                            {booking.time ? booking.time : '—'}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                                                            <User className="w-4 h-4 text-secondary" />
                                                            {t('hostLabel')}: {booking.host?.split('@')[0] || "Local Expert"}
                                                        </div>
                                                    </div>
                                                    <div className="mt-auto pt-6 border-t border-border/50 flex gap-4">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                const start = booking.startISO ? new Date(booking.startISO) : null;
                                                                if (!start) {
                                                                    toast({
                                                                        title: "Error",
                                                                        description: "Unable to determine booking start time.",
                                                                        variant: "destructive"
                                                                    });
                                                                    return;
                                                                }
                                                                const msRemaining = start.getTime() - Date.now();
                                                                const twelveHoursMs = 12 * 60 * 60 * 1000;
                                                                if (msRemaining <= twelveHoursMs) {
                                                                    toast({
                                                                        title: "Edit Disabled",
                                                                        description: "Edits are disabled within 12 hours of the booking start.",
                                                                        variant: "destructive"
                                                                    });
                                                                    return;
                                                                }
                                                                setEditingBooking(booking);
                                                                setEditedTime(booking.time || (booking.startISO ? booking.startISO.slice(11, 16) : '12:00'));
                                                                setShowEditModal(true);
                                                            }}
                                                            className="flex-1 rounded-2xl h-14 font-black text-xs uppercase tracking-widest border-2 hover:bg-secondary hover:border-secondary hover:text-white transition-all shadow-soft"
                                                        >
                                                            {t('editBooking')}
                                                        </Button>
                                                        <Link to={`/homestay/${booking.homestayId || String(booking.id).replace('b', '')}`} className="flex-1">
                                                            <Button className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest bg-secondary text-white shadow-glow hover:scale-105 transition-transform">
                                                                {t('viewStay')}
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="relative overflow-hidden group py-4 -mx-4 px-4 md:-mx-12 md:px-12">
                            <div className="flex gap-8 min-w-full w-max animate-auto-scroll-x">
                                {[...favorites, ...favorites].map((fav, index) => (
                                    <div key={`${fav.id}-${index}`} className="w-[300px] md:w-[400px] shrink-0">
                                        <Card className="group overflow-hidden rounded-[3rem] border-border/50 shadow-soft hover:shadow-premium transition-all h-full">
                                            <CardContent className="p-0">
                                                <div className="h-64 overflow-hidden relative">
                                                    <img src={resolveImage(fav.image)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                                    <button className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-white">
                                                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                                                    </button>
                                                </div>
                                                <div className="p-8">
                                                    <div className="flex items-center gap-2 text-secondary font-bold text-[10px] uppercase tracking-widest mb-2">
                                                        {fav.location}
                                                    </div>
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h3 className="text-2xl font-display font-black line-clamp-1">{fav.title}</h3>
                                                        <div className="flex items-center gap-1 font-black text-secondary">
                                                            <Star className="w-4 h-4 fill-current" />
                                                            {fav.rating}
                                                        </div>
                                                    </div>
                                                    <Link to={`/homestay/${fav.id}`}>
                                                        <Button className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest bg-secondary text-white shadow-glow group">
                                                            {t('bookNow')}
                                                            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Daily Inspiration */}
                    <div className="mt-24 p-12 bg-white dark:bg-card/50 rounded-[4rem] border-2 border-secondary/10 shadow-premium relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full -mr-32 -mt-32 blur-[100px]" />
                        <div className="relative z-10 grid lg:grid-cols-3 gap-16 items-center">
                            <div className="lg:col-span-2 space-y-8 text-center lg:text-left">
                                <h2 className="text-5xl font-display font-black tracking-tighter leading-none">
                                    {t('journeyDoesntEnd')}
                                </h2>
                                <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto lg:mx-0">
                                    {t('exploreGhats')}
                                </p>
                                <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                                    {[
                                        { icon: Compass, text: t('exploreTours') },
                                        { icon: Clock, text: t('quickBooking') }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 font-bold text-foreground/80">
                                            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            {item.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:col-span-1 flex justify-center">
                                <Link to="/homestays">
                                    <Button size="lg" className="h-20 px-12 rounded-[2rem] bg-secondary text-white font-black text-xl shadow-glow hover:scale-110 transition-transform flex items-center gap-4">
                                        {t('planNextAdventure')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Time Modal */}
            {showEditModal && editingBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-card p-10 rounded-[2.5rem] w-full max-w-lg shadow-premium border border-border/50 animate-scale-in relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-tricolor" />

                        <div className="space-y-6">
                            <div className="flex flex-col items-center text-center space-y-2">
                                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-2">
                                    <Clock className="w-8 h-8 text-secondary" />
                                </div>
                                <h3 className="text-3xl font-display font-black tracking-tight">{t('editCheckInTime')}</h3>
                                <p className="text-muted-foreground font-medium italic">
                                    {t('adjustingFor')} <strong>{editingBooking.title}</strong>
                                </p>
                            </div>

                            <p className="text-sm text-muted-foreground text-center bg-muted/30 p-4 rounded-2xl border border-dashed border-muted-foreground/30">
                                {t('editNote')}
                            </p>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-2">{t('selectPreferredTime')}</label>
                                <input
                                    type="time"
                                    value={editedTime}
                                    onChange={(e) => setEditedTime(e.target.value)}
                                    className="w-full h-16 px-6 rounded-2xl border-2 border-muted bg-muted/20 focus:border-secondary outline-none transition-all font-black text-xl tracking-tighter"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    className="h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-2 hover:bg-muted transition-all"
                                >
                                    {t('goBack')}
                                </Button>
                                <Button
                                    onClick={handleSaveEdit}
                                    className="h-14 rounded-2xl bg-secondary text-white font-black text-xs uppercase tracking-widest shadow-glow hover:scale-[1.02] transition-transform"
                                >
                                    {t('saveChanges')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TouristDashboard;
