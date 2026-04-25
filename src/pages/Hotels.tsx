import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import NavigationHeader from '@/components/NavigationHeader';
import HotelCard from '@/components/HotelCard';
import apiClient from '@/config/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Plus, Search, MapPin, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAppContext } from '@/contexts/AppContext';
import { motion } from 'framer-motion';

interface Hotel {
  id?: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  image?: string;
  hotelCapacityLimit?: number;
}

const Hotels: React.FC = () => {
  const { t } = useAppContext();
  const [searchParams] = useSearchParams();
  const initialLocation = searchParams.get('location') || '';
  
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [newHotel, setNewHotel] = useState<Hotel>({ name: '', location: '', price: 0, rating: 0, image: '' });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/hotels`);
      setHotels(response.data);
    } catch (e: any) {
      console.error("Could not fetch hotels:", e);
      toast.error(t("toastFetchHotelsFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    const locationParam = searchParams.get('location');
    if (locationParam) {
      setSearchQuery(locationParam);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewHotel(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'rating' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/api/hotels`, newHotel);
      
      toast.success(`${newHotel.name} ${t("toastHotelAdded")}`);
      await fetchHotels();
      setNewHotel({ name: '', location: '', price: 0, rating: 0, image: '' });
      setShowAddForm(false);
    } catch (e: any) {
      console.error("Could not add hotel:", e);
      toast.error(t("toastAddHotelFailed"));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/api/hotels/${id}`);
      toast.success(t("toastHotelRemoved"));
      await fetchHotels();
    } catch (e: any) {
      console.error("Could not delete hotel:", e);
      toast.error(t("toastDeleteHotelFailed"));
    }
  };

  const filteredHotels = hotels.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30 selection:bg-primary/20 font-sans">
      <NavigationHeader />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16 animate-slide-up">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                <Sparkles className="w-3 h-3" />
                <span>{t("premiumCollection")}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-foreground leading-none">
                {t("luxury")} <br />
                <span className="text-primary italic underline decoration-primary/30">{t("hospitalityLabel")}</span>
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 w-full md:w-auto">
              <div className="relative group flex-1 sm:w-[400px]">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder={t("searchHotels")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-20 pl-16 pr-6 rounded-[2rem] bg-white dark:bg-card border-0 shadow-premium focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg"
                />
              </div>
              {localStorage.getItem('user_role') === 'ADMIN' && (
                <Button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="h-20 px-10 rounded-[2rem] bg-foreground text-background font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl group flex items-center gap-3"
                >
                  {showAddForm ? t("closeForm") : t("addHotel")}
                  <Plus className={`w-6 h-6 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
                </Button>
              )}
            </div>
          </div>

          {showAddForm && (
            <div className="bg-white dark:bg-card p-12 rounded-[4rem] border border-border/50 shadow-premium mb-16 animate-scale-in relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
              <h2 className="text-4xl font-display font-black mb-10 tracking-tight">{t("registerNewProperty")}</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("hotelName")}</label>
                  <Input type="text" name="name" value={newHotel.name} onChange={handleInputChange} required placeholder={t("tajMahalPalace")}
                    className="h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-white transition-all font-bold text-lg" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("locationPin")}</label>
                  <Input type="text" name="location" value={newHotel.location} onChange={handleInputChange} required placeholder={t("mumbaiIndia")}
                    className="h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-white transition-all font-bold text-lg" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("priceNightInr")}</label>
                  <Input type="number" name="price" value={newHotel.price || ''} onChange={handleInputChange} required min="0" placeholder="15000"
                    className="h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-white transition-all font-bold text-lg" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("rating1to5")}</label>
                  <Input type="number" name="rating" value={newHotel.rating || ''} onChange={handleInputChange} required min="0" max="5" step="0.1" placeholder="4.8"
                    className="h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-white transition-all font-bold text-lg" />
                </div>
                <div className="md:col-span-2 lg:col-span-4 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("imageUrl")}</label>
                  <Input type="text" name="image" value={newHotel.image} onChange={handleInputChange} placeholder="https://images.unsplash.com/..."
                    className="h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-white transition-all font-bold text-lg" />
                </div>
                <div className="md:col-span-2 lg:col-span-4 flex justify-end pt-6">
                  <Button type="submit" size="lg" className="h-16 px-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:shadow-glow hover:scale-105 transition-all">
                    {t("registerProperty")}
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="relative overflow-hidden group py-4 -mx-4 px-4 md:-mx-12 md:px-12 animate-fade-in delay-200">
            <div className="flex gap-10 min-w-full w-max animate-auto-scroll-x">
              {[...filteredHotels, ...filteredHotels].map((hotel, index) => (
                <motion.div
                  key={`${hotel.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (index % filteredHotels.length) * 0.1 }}
                  className="w-[300px] md:w-[400px] shrink-0 h-full"
                >
                  <Link to={`/hotel/${hotel.id}`} className="block h-full">
                    <HotelCard {...hotel} onDelete={handleDelete} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-32 animate-pulse">
               <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
               <p className="font-bold text-muted-foreground italic text-lg">{t("fetchingCuratedHotels")}</p>
            </div>
          ) : filteredHotels.length === 0 && (
            <div className="text-center py-32 bg-white dark:bg-card rounded-[4rem] border border-border/50 shadow-soft max-w-4xl mx-auto animate-scale-in">
              <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <MapPin className="w-10 h-10 text-muted-foreground opacity-30" />
              </div>
              <h3 className="text-4xl font-display font-black mb-4">{t("noResultsFound")}</h3>
              <p className="text-xl text-muted-foreground font-medium italic px-10 leading-relaxed italic">
                 "{t("hotelNoResultsSubtitle")}"
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Hotels;
