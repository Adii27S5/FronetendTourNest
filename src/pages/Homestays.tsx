import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import NavigationHeader from '@/components/NavigationHeader';
import HomestayCard from '@/components/HomestayCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Sparkles, MapPin, Loader2, X } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { useAppContext } from '@/contexts/AppContext';

// Indian Assets
import goaBeach from '@/assets/goa-beach.jpg';
import jaipurHaveli from '@/assets/jaipur-haveli.jpg';
import manaliSnow from '@/assets/manali-snow.jpg';
import keralaHouseboat from '@/assets/kerala-houseboat.jpg';

const Homestays = () => {
  const { t } = useAppContext();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [homestays, setHomestays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(searchQuery, 300);



  const fetchHomestays = async (search = '') => {
    try {
      setLoading(true);
      const url = search 
        ? `${API_BASE_URL}/api/homestays?search=${encodeURIComponent(search)}`
        : `${API_BASE_URL}/api/homestays`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setHomestays(data);
      } else {
        setHomestays([]);
      }
    } catch (error) {
      console.error("Error fetching homestays:", error);
      setHomestays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for location or search parameter in URL
    const locationParam = queryParams.get('location');
    const searchParam = queryParams.get('search');
    
    if (locationParam) {
      setSearchQuery(locationParam);
      fetchHomestays(locationParam);
    } else if (searchParam) {
      setSearchQuery(searchParam);
      fetchHomestays(searchParam);
    } else {
      fetchHomestays();
    }
  }, [location.search]);

  const filteredHomestays = homestays.filter(stay => {
    const matchesSearch = stay.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      stay.location.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || stay.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getFilterLabel = (f: string) => {
    switch(f) {
      case 'all': return t('allCategories');
      case 'Heritage': return t('heritage');
      case 'Beach': return t('beach');
      case 'Mountain': return t('snow');
      case 'Nature': return t('nature');
      default: return f;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 selection:bg-secondary/20 font-sans">
      <NavigationHeader />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16 animate-slide-up">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-widest border border-secondary/20">
                <Sparkles className="w-3 h-3" />
                <span>{t("verifiedStays")}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-foreground leading-none">
                {t("findYour")} <br />
                <span className="text-secondary italic underline decoration-secondary/30">{t("sanctuary")}</span>
              </h1>
            </div>

            <div className="w-full md:w-[450px] relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6 group-focus-within:text-secondary transition-colors" />
                <Input
                  placeholder={t("searchByCityProperty")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-20 pl-16 pr-16 rounded-[2rem] bg-white dark:bg-card border-0 shadow-premium focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-lg"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-muted/20 rounded-xl hover:bg-muted/40 transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

          <div className="flex flex-wrap items-center gap-4 mb-14 animate-slide-up delay-100">
            {['all', 'Heritage', 'Beach', 'Mountain', 'Nature'].map(filter => (
              <button
                key={filter}
                onClick={() => {
                  setSelectedFilter(filter);
                  if (filter === 'all') setSearchQuery(''); 
                }}
                className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${selectedFilter === filter
                    ? 'bg-secondary text-white shadow-glow'
                    : 'bg-white dark:bg-card text-muted-foreground hover:bg-secondary/5 hover:text-secondary border border-border/50'
                  }`}
              >
                {getFilterLabel(filter)}
              </button>
            ))}
          </div>

          <div className="relative overflow-hidden group py-4 -mx-4 px-4 md:-mx-12 md:px-12">
            <div className="flex gap-10 min-w-full w-max animate-auto-scroll-x">
              {[...filteredHomestays, ...filteredHomestays].map((stay, index) => (
                <div key={`${stay.id}-${index}`} className="w-[300px] md:w-[400px] shrink-0">
                  <Link to={`/homestay/${stay.id}`} className="block hover:scale-[1.02] transition-transform h-full">
                    <HomestayCard {...stay} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-32 animate-pulse">
               <Loader2 className="w-12 h-12 animate-spin text-secondary mx-auto mb-4" />
               <p className="font-bold text-muted-foreground italic text-lg">{t("fetchingCuratedHotels")}</p>
            </div>
          ) : filteredHomestays.length === 0 && (
            <div className="text-center py-32 bg-white dark:bg-card rounded-[4rem] border border-border/50 shadow-soft max-w-4xl mx-auto animate-scale-in">
              <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <MapPin className="w-10 h-10 text-muted-foreground opacity-30" />
              </div>
              <h3 className="text-4xl font-display font-black mb-4">{t("noHotelsCurrently")}</h3>
              <p className="text-xl text-muted-foreground font-medium italic px-10 leading-relaxed">
                "{t("weWillArriveSoon")}"
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Homestays;
