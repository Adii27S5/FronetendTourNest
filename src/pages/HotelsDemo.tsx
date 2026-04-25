import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';
import { useAppContext } from '@/contexts/AppContext';
import NavigationHeader from '@/components/NavigationHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Trash2, Plus, MapPin, Sparkles } from 'lucide-react';
import HotelCard from '@/components/HotelCard';
import Loader3D from '@/components/Loader3D';

// Define the shape of our Hotel data
interface Hotel {
  id?: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  hotelImagePath?: string;
}

const HotelsDemo: React.FC = () => {
  const { t } = useAppContext();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [newHotel, setNewHotel] = useState<Hotel>({ name: '', location: '', price: 0, rating: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = `${API_BASE_URL}/api/hotels`;

  // Fetch hotels from the Spring Boot backend
  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setHotels(data);
      setError(null);
    } catch (e: any) {
      console.error("Could not fetch hotels:", e);
      setError(t("toastFetchHotelsFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

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
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newHotel),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add hotel');
      }
      
      // Refresh list and reset form
      await fetchHotels();
      setNewHotel({ name: '', location: '', price: 0, rating: 0 });
    } catch (e: any) {
      console.error("Could not add hotel:", e);
      alert(t("toastAddHotelFailed"));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete hotel');
      }
      
      await fetchHotels();
    } catch (e: any) {
      console.error("Could not delete hotel:", e);
      alert(t("toastDeleteHotelFailed"));
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 selection:bg-secondary/20 font-sans">
      <NavigationHeader />
      <main className="container mx-auto p-6 pt-32 max-w-7xl">
        <div className="mb-12 animate-slide-up">
           <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter text-foreground mb-4 uppercase">{t("hotelManagementDemo")}</h1>
           <p className="text-xl text-muted-foreground font-medium italic border-l-8 border-secondary/10 pl-6">
             Backend Integration Verification Module
           </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-2 border-red-200 text-red-700 px-8 py-4 rounded-2xl mb-8 font-bold animate-bounce shadow-soft">
            {error}
          </div>
        )}

        {/* Add new hotel form */}
        <div className="bg-white dark:bg-card p-10 rounded-[3rem] shadow-premium mb-12 border border-border/50 animate-scale-in overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-secondary" />
          <h2 className="text-3xl font-display font-black mb-8 flex items-center gap-3">
            <Plus className="w-6 h-6 text-secondary" /> {t("addANewHotel")}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("fullName")}</label>
              <Input type="text" name="name" value={newHotel.name} onChange={handleInputChange} required placeholder={t("hotelName")}
                className="h-14 rounded-xl border-border/50 focus:border-secondary font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("locationPin")}</label>
              <Input type="text" name="location" value={newHotel.location} onChange={handleInputChange} required placeholder={t("locationCityState")}
                className="h-14 rounded-xl border-border/50 focus:border-secondary font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("priceNightInr")}</label>
              <Input type="number" name="price" value={newHotel.price || ''} onChange={handleInputChange} required min="0" step="0.01" placeholder="5000"
                className="h-14 rounded-xl border-border/50 focus:border-secondary font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("rating1to5")}</label>
              <Input type="number" name="rating" value={newHotel.rating || ''} onChange={handleInputChange} required min="0" max="5" step="0.1" placeholder="4.5"
                className="h-14 rounded-xl border-border/50 focus:border-secondary font-bold" />
            </div>
            <div className="flex items-end pt-2">
              <Button type="submit" className="w-full h-14 bg-secondary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-glow hover:scale-105 transition-all">
                {t("addHotel")}
              </Button>
            </div>
          </form>
        </div>

        {/* List of hotels */}
        <div className="animate-fade-in delay-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-nature/10 text-nature rounded-full text-[10px] font-black uppercase tracking-widest border border-nature/20">
                <Sparkles className="w-4 h-4" />
                <span>{t("premiumCollection")}</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-display font-black text-foreground tracking-tighter leading-[0.85]">
                Luxury <br /> <span className="text-primary italic">Hospitality.</span>
              </h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
               {/* Search/Filter placeholder if needed */}
               <Button onClick={fetchHotels} variant="outline" className="h-14 px-8 rounded-xl border-2 border-primary/20 text-primary font-black hover:bg-primary hover:text-white transition-all">
                 Refresh List
               </Button>
            </div>
          </div>

          {loading ? (
             <Loader3D />
          ) : hotels.length === 0 ? (
            <div className="text-center py-20 bg-muted/10 rounded-[3rem] border-2 border-dashed border-muted-foreground/20">
               <p className="text-2xl text-muted-foreground font-black italic">"{t("noHotelsFoundDb")}"</p>
            </div>
          ) : (
            <div className="relative overflow-hidden group py-4 -mx-4 px-4 md:-mx-12 md:px-12">
              <div className="flex gap-10 min-w-full w-max animate-auto-scroll-x">
                {[...hotels, ...hotels].map((hotel, index) => (
                  <div key={`${hotel.id}-${index}`} className="w-[300px] md:w-[400px] shrink-0 h-full">
                    <HotelCard 
                      id={hotel.id}
                      name={hotel.name}
                      location={hotel.location}
                      price={hotel.price}
                      rating={hotel.rating}
                      image={hotel.hotelImagePath}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HotelsDemo;
