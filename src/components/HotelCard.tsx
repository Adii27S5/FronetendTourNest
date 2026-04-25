import { Star, MapPin, Hotel, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { formatPrice } from "@/lib/currency";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { resolveImage } from "@/lib/image-mapper";
import apiClient from "@/config/axios";
import { toast } from "sonner";

interface HotelCardProps {
  id?: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  image?: string;
  region?: string;
  bedrooms?: number;
  hotelCapacityLimit?: number;
  onDelete?: (id: number) => void;
}

const HotelCard = ({ id, name, location, price, rating, image, region, bedrooms, hotelCapacityLimit, onDelete }: HotelCardProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const defaultImage = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800";

  useEffect(() => {
    const checkFavorite = async () => {
      if (user?.email && id) {
        try {
          const res = await apiClient.get(`/api/favorites/check?email=${user.email}&type=hotel&itemId=${id}`);
          setIsLiked(res.data);
        } catch (e) {
          console.error("Error checking favorite:", e);
        }
      }
    };
    checkFavorite();
  }, [user, id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to save favorites");
      return;
    }
    try {
      const res = await apiClient.post(`/api/favorites/toggle?email=${user.email}&type=hotel&itemId=${id}`);
      setIsLiked(res.data);
      if (res.data) {
        toast.success(`${name} added to favorites`);
      } else {
        toast.info(`${name} removed from favorites`);
      }
    } catch (e) {
      console.error("Error toggling favorite:", e);
      toast.error("Failed to update favorites");
    }
  };

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group bg-white dark:bg-card rounded-[2.5rem] overflow-hidden shadow-soft hover:shadow-premium transition-all duration-500 border border-border/50 flex flex-col h-full perspective-1000"
    >
      {/* 3D Shine Effect */}
      <motion.div
        style={{
          translateZ: "50px",
          opacity: useTransform(mouseXSpring, [-0.5, 0.5], [0, 0.3])
        }}
        className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none z-10"
      />

      {/* Image Container */}
      <div 
        style={{ transform: "translateZ(75px)" }}
        className="relative h-64 overflow-hidden rounded-t-[2.5rem]"
      >
        <motion.img
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          src={resolveImage(image) || defaultImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Floating Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <div className="bg-primary/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-glow">
            Premium Choice
          </div>
          {region && (
            <div className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
              {region}
            </div>
          )}
        </div>

        <button
          onClick={toggleFavorite}
          className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl hover:bg-white/40 transition-all group/btn shadow-soft"
        >
          <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </button>

        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white font-black text-xs">{rating}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        style={{ transform: "translateZ(50px)" }}
        className="p-8 flex flex-col flex-1"
      >
        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-3">
          <MapPin className="w-3.5 h-3.5" />
          {location}
        </div>

        <h3 className="text-2xl font-display font-black text-foreground mb-4 group-hover:text-primary transition-colors line-clamp-1">
          {name}
        </h3>

        <div className="mt-auto flex items-center justify-between pt-6 border-t border-border/50">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-display font-black text-primary">₹{price}</span>
            </div>
          </div>

          {hotelCapacityLimit && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Capacity</span>
              <span className="text-sm font-bold text-foreground bg-muted/50 px-3 py-1 rounded-lg">
                {hotelCapacityLimit} Persons
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {localStorage.getItem('user_role') === 'ADMIN' && onDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => onDelete(id)}
              >
                Delete
              </Button>
            )}
            <Button 
              onClick={() => {
                const city = location.split(',')[0].trim();
                window.location.href = `/attractions?location=${encodeURIComponent(city)}`;
              }}
              className="h-10 px-5 rounded-xl bg-secondary text-white font-black text-[10px] uppercase tracking-widest shadow-glow hover:scale-105 transition-all"
            >
              View Tours
            </Button>
            <Button 
              onClick={() => window.location.href = `/hotel-book?id=${id}`}
              className="h-10 px-5 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-glow hover:scale-105 transition-all"
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HotelCard;
