import { Star, MapPin, Users, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { formatPrice } from "@/lib/currency";
import { resolveImage } from "@/lib/image-mapper";
import { useAppContext } from "@/contexts/AppContext";

interface HomestayCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  rating: number;
  price: number;
  host: string;
  guests: number;
  amenities: string[];
  bedrooms?: number;
  bathrooms?: number;
  region?: string;
  description?: string;
}

const HomestayCard = ({ id, image, title, location, rating, price, host, guests, amenities, bedrooms, bathrooms, region, description }: HomestayCardProps) => {
  const { isFavorite, addFavorite, removeFavorite, t } = useAppContext();
  const favorite = isFavorite(id);

  return (
    <div className="group bg-white dark:bg-card rounded-[2.5rem] overflow-hidden shadow-soft border border-border/50 flex flex-col h-full effect-3d">
      {/* Shine Effect - removed for perf */}

      {/* Image Container */}
      <div className="relative h-72 overflow-hidden rounded-t-[2.5rem]">
        <img
          src={resolveImage(image)}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Floating Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <div className="bg-secondary/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-glow">
            {t("topRated")}
          </div>
          {region && (
            <div className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
              {region}
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            if (favorite) {
              removeFavorite(id);
            } else {
              addFavorite({
                id: id,
                type: 'homestay',
                data: { id, image, title, location, rating, price, guests }
              });
            }
          }}
          className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl hover:bg-white/40 transition-all group/btn shadow-soft"
        >
          <Heart className={`w-5 h-5 transition-colors ${favorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </button>

        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white font-black text-xs">{rating ?? 4.5}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-secondary font-bold text-[10px] uppercase tracking-widest mb-3">
          <MapPin className="w-3.5 h-3.5" />
          {location}
        </div>

        <h3 className="text-2xl font-display font-black text-foreground mb-4 group-hover:text-secondary transition-colors line-clamp-1">
          {title}
        </h3>

        <p className="text-muted-foreground text-sm font-medium mb-6 line-clamp-2 italic">
          "{description || amenities?.join(' • ') || t("noAmenitiesListed")}"
        </p>

        <div className="mt-auto flex items-center justify-between pt-6 border-t border-border/50">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t("perDay")}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-display font-black text-secondary">₹{price}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 text-muted-foreground">
               <Users className="w-4 h-4" />
                <span className="text-xs font-bold">{guests ?? 2} {t("guestsCount")}</span>
             </div>
             
             <button 
                onClick={(e) => {
                  e.preventDefault();
                  const city = location.split(',')[0].trim();
                  window.location.href = `/attractions?location=${city}`;
                }}
                className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary hover:bg-secondary hover:text-white transition-all transform hover:scale-110"
                title={t("viewTours")}
             >
                <ArrowRight className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomestayCard;