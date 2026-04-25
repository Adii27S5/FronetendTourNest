import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import NavigationHeader from '@/components/NavigationHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { Heart, Star as StarIcon, MapPin, Users, Wifi, ChevronLeft, Calendar, Sparkles, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';
import { resolveImage } from '@/lib/image-mapper';
import apiClient from '@/config/axios';
import { toast } from 'sonner';

import { API_BASE_URL } from '@/config/api';
import Loader3D from '@/components/Loader3D';
// India Optimized Assets
import manaliSnow from '@/assets/manali-snow.jpg';
import keralaHouseboat from '@/assets/kerala-houseboat.jpg';
import jaipurHaveli from '@/assets/jaipur-haveli.jpg';
import goaBeach from '@/assets/goa-beach.jpg';
import varanasiGhats from '@/assets/varanasi-ghats.jpg';
import munnarTea from '@/assets/munnar-tea.jpg';

const HomestayDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, addFavorite, removeFavorite, t } = useAppContext();
  const { user } = useAuth();
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 3),
  });
  const [homestay, setHomestay] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  const fetchHomestay = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/homestays/${id}`);
      if (response.data) {
        const homestayData = response.data;
        
        // Fetch nearby attractions based on location (city)
        const city = homestayData.location.split(',')[0].trim();
        const attractionsRes = await apiClient.get(`/api/attractions`);
        
        setHomestay({
          ...homestayData,
          nearbyAttractions: (attractionsRes.data || []).filter((a: any) => a.location?.toLowerCase().includes(city.toLowerCase()))
        });
      } else {
        toast.error("Could not find this homestay in the database.");
      }
    } catch (error) {
      console.error("Error fetching homestay details:", error);
      toast.error(t("serverError") || "Network issue connecting to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomestay();
  }, [id]);

  if (loading) {
    return <Loader3D />;
  }

  if (!homestay) {
    return (
      <div className="pt-32 text-center text-muted-foreground font-sans font-medium italic">
        {t("homestayNotFound")} <Link to="/homestays" className="text-secondary underline decoration-secondary/30">{t("backToListings")}</Link>
      </div>
    );
  }

  const favorite = isFavorite(homestay.id);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (favorite) {
      removeFavorite(homestay.id);
      toast.info(t("removedFromFavorites"));
    } else {
      addFavorite(homestay);
      toast.success(t("addedToFavorites"));
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Booking attempt detected...");

    if (!user) {
      toast.error(`${t("identificationRequired")} - ${t("loginToReserve")}`);
      navigate(`/auth?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    const userName = localStorage.getItem('user_name') || user.email?.split('@')[0] || "Explorer";
    const userEmail = user.email;
    const checkInDate = date?.from ? format(date.from, "yyyy-MM-dd") : "";
    const checkOutDate = date?.to ? format(date.to, "yyyy-MM-dd") : "";
    const diffTime = date?.from && date?.to ? Math.abs(date.to.getTime() - date.from.getTime()) : 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const totalAmountValue = homestay.price * diffDays;
    const totalAmount = `₹${totalAmountValue}`;
    const bookingDate = new Date().toLocaleDateString();

    try {
      const response = await apiClient.post(`/api/bookings`, {
          entity: homestay.title,
          user: userName,
          userEmail: userEmail,
          date: `${checkInDate} ${t("dateTo")} ${checkOutDate}`,
          status: "Pending",
          amount: totalAmount,
          image: homestay.image,
          location: homestay.location,
          title: homestay.title,
          host: homestay.host,
          homestayId: homestay.id,
          startISO: checkInDate ? `${checkInDate}T14:00:00Z` : null,
          guestsCount: guests
      });

      if (response.data) {
        toast.success(t("bookingRequestSent"));
        setTimeout(() => navigate('/tourist-dashboard'), 1500);
      }
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error(t("bookingFailed"));
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-secondary/20">
      <NavigationHeader />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <Link to="/homestays" className="inline-flex items-center gap-2 text-muted-foreground hover:text-secondary mb-8 transition-colors font-bold uppercase tracking-widest text-[10px]">
            <ChevronLeft className="w-4 h-4" />
            {t("backToListings")}
          </Link>

          <div className="relative h-[40vh] md:h-[60vh] rounded-[3rem] overflow-hidden shadow-premium mb-12 border border-border/50 group">
            <img
              src={resolveImage(homestay.image)}
              alt={homestay.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <Button
              variant="outline"
              size="icon"
              className="absolute top-6 right-6 bg-white/20 backdrop-blur-md border-white/30 rounded-2xl hover:bg-white/40 shadow-xl transition-all"
              onClick={handleFavoriteToggle}
            >
              <Heart className={`w-5 h-5 transition-all ${favorite ? 'fill-red-500 text-red-500 scale-110' : 'text-white'}`} />
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-secondary font-black tracking-[0.2em] uppercase text-[10px]">
                  <MapPin className="w-4 h-4" />
                  <span>{homestay.location}</span>
                </div>
                  <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter leading-none">{homestay.title}</h1>
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-1.5 bg-secondary/5 px-4 py-2 rounded-2xl">
                    <StarIcon className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    <span className="font-black text-foreground text-xl">{homestay.rating}</span>
                    <span className="text-xs text-muted-foreground opacity-60">/ 5.0</span>
                  </div>
                  <Badge variant="outline" className="border-nature/30 text-nature px-4 py-2 font-black rounded-xl uppercase tracking-widest text-[10px] bg-nature/5">{t("primeHost")}</Badge>
                </div>
              </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { icon: Users, label: `${homestay.guests ?? 0} / ${homestay.maxCapacity ?? 8} ${t("guests")}`, sub: t("capacityStat") },
                    { icon: MapPin, label: `${homestay.bedrooms ?? 2} ${t("bedrooms")}`, sub: t("luxuryStat") },
                    { icon: StarIcon, label: `${homestay.bathrooms ?? 1} ${t("bathrooms")}`, sub: t("privateStat") },
                    { icon: Calendar, label: homestay.bestSeason || "Oct - March", sub: "Best Season" }
                  ].map((item, i) => (
                  <div key={i} className="p-8 bg-card rounded-[2rem] border border-border/50 shadow-soft text-center space-y-3 group hover:shadow-premium transition-all">
                    <item.icon className="w-8 h-8 mx-auto text-secondary group-hover:scale-110 transition-transform" />
                    <div className="font-black text-sm text-foreground">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50">{item.sub}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <h2 className="text-4xl font-display font-black">{t("aboutThisHome")}</h2>
                <p className="text-xl text-muted-foreground leading-relaxed italic border-l-8 border-secondary/10 pl-8">
                  "{homestay.description}"
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-secondary" /> {t("amenities")}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {['WiFi', 'Mountain View', 'Local Meals', 'Trekking Guide', 'Hot Shower', 'Garden'].map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-colors">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Added: Nearby Tours Section */}
              <div className="space-y-10 pt-20 border-t border-border/50">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" /> {t("localExperiences")}
                  </div>
                  <h2 className="text-4xl font-display font-black tracking-tight">{t("exploreNearby")}</h2>
                </div>
                
                <div className="relative overflow-hidden group py-4 -mx-4 px-4 md:-mx-8 md:px-8">
                  <div className="flex gap-8 min-w-full w-max animate-auto-scroll-x">
                    {/* Dynamic discovery logic to be added in the fetchData call */}
                    {homestay.nearbyAttractions && [...homestay.nearbyAttractions, ...homestay.nearbyAttractions].map((attr: any, index) => (
                      <div 
                        key={`${attr.id}-${index}`} 
                        onClick={() => navigate(`/attraction/${attr.id}`)}
                        className="w-[300px] shrink-0 group cursor-pointer bg-white dark:bg-card rounded-[2.5rem] overflow-hidden shadow-soft hover:shadow-premium transition-all border border-border/30 h-full"
                      >
                        <div className="h-48 overflow-hidden relative">
                          <img src={resolveImage(attr.image)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={attr.title} />
                          <Badge className="absolute top-4 left-4 bg-secondary text-white font-black uppercase tracking-widest text-[8px] border-0">{attr.category}</Badge>
                        </div>
                        <div className="p-6 space-y-2">
                          <h3 className="text-xl font-display font-black leading-tight group-hover:text-secondary transition-colors line-clamp-1">{attr.title}</h3>
                          <div className="flex items-center gap-4 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {attr.duration}</div>
                            <div className="flex items-center gap-1"><StarIcon className="w-3 h-3 fill-gold text-gold border-0" /> {attr.rating}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card rounded-[3rem] p-10 shadow-premium sticky top-32 border border-border/50 overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 rounded-full -mr-24 -mt-24 blur-3xl" />

                <div className="relative z-10 mb-10 pb-10 border-b border-border/50">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mb-4">{t("requestReservation")}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display font-black text-secondary">₹{homestay.price}</span>
                    <span className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">{t("perNight")}</span>
                  </div>
                </div>

                <form onSubmit={handleBooking} className="relative z-10 space-y-8">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">{t("durationDates")}</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                              "w-full h-16 justify-start text-left font-bold rounded-2xl border-2 border-muted bg-muted/10 hover:bg-muted/20 transition-all",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-3 h-5 w-5 text-secondary" />
                            {date?.from ? (
                              date.to ? (
                                <>
                                  {format(date.from, "LLL dd, y")} -{" "}
                                  {format(date.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(date.from, "LLL dd, y")
                              )
                            ) : (
                              <span>{t("pickDates")}</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-premium border-border/50" align="start">
                          <CalendarComponent
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                            className="bg-white dark:bg-card"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">{t("accommodation")}</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full px-5 h-14 rounded-2xl border-2 border-muted bg-muted/20 focus:border-secondary outline-none appearance-none font-black text-xs uppercase"
                    >
                      {Array.from({ length: Math.max(1, (homestay.maxCapacity || 8) - (homestay.guests || 0)) }, (_, i) => i + 1).slice(0, 8).map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? t("guest") : t("guests")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button type="submit" className="w-full h-18 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-secondary text-white shadow-glow hover:scale-[1.02] transition-transform">
                    <Calendar className="w-5 h-5 mr-3" />
                    {t("reserveNow")}
                  </Button>
                </form>

                <div className="relative z-10 mt-10 pt-10 border-t border-border/50">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center border-2 border-secondary/20 font-display font-black text-secondary text-2xl">
                      {homestay.host?.split('@')[0].charAt(0) || 'H'}
                    </div>
                    <div>
                      <div className="font-black text-sm">{t("hostedBy")} {homestay.host?.split('@')[0] || homestay.host}</div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-nature">{t("verifiedExpert")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomestayDetails;
