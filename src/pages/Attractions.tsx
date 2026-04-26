import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import NavigationHeader from '@/components/NavigationHeader';
import AttractionCard from '@/components/AttractionCard';
import { API_BASE_URL } from "@/config/api";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Compass, MapPin, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from 'sonner';

// Indian Assets
import jaipurHaveli from '@/assets/jaipur-haveli.jpg';
import manaliSnow from '@/assets/manali-snow.jpg';
import varanasiGhats from '@/assets/varanasi-ghats.jpg';
import keralaHouseboat from '@/assets/kerala-houseboat.jpg';

const Attractions = () => {
  const { t } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [attractions, setAttractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttractions = async () => {
    try {
      setLoading(true);
      const attractionsRes = await fetch(`${API_BASE_URL}/api/attractions`);

      if (attractionsRes.ok) {
        const data = await attractionsRes.json();
        setAttractions(data);
      } else {
        setAttractions([]);
        toast.error("Could not fetch current attractions. Check your connection.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setAttractions([]);
      toast.error("Network issue. The backend might be starting up.");
    } finally {
      setLoading(false);
    }
  };

  const [searchParams] = useSearchParams();
  const locationFilter = searchParams.get('location');

  useEffect(() => {
    fetchAttractions();
    
    // Check for location parameter in URL
    const locationParam = searchParams.get('location');
    if (locationParam) {
      setSearchQuery(locationParam);
    }
  }, [searchParams]);

  const categories = ['all', 'Cultural', 'Adventure', 'Nature', 'Heritage', 'Food', 'Spiritual'];

  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case 'all': return t('allCategories');
      case 'Cultural': return t('catCultural');
      case 'Adventure': return t('catAdventure');
      case 'Nature': return t('catNature');
      case 'Heritage': return t('catHeritage');
      case 'Food': return t('catFood');
      case 'Spiritual': return 'Spiritual';
      default: return cat;
    }
  };

  const filteredAttractions = attractions.filter(attraction => {
    const matchesSearch = attraction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attraction.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || attraction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-muted/30 selection:bg-secondary/20 font-sans">
      <NavigationHeader />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-20 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-nature/10 text-nature rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-nature/20">
              <Compass className="w-4 h-4" />
              <span>{t("curatedExperiences")}</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-display font-black tracking-tighter leading-[0.9] text-foreground">
              {t("theSoulOf")} <span className="text-secondary italic underline decoration-secondary/30">{t("india")}.</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium italic max-w-2xl mx-auto leading-relaxed">
              "{t("everyCornerOfIndia")}"
            </p>
          </div>

          <div className="max-w-5xl mx-auto mb-20 space-y-12 animate-slide-up delay-100">
            <div className="relative group">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-secondary w-6 h-6 group-focus-within:scale-110 transition-transform" />
              <Input
                placeholder={t("findExperiences")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-20 pl-20 pr-10 rounded-[2.5rem] bg-white dark:bg-card border-0 shadow-premium outline-none text-xl font-bold placeholder:text-muted-foreground/50 transition-all focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-10 py-5 rounded-2xl text-xs uppercase font-black tracking-widest transition-all hover:scale-105 active:scale-95 ${selectedCategory === category
                      ? 'bg-secondary text-white shadow-glow translate-y-[-2px]'
                      : 'bg-white dark:bg-card text-muted-foreground hover:bg-secondary/5 hover:text-secondary border border-border/50'
                    }`}
                >
                  {getCategoryLabel(category)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-24 animate-fade-in delay-200">
            {(selectedCategory === 'all' ? categories.filter(c => c !== 'all') : [selectedCategory]).map(category => {
              const categoryAttractions = filteredAttractions.filter(a => a.category === category);
              if (categoryAttractions.length === 0) return null;

              return (
                <div key={category} className="space-y-8">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6 flex-1">
                      <h2 className="text-3xl md:text-5xl font-display font-black text-foreground">{getCategoryLabel(category)}</h2>
                      <div className="h-[2px] flex-1 bg-secondary/20 rounded-full"></div>
                    </div>
                  </div>
                    <div className="relative overflow-hidden w-full max-w-[2000px] mx-auto py-4">
                      <div className="overflow-hidden w-full relative -mx-4 px-4 md:-mx-12 md:px-12">
                        <div 
                          className={`flex gap-10 w-max ${categoryAttractions.length <= 4 ? 'justify-start' : 'min-w-full animate-auto-scroll-x hover:[animation-play-state:paused]'}`}
                          style={{ animationDuration: categoryAttractions.length <= 4 ? 'unset' : `${Array(10).fill(categoryAttractions).flat().length * 3}s` }}
                        >
                          {(categoryAttractions.length <= 4 ? categoryAttractions : Array(10).fill(categoryAttractions).flat()).map((attraction, index) => (
                            <div key={`${attraction.id}-${index}`} className="w-[300px] md:w-[400px] shrink-0 h-full snap-center">
                              <AttractionCard {...attraction} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                </div>
              );
            })}
          </div>

          {filteredAttractions.length === 0 && (
            <div className="text-center py-32 bg-white dark:bg-card rounded-[4rem] shadow-soft border border-border/50 max-w-4xl mx-auto animate-scale-in">
              <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <MapPin className="w-10 h-10 text-muted-foreground opacity-30" />
              </div>
              <h3 className="text-4xl font-display font-black mb-4">{t("noResultsFound")}</h3>
              <p className="text-lg text-muted-foreground italic font-medium">{t("tryDifferentSearch")}</p>
              <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all') }} variant="ghost" className="mt-8 text-secondary font-black uppercase tracking-widest text-[10px] hover:bg-secondary/5">
                {t("clearAllFilters")}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Attractions;
