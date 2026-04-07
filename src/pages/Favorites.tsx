import { Link } from 'react-router-dom';
import NavigationHeader from '@/components/NavigationHeader';
import HomestayCard from '@/components/HomestayCard';
import AttractionCard from '@/components/AttractionCard';
import HotelCard from '@/components/HotelCard';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { Heart } from 'lucide-react';

const Favorites = () => {
  const { favorites, t } = useAppContext();

  const homestayFavorites = favorites.filter(f => f.type === 'homestay');
  const attractionFavorites = favorites.filter(f => f.type === 'attraction');
  const hotelFavorites = favorites.filter(f => f.type === 'hotel');

  return (
    <div className="min-h-screen bg-muted/30 selection:bg-secondary/20 font-sans">
      <NavigationHeader />
      
      <main className="pt-32 pb-16 px-6 font-sans">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-14 animate-slide-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
                <Heart className="w-8 h-8 text-secondary fill-secondary" />
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter text-foreground leading-none">{t("myFavorites")}</h1>
            </div>
            <p className="text-xl text-muted-foreground font-medium italic">
              {t("savedHomestaysAttractions")}
            </p>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-32 bg-white dark:bg-card rounded-[4rem] border border-border/50 shadow-soft max-w-4xl mx-auto animate-scale-in">
              <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Heart className="w-10 h-10 text-muted-foreground opacity-30" />
              </div>
              <h2 className="text-4xl font-display font-black mb-4">{t("noFavoritesYet")}</h2>
              <p className="text-xl text-muted-foreground font-medium italic px-10 mb-10 leading-relaxed italic">
                "{t("startExploringSave")}"
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/homestays" className="hover:scale-105 transition-transform">
                  <Button size="lg" className="h-16 px-10 rounded-2xl bg-secondary text-white font-black text-xs uppercase tracking-widest shadow-glow">
                    {t("browseHomestays")}
                  </Button>
                </Link>
                <Link to="/hotels" className="hover:scale-105 transition-transform">
                  <Button size="lg" className="h-16 px-10 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-glow">
                    {t("luxury")}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-20 animate-fade-in delay-200">
              {/* Homestays */}
              {homestayFavorites.length > 0 && (
                <section>
                  <h2 className="text-4xl font-display font-black mb-10 tracking-tight border-l-8 border-secondary pl-6">
                    {t("favoriteHomestays")} ({homestayFavorites.length})
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {homestayFavorites.map((fav) => (
                      <Link key={fav.id} to={`/homestay/${fav.itemId || fav.details?.id || fav.data?.id}`} className="hover:scale-[1.02] transition-all">
                        <HomestayCard {...(fav.details || fav.data)} />
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Attractions */}
              {attractionFavorites.length > 0 && (
                <section>
                  <h2 className="text-4xl font-display font-black mb-10 tracking-tight border-l-8 border-nature pl-6">
                    {t("favoriteAttractions")} ({attractionFavorites.length})
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {attractionFavorites.map((fav) => (
                      <div key={fav.id} className="hover:scale-[1.02] transition-all cursor-pointer">
                        <AttractionCard {...(fav.details || fav.data)} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Hotels */}
              {hotelFavorites.length > 0 && (
                <section>
                  <h2 className="text-4xl font-display font-black mb-10 tracking-tight border-l-8 border-primary pl-6">
                    {t("favoriteHotels")} ({hotelFavorites.length})
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {hotelFavorites.map((fav) => (
                      <div key={fav.id} className="hover:scale-[1.02] transition-all cursor-pointer">
                        <HotelCard {...(fav.details || fav.data)} />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Favorites;
