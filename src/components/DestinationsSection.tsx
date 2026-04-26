import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Sparkles, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/translations";

// Import destination images
import goaBeach from "@/assets/goa-beach.jpg";
import keralaHouseboat from "@/assets/kerala-houseboat.jpg";
import manaliSnow from "@/assets/manali-snow.jpg";
import jaipurHaveli from "@/assets/jaipur-haveli.jpg";
import varanasiGhats from "@/assets/varanasi-ghats.jpg";
import munnarTea from "@/assets/munnar-tea.jpg";
import kolkataFood from "@/assets/kolkata-food.png";

interface Destination {
  id: string;
  image: string;
  name: string;
  state: string;
  description: string;
  homestayCount: number;
  startingPrice: number;
  tags: (keyof typeof translations.en)[];
  searchLocation?: string;
}

const destinations: Destination[] = [
  {
    id: "1",
    image: manaliSnow,
    name: "Manali",
    state: "Himachal Pradesh",
    description: "Snow-capped peaks, apple orchards, and cozy wooden cabins perfect for a Himalayan getaway.",
    homestayCount: 142,
    startingPrice: 1500,
    tags: ["snow", "adventure", "honeymoon"]
  },
  {
    id: "2",
    image: goaBeach,
    name: "North Goa",
    searchLocation: "Goa",
    state: "Goa",
    description: "Vibrant beach shacks, Portuguese heritage, and golden sands. Experience local lifestyle.",
    homestayCount: 256,
    startingPrice: 1800,
    tags: ["beach", "party", "heritage"]
  },
  {
    id: "3",
    image: jaipurHaveli,
    name: "Jaipur",
    state: "Rajasthan",
    description: "The Pink City awaits with royal heritage homestays, majestic forts, and rich culture.",
    homestayCount: 189,
    startingPrice: 2200,
    tags: ["royal", "history", "food"]
  },
  {
    id: "4",
    image: keralaHouseboat,
    name: "Alleppey",
    searchLocation: "Kerala",
    state: "Kerala",
    description: "God's Own Country. Float through serene backwaters on premium houseboat homestays.",
    homestayCount: 210,
    startingPrice: 2500,
    tags: ["nature", "wellness", "relax"]
  },
  {
    id: "6",
    image: munnarTea,
    name: "Munnar",
    state: "Kerala",
    description: "Rolling hills, emerald tea plantations, and mist-covered peaks. A true green paradise.",
    homestayCount: 175,
    startingPrice: 1800,
    tags: ["nature", "tea", "mist"]
  },
  {
    id: "5",
    image: varanasiGhats,
    name: "Varanasi",
    state: "Uttar Pradesh",
    description: "The spiritual heart of India. Riverside homestays with views of the eternal lights.",
    homestayCount: 156,
    startingPrice: 1200,
    tags: ["spiritual", "culture", "ancient"]
  },
  {
    id: "7",
    image: kolkataFood,
    name: "Kolkata",
    state: "West Bengal",
    description: "The City of Joy. A paradise for food lovers, colonial architecture, and rich literary heritage.",
    homestayCount: 95,
    startingPrice: 1600,
    tags: ["food", "culture", "history"]
  }
];

const DestinationsSection = () => {
  const navigate = useNavigate();
  const { t } = useAppContext();
  
  const repeatedDestinations = destinations.length <= 4 ? destinations : [
    ...destinations, ...destinations, ...destinations, ...destinations, ...destinations,
    ...destinations, ...destinations, ...destinations, ...destinations, ...destinations
  ];

  return (
    <section className="relative bg-muted/20 py-24 overflow-hidden">
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-secondary/5 rounded-full blur-3xl -mr-80 -mt-80 pointer-events-none" />

      <div className="container mx-auto relative z-10 shrink-0 mb-12 px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                <span className="text-secondary font-black tracking-widest uppercase text-xs">{t("topRatedLocations")}</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-foreground leading-[0.8]">
                {t("gemsOfIndia").split(" ")[0]} {t("gemsOfIndia").split(" ")[1]} <span className="text-secondary italic">{t("gemsOfIndia").split(" ")[2] || "India"}</span>
              </h2>
              <p className="text-xl text-muted-foreground font-medium max-w-xl">
                {t("experienceSubtitle")}
              </p>
            </div>
          </div>
        </div>

      <div className="relative w-full max-w-[2000px] mx-auto mt-16 md:mt-24">
        <div className="overflow-hidden w-full relative pb-20 pt-10">
          <div 
            className={`flex gap-10 w-max ${destinations.length <= 4 ? 'justify-start' : 'animate-auto-scroll-x hover:[animation-play-state:paused]'} px-4 md:px-20`}
            style={{ animationDuration: destinations.length <= 4 ? 'unset' : `${repeatedDestinations.length * 3}s` }}
          >
            {repeatedDestinations.map((dest, index) => (
              <motion.div
                key={`${dest.id}-${index}`}
                onClick={() => navigate(`/homestays?location=${dest.searchLocation || dest.name}`)}
                className="relative group rounded-[3rem] overflow-hidden shadow-premium h-[450px] md:h-[550px] w-[350px] md:w-[500px] cursor-pointer flex-shrink-0 snap-center effect-3d"
              >
                <img 
                  src={dest.image} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt={dest.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute top-8 left-8 flex gap-2">
                  {dest.tags.map(tag => (
                    <span 
                      key={tag}
                      className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white"
                    >
                      {t(tag)}
                    </span>
                  ))}
                </div>
                <div className="absolute bottom-10 left-10 right-10 p-2 text-white pointer-events-none">
                  <div className="flex items-center gap-2 opacity-70 mb-2 font-bold uppercase text-xs tracking-widest">
                    <MapPin className="w-4 h-4" />
                    {dest.state}
                  </div>
                  <h3 className="text-3xl md:text-5xl font-display font-black mb-4">{dest.name}</h3>
                  <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed mb-6 line-clamp-2">
                    {dest.description}
                  </p>
                  <div className="flex items-center justify-between pointer-events-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest opacity-60 font-black">{t("startingFrom")}</span>
                      <span className="text-2xl md:text-3xl font-display font-black text-secondary flex items-center">
                        <IndianRupee className="w-5 h-5 md:w-6 md:h-6 mr-1" />{dest.startingPrice}
                      </span>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/homestays?location=${dest.searchLocation || dest.name}`);
                      }}
                      size="default" className="h-12 px-6 rounded-xl bg-white text-black font-black hover:bg-secondary hover:text-white transition-all shadow-xl"
                    >
                      Explore
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DestinationsSection;
