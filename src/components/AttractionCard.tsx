import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock } from "lucide-react";
import { resolveImage } from "@/lib/image-mapper";
import { motion } from "framer-motion";

interface AttractionCardProps {
  image: string;
  title: string;
  location: string;
  duration: string;
  rating: number;
  category: string;
  className?: string;
  description?: string;
  id?: string | number;
}

const AttractionCard = ({
  image,
  title,
  location,
  duration,
  rating,
  category,
  className = "",
  description = "",
  id
}: AttractionCardProps) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (category === 'Food') {
        const city = location.split(',').pop()?.trim() || location;
        navigate(`/homestays?search=${encodeURIComponent(city)}`);
    } else {
        navigate(`/attraction/${id}`);
    }
  };

  return (
    <div 
      onClick={handleNavigate}
      className={`bg-white dark:bg-card rounded-[2.5rem] shadow-soft hover:shadow-premium transition-all duration-500 overflow-hidden group hover:-translate-y-2 border border-border/50 flex flex-col h-full cursor-pointer ${className}`}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden h-60">
        <motion.img
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          src={resolveImage(image)}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        <div className="absolute top-4 left-4">
          <Badge className="bg-nature text-white shadow-glow border-0 font-black uppercase tracking-widest text-[10px] px-3 py-1">
            {category}
          </Badge>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
              <Star className="w-3.5 h-3.5 fill-gold text-gold" />
              <span className="text-sm font-bold">{rating ?? 4.8}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-widest">{duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 flex flex-col flex-1 space-y-4">
        <div className="space-y-2">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              const city = location.split(',')[0].trim();
              navigate(`/hotels?location=${encodeURIComponent(city)}`);
            }}
            className="flex items-center text-nature font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors cursor-pointer"
          >
            <MapPin className="w-3 h-3 mr-1" />
            {location}
          </div>
          <h3 className="text-2xl font-display font-black text-foreground group-hover:text-primary transition-colors leading-tight">
            {title}
          </h3>
        </div>

        {description && (
          <p className="text-muted-foreground text-sm line-clamp-3 italic leading-relaxed font-medium">
            "{description ?? 'No description available'}"
          </p>
        )}

        <div className="pt-6 mt-auto border-t border-border/50">
          <button className="text-xs font-black uppercase tracking-[0.2em] text-primary hover:text-primary-foreground group-hover:scale-105 transition-all text-left">
            Experience India →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttractionCard;