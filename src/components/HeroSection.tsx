import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, Sparkles } from "lucide-react";
import heroImage from "@/assets/manali-snow.jpg";
import { useAppContext } from "@/contexts/AppContext";
import { motion } from "framer-motion";

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");

  const trendingCities = [
    { name: "Kolkata", id: "kolkata" },
    { name: "Leh Ladakh", id: "leh" },
    { name: "Munnar", id: "munnar" },
    { name: "Varanasi", id: "varanasi" },
    { name: "Goa", id: "goa" },
    { name: "Jaipur", id: "jaipur" }
  ];

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1.05, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-background" />
      </motion.div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 right-20 w-48 h-48 bg-nature/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/3 right-10 w-24 h-24 bg-primary/30 rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }} />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
            <span className="text-white font-black tracking-[0.3em] uppercase text-xs sm:text-sm">{t("guestKing")}</span>
            <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-9xl font-display font-black mb-6 leading-[0.9] tracking-tighter">
            {t("heroTitle").split("Soul")[0]} <br />
            <span className="italic text-secondary drop-shadow-glow">{t("heroTitle").includes("Soul") ? "Soul of India" : t("heroTitle")}</span>
          </h1>
          <p className="text-base md:text-xl lg:text-2xl mb-10 font-medium opacity-90 max-w-3xl mx-auto leading-relaxed">
            {t("heroSubtitle")}
            <span className="block mt-2 text-secondary font-bold">{t("heroSubtitle2")}</span>
          </p>
        </motion.div>

        {/* Enhanced Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-2 md:p-3 mb-10 max-w-4xl mx-auto shadow-premium border border-white/20 hover:bg-white/15 transition-all text-white">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-[2]">
                <MapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 text-secondary w-6 h-6" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/hotels?location=${searchQuery}`)}
                  className="pl-16 h-14 md:h-16 bg-white/10 border-0 text-white text-base md:text-lg placeholder:text-white/60 focus:bg-white/20 transition-all rounded-3xl font-medium"
                />
              </div>
              <div className="relative flex-1 hidden lg:block">
                <Users className="absolute left-6 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
                <Input
                  placeholder={t("guestsPlaceholder")}
                  className="pl-14 h-16 bg-white/10 border-0 text-white text-lg placeholder:text-white/60 focus:bg-white/20 transition-all rounded-3xl font-medium"
                />
              </div>
              <Button
                onClick={() => navigate(`/hotels?location=${searchQuery}`)}
                className="px-6 md:px-10 h-14 md:h-16 text-base md:text-lg font-black rounded-3xl bg-secondary text-white hover:bg-secondary/90 shadow-glow transition-all group"
              >
                <Search className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 group-hover:scale-110 transition-transform" />
                {t("search")}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-4 text-white/80 text-sm font-bold uppercase tracking-widest">
            <span className="opacity-50 text-[10px]">{t("trending")}:</span>
            {trendingCities.map((city) => (
              <button
                key={city.id}
                onClick={() => navigate(`/hotels?location=${city.name}`)}
                className="px-5 py-2 bg-white/5 rounded-full hover:bg-secondary/20 hover:text-white transition-all border border-white/5 hover:border-secondary/50 text-[11px]"
              >
                {city.name}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 opacity-70">
        <div className="w-1 h-12 bg-gradient-to-b from-secondary to-transparent rounded-full animate-pulse" />
        <p className="text-[10px] font-black tracking-[0.5em] uppercase text-white">{t("startJourney")}</p>
      </div>
    </section>
  );
};

export default HeroSection;