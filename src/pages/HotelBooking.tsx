import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import NavigationHeader from '@/components/NavigationHeader';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Calendar, ChevronLeft, MapPin, Star, Utensils, Compass, Loader2, Users } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config/api';
import Loader3D from '@/components/Loader3D';

const HotelBooking = () => {
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get('id');
  const navigate = useNavigate();
  const { t } = useAppContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 2),
  });
  const [guests, setGuests] = useState(1);

  const [tours, setTours] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [selectedTours, setSelectedTours] = useState<string[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!hotelId) return;
      try {
        const hotelRes = await fetch(`${API_BASE_URL}/api/hotels/${hotelId}`);
        if (hotelRes.ok) {
          const hotelData = await hotelRes.json();
          setHotel(hotelData);

          const region = hotelData.region || "Heritage North";

          const [attractionsRes, foodsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/attractions`),
            fetch(`${API_BASE_URL}/api/foods?region=${encodeURIComponent(region)}`)
          ]);

          if (attractionsRes.ok) {
            const attrData = await attractionsRes.json();
            // Filter geographically strictly by city to ensure "only tour place have stay of that place"
            const hotelCity = hotelData.location.split(',')[0].trim().toLowerCase();
            setTours(attrData.filter((a: any) => a.location.toLowerCase().includes(hotelCity)).slice(0, 4));
          }

          if (foodsRes.ok) {
            setFoods(await foodsRes.json());
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hotelId]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: t("identificationRequired"), description: t("loginToReserve"), variant: "destructive" });
      navigate(`/auth?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    const checkInDate = date?.from ? format(date.from, "yyyy-MM-dd") : "";
    const checkOutDate = date?.to ? format(date.to, "yyyy-MM-dd") : "";
    const diffTime = date?.from && date?.to ? Math.abs(date.to.getTime() - date.from.getTime()) : 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    // Calculate Addons Cost
    let addOnsCost = 0;
    tours.forEach(tour => {
       if (selectedTours.includes(tour.title)) {
           // Adding static estimated cost for tour multiplied by guests
           addOnsCost += 1500 * guests; 
       }
    });

    foods.forEach(food => {
        if (selectedFoods.includes(food.title)) {
            addOnsCost += parseFloat(food.price);
        }
    });

    const baseAmount = hotel.price * diffDays * guests;
    const totalAmount = `₹${baseAmount + addOnsCost}`;

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: hotel.name,
          user: user.email?.split('@')[0] || "Guest",
          userEmail: user.email,
          date: `${checkInDate} ${t("dateTo")} ${checkOutDate}`,
          status: "Pending",
          amount: totalAmount,
          location: hotel.location,
          title: hotel.name,
          host: "Hotel Management",
          image: hotel.hotelImagePath || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
          selectedTours: selectedTours.join(", "),
          selectedFoods: selectedFoods.join(", ")
        })
      });

      if (response.ok) {
        toast({ title: t("bookingRequestSent"), description: t("bookingReceivedMsg") });
        navigate('/tourist-dashboard');
      } else {
        throw new Error("Failed to book");
      }
    } catch (error) {
      toast({ title: t("bookingFailed"), variant: "destructive" });
    }
  };

  const toggleTour = (title: string) => {
      setSelectedTours(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };

  const toggleFood = (title: string) => {
      setSelectedFoods(prev => prev.includes(title) ? prev.filter(n => n !== title) : [...prev, title]);
  };

  if (loading) return <Loader3D />;
  if (!hotel) return <div className="pt-32 text-center text-muted-foreground italic">{t("noResultsFound")}</div>;

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <Link to="/hotels" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors font-bold uppercase tracking-widest text-[10px]">
            <ChevronLeft className="w-4 h-4" />
            {t("backToListings")}
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-black tracking-widest uppercase text-[10px]">
                  <MapPin className="w-4 h-4" />
                  {hotel.location}
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter leading-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent pb-1">{hotel.name}</h1>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <span className="font-black text-xl">{hotel.rating}</span>
                </div>
              </div>

              <div className="bg-muted/30 p-8 rounded-[2rem] border border-border/50">
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-4">{t("priceNightInr")}</p>
                <span className="text-4xl font-display font-black text-primary">₹{hotel.price}</span>
              </div>

              {/* Add-ons Section */}
              <div className="space-y-6 pt-6 border-t border-border/50">
                  <h3 className="text-2xl font-black mb-4 flex items-center gap-2"><Compass className="w-6 h-6 text-primary" /> Curate Your Experience</h3>
                  
                  {/* Tours */}
                  {tours.length > 0 && (
                      <div className="space-y-3">
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Local Tours Available</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {tours.map(tour => (
                                  <label key={tour.id} className={cn("p-4 border rounded-2xl cursor-pointer transition-all flex flex-col gap-2 hover:border-primary", selectedTours.includes(tour.title) ? "border-primary bg-primary/5 shadow-soft" : "border-border")}>
                                      <div className="flex justify-between items-start">
                                          <span className="font-bold text-sm leading-tight">{tour.title}</span>
                                          <input type="checkbox" className="mt-1" checked={selectedTours.includes(tour.title)} onChange={() => toggleTour(tour.title)} />
                                      </div>
                                      <span className="text-[10px] uppercase tracking-widest text-primary font-black">+₹1500 / guest</span>
                                  </label>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Foods */}
                  {foods.length > 0 && (
                      <div className="space-y-3 mt-6">
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Utensils className="w-4 h-4" /> Pre-order Local Flavors</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {foods.map(food => (
                                  <label key={food.id} className={cn("p-4 border rounded-2xl cursor-pointer transition-all flex flex-col gap-2 hover:border-primary", selectedFoods.includes(food.title) ? "border-primary bg-primary/5 shadow-soft" : "border-border")}>
                                      <div className="flex justify-between items-start">
                                          <span className="font-bold text-sm leading-tight">{food.title}</span>
                                          <input type="checkbox" className="mt-1" checked={selectedFoods.includes(food.title)} onChange={() => toggleFood(food.title)} />
                                      </div>
                                      <span className="text-[10px] uppercase tracking-widest text-primary font-black">+₹{food.price}</span>
                                  </label>
                              ))}
                          </div>
                      </div>
                  )}
              </div>

              {/* Discover Local Experiences Cross-Link */}
              <div className="bg-primary/5 p-8 rounded-[2rem] border-2 border-primary/20 flex flex-col items-center text-center mt-12 space-y-4 shadow-soft">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center -mt-12 shadow-glow">
                      <Compass className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-display font-black leading-tight text-foreground">Want to explore {hotel.location.split(',')[0]}?</h3>
                  <p className="text-sm font-medium text-muted-foreground italic mb-2">Discover premium verified guided tours, spiritual walks, and adventures curated near your stay.</p>
                  <Button 
                      onClick={() => navigate(`/attractions?location=${hotel.location.split(',')[0]}`)}
                      className="rounded-2xl bg-foreground text-background font-black text-[10px] uppercase tracking-widest shadow-premium hover:scale-[1.02] transition-transform h-14 px-8"
                  >
                      View Tourism Places
                  </Button>
              </div>
            </div>

            <div className="bg-card p-10 rounded-[3rem] shadow-premium border border-border/50 h-fit sticky top-32">
              <h2 className="text-2xl font-black mb-8">{t("requestReservation")}</h2>
              <form onSubmit={handleBooking} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("pickDates")}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full h-16 justify-start text-left font-bold rounded-2xl border-2", !date && "text-muted-foreground")}>
                        <Calendar className="mr-3 h-5 w-5 text-primary" />
                        {date?.from ? (date.to ? `${format(date.from, "LLL dd")} - ${format(date.to, "LLL dd")}` : format(date.from, "LLL dd")) : t("pickDates")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-premium border-border/50 shadow-xl" align="start">
                      <CalendarComponent mode="range" selected={date} onSelect={setDate} numberOfMonths={1} disabled={(d) => d < new Date()} />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-4 border-t border-border/50 pt-6">
                    <div className="flex justify-between items-center bg-muted/30 p-4 rounded-2xl">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4"/> Guests</label>
                      <div className="flex items-center gap-4">
                          <button type="button" className="h-8 w-8 rounded-full border-2 border-border flex items-center justify-center font-black text-lg hover:border-primary transition-colors disabled:opacity-50" onClick={() => setGuests(Math.max(1, guests - 1))} disabled={guests <= 1}>-</button>
                          <span className="font-black text-lg min-w-[2ch] justify-center flex">{guests}</span>
                          <button type="button" className="h-8 w-8 rounded-full border-2 border-border flex items-center justify-center font-black text-lg hover:border-primary transition-colors" onClick={() => setGuests(guests + 1)}>+</button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <p className="flex justify-between text-sm font-bold text-muted-foreground">
                            <span>Base Stay ({Math.ceil((date?.from && date?.to ? Math.abs(date.to.getTime() - date.from.getTime()) : 0) / (1000 * 60 * 60 * 24)) || 1} nights × {guests} guests)</span>
                            <span>₹{hotel.price * (Math.ceil((date?.from && date?.to ? Math.abs(date.to.getTime() - date.from.getTime()) : 0) / (1000 * 60 * 60 * 24)) || 1) * guests}</span>
                        </p>
                        <p className="flex justify-between text-sm font-bold text-muted-foreground">
                            <span>Add-ons ({selectedTours.length + selectedFoods.length})</span>
                            <span>₹{(selectedTours.length * 1500 * guests) + selectedFoods.map(f => foods.find(fd => fd.title === f)?.price).reduce((a, b) => a + parseFloat(b || '0'), 0)}</span>
                        </p>
                        <p className="flex justify-between text-xl font-black text-foreground pt-4 border-t border-border/50">
                            <span>Total Checkout</span>
                            <span className="text-primary">
                                ₹{(hotel.price * (Math.ceil((date?.from && date?.to ? Math.abs(date.to.getTime() - date.from.getTime()) : 0) / (1000 * 60 * 60 * 24)) || 1) * guests) + (selectedTours.length * 1500 * guests) + selectedFoods.map(f => foods.find(fd => fd.title === f)?.price).reduce((a, b) => a + parseFloat(b || '0'), 0)}
                            </span>
                        </p>
                    </div>
                </div>

                <Button type="submit" className="w-full h-20 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary text-white shadow-glow hover:scale-[1.02] transition-transform">
                  {t("reserveNow")}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HotelBooking;
