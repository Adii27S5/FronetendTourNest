import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import NavigationHeader from '@/components/NavigationHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { Heart, Star, MapPin, Users, Wifi, ChevronLeft, Calendar, Sparkles, Clock, Utensils, Compass } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { resolveImage } from '@/lib/image-mapper';
import apiClient from '@/config/axios';
import { toast } from 'sonner';
import Loader3D from '@/components/Loader3D';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, addFavorite, removeFavorite, t } = useAppContext();
  const { user } = useAuth();
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 3),
  });
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHotel = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/hotels/${id}`);
      if (response.data) {
        const hotelData = response.data;
        
        // Fetch nearby attractions based on location (city)
        const city = hotelData.location.split(',')[0].trim();
        const [attractionsRes, foodsRes] = await Promise.all([
          apiClient.get(`/api/attractions`),
          apiClient.get(`/api/foods`)
        ]);
        
        setHotel({
          ...hotelData,
          nearbyAttractions: (attractionsRes.data || []).filter((a: any) => a.location?.toLowerCase().includes(city.toLowerCase())),
          nearbyFoods: (foodsRes.data || []).filter((f: any) => f.location?.toLowerCase().includes(city.toLowerCase()))
        });
      } else {
        toast.error("Could not find this hotel.");
      }
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      toast.error(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotel();
  }, [id]);

  if (loading) return <Loader3D />;
  if (!hotel) return <div className="pt-32 text-center text-muted-foreground italic">{t("noResultsFound")}</div>;

  const favorite = isFavorite(hotel.id);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (favorite) {
      removeFavorite(hotel.id);
      toast.info(t("removedFromFavorites"));
    } else {
      addFavorite(hotel);
      toast.success(t("addedToFavorites"));
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t("loginToReserve"));
      navigate('/auth');
      return;
    }

    const checkInDate = date?.from ? format(date.from, "yyyy-MM-dd") : "";
    const checkOutDate = date?.to ? format(date.to, "yyyy-MM-dd") : "";
    const diffDays = date?.from && date?.to ? Math.ceil(Math.abs(date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24)) : 1;
    const totalAmount = `₹${hotel.price * diffDays}`;

    try {
      const response = await apiClient.post(`/api/bookings`, {
          entity: hotel.name,
          user: user.email?.split('@')[0] || "Guest",
          userEmail: user.email,
          date: `${checkInDate} ${t("dateTo")} ${checkOutDate}`,
          status: "Pending",
          amount: totalAmount,
          image: hotel.image,
          location: hotel.location,
          title: hotel.name,
          host: "Premium Hotel Management",
          guestsCount: guests
      });

      if (response.data) {
        toast.success(t("bookingRequestSent"));
        navigate('/tourist-dashboard');
      }
    } catch (error) {
      toast.error(t("bookingFailed"));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <Link to="/hotels" className="inline-flex items-center gap-2 text-muted-foreground hover:text-secondary mb-8 transition-colors font-bold uppercase tracking-widest text-[10px]">
            <ChevronLeft className="w-4 h-4" />
            {t("backToListings")}
          </Link>

          <div className="relative h-[40vh] md:h-[60vh] rounded-[3rem] overflow-hidden shadow-premium mb-12 border border-border/50 group">
            <img src={resolveImage(hotel.image)} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <Button variant="outline" size="icon" className="absolute top-6 right-6 bg-white/20 backdrop-blur-md border-white/30 rounded-2xl hover:bg-white/40 shadow-xl transition-all" onClick={handleFavoriteToggle}>
              <Heart className={`w-5 h-5 ${favorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-secondary font-black tracking-widest uppercase text-[10px]">
                  <MapPin className="w-4 h-4" />
                  {hotel.location}
                </div>
                <h1 className="text-4xl md:text-7xl font-display font-black tracking-tighter leading-none">{hotel.name}</h1>
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-1.5 bg-secondary/5 px-4 py-2 rounded-2xl font-black text-xl">
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    {hotel.rating}
                  </div>
                  <Badge variant="outline" className="border-secondary/30 text-secondary px-4 py-2 font-black rounded-xl uppercase tracking-widest text-[10px] bg-secondary/5">Verified Premium Hotel</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: Users, label: `Up to ${hotel.hotelCapacityLimit} guests`, sub: "Max Capacity" },
                  { icon: Wifi, label: "Premium WiFi", sub: "Connected" },
                  { icon: Star, label: "5-Star Rating", sub: "Quality Guaranteed" },
                  { icon: Calendar, label: hotel.bestSeason || "Year-round", sub: "Best Time" }
                ].map((item, i) => (
                  <div key={i} className="p-8 bg-card rounded-[2.5rem] border border-border/50 shadow-soft text-center space-y-3 group hover:shadow-premium transition-all">
                    <item.icon className="w-8 h-8 mx-auto text-secondary group-hover:scale-110 transition-transform" />
                    <div className="font-black text-sm text-foreground">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50">{item.sub}</div>
                  </div>
                ))}
              </div>

              {/* Local Discovery: Nearby Tours & Food */}
              <div className="space-y-16 pt-16 border-t border-border/50">
                <div className="space-y-10">
                  <div className="space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-widest">
                      <Sparkles className="w-3 h-3" /> {t("localExperiences")}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight">Explore nearby in {hotel.location.split(',')[0]}</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {hotel.nearbyAttractions && hotel.nearbyAttractions.map((attr: any) => (
                      <div key={attr.id} onClick={() => navigate(`/attraction/${attr.id}`)} className="group cursor-pointer bg-white dark:bg-card rounded-[2.5rem] overflow-hidden shadow-soft hover:shadow-premium transition-all border border-border/30">
                        <div className="h-48 overflow-hidden relative">
                          <img src={resolveImage(attr.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={attr.title} />
                          <Badge className="absolute top-4 left-4 bg-secondary text-white font-black uppercase tracking-widest text-[8px] border-0">{attr.category}</Badge>
                        </div>
                        <div className="p-8 space-y-3">
                          <h3 className="text-2xl font-display font-black leading-tight group-hover:text-secondary transition-colors line-clamp-1">{attr.title}</h3>
                          <div className="flex items-center gap-6 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-secondary" /> {attr.duration}</div>
                            <div className="flex items-center gap-2"><Star className="w-4 h-4 fill-gold text-gold border-0" /> {attr.rating}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {hotel.nearbyFoods && hotel.nearbyFoods.length > 0 && (
                  <div className="space-y-10 pt-10 border-t border-border/50">
                    <div className="space-y-2">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-widest">
                          <Utensils className="w-3 h-3" /> {t("localFlavors")}
                       </div>
                       <h3 className="text-3xl font-display font-black">{t("culinaryExperiences")}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {hotel.nearbyFoods.map((food: any) => (
                        <div key={food.id} className="flex items-center gap-6 p-6 bg-muted/20 rounded-[2.5rem] border border-border/30 hover:bg-white hover:shadow-premium transition-all cursor-default">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                            <img src={resolveImage(food.image)} className="w-full h-full object-cover" alt={food.title} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xl font-display font-black">{food.title}</h4>
                            <p className="text-xs text-muted-foreground italic">"{food.description}"</p>
                            <p className="text-sm font-black text-secondary pt-2">₹{food.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card rounded-[3rem] p-10 shadow-premium sticky top-32 border border-border/50">
                <div className="space-y-8">
                  <div className="pb-8 border-b border-border/50">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-4">{t("priceNightInr")}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-display font-black text-secondary">₹{hotel.price}</span>
                      <span className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">{t("perNight")}</span>
                    </div>
                  </div>

                  <form onSubmit={handleBooking} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("pickDates")}</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full h-16 justify-start text-left font-bold rounded-2xl border-2 border-muted bg-muted/10 hover:bg-muted/20 transition-all", !date && "text-muted-foreground")}>
                            <Calendar className="mr-3 h-5 w-5 text-secondary" />
                            {date?.from ? (date.to ? `${format(date.from, "LLL dd")} - ${format(date.to, "LLL dd")}` : format(date.from, "LLL dd")) : t("pickDates")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-premium border-border/50" align="start">
                          <CalendarComponent mode="range" selected={date} onSelect={setDate} numberOfMonths={2} disabled={(d) => d < new Date()} />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("accommodation")}</label>
                      <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full px-5 h-14 rounded-2xl border-2 border-muted bg-muted/20 focus:border-secondary outline-none font-black text-xs uppercase appearance-none">
                        {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>{num} {num === 1 ? t("guest") : t("guests")}</option>)}
                      </select>
                    </div>

                    <Button type="submit" className="w-full h-20 rounded-2xl font-black text-xs uppercase tracking-widest bg-secondary text-white shadow-glow hover:scale-[1.02] transition-transform">
                      {t("reserveNow")}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HotelDetails;
