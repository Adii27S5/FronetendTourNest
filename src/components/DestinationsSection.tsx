import { useState } from "react";
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

  return (
    <section className="py-32 px-4 bg-muted/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-secondary/5 rounded-full blur-[100px] -mr-80 -mt-80" />

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              <span className="text-secondary font-black tracking-widest uppercase text-xs">{t("topRatedLocations")}</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-display font-black tracking-tighter text-foreground leading-[0.8]">
              {t("gemsOfIndia").split(" ")[0]} {t("gemsOfIndia").split(" ")[1]} <span className="text-secondary italic">{t("gemsOfIndia").split(" ")[2] || "India"}</span>
            </h2>
            <p className="text-xl text-muted-foreground font-medium max-w-xl">
              {t("experienceSubtitle")}
            </p>
          </div>
          <Button
            onClick={() => navigate("/homestays")}
            className="h-16 px-10 rounded-2xl border-2 border-secondary/20 hover:border-secondary font-bold transition-all text-secondary"
          >
            {t("viewAllStates")}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Large Hero Card */}
          <div className="lg:col-span-2 lg:row-span-2 relative group rounded-[3rem] overflow-hidden shadow-premium h-[400px] md:h-[600px]">
            <img src={destinations[0].image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute top-8 left-8 flex gap-2">
              {destinations[0].tags.map(tag => (
                <span key={tag} className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                  {t(tag)}
                </span>
              ))}
            </div>
            <div className="absolute bottom-10 left-10 p-2 text-white">
              <div className="flex items-center gap-2 opacity-70 mb-2 font-bold uppercase text-xs tracking-widest">
                <MapPin className="w-4 h-4" />
                {destinations[0].state}
              </div>
              <h3 className="text-3xl md:text-5xl font-display font-black mb-6">{destinations[0].name}</h3>
              <p className="text-white/80 max-w-md text-lg font-medium leading-relaxed mb-8">
                {destinations[0].description}
              </p>
              <div className="flex items-center gap-10">
                <div className="flex flex-col">
                  <span className="text-sm uppercase tracking-widest opacity-60 font-black">{t("startingFrom")}</span>
                  <span className="text-3xl font-display font-black text-secondary flex items-center">
                    <IndianRupee className="w-6 h-6 mr-1" />{destinations[0].startingPrice}
                  </span>
                </div>
                <Button
                  onClick={() => navigate(`/homestays?search=${destinations[0].name}`)}
                  size="lg" className="h-14 px-10 rounded-2xl bg-white text-black font-black hover:bg-secondary hover:text-white transition-all shadow-xl"
                >
                  Explore {destinations[0].name}
                </Button>
              </div>
            </div>
          </div>

          {/* Small Cards */}
          {destinations.slice(1).map((dest) => (
            <div
              key={dest.id}
              onClick={() => navigate(`/homestays?search=${dest.name}`)}
              className="relative group rounded-[2.5rem] overflow-hidden shadow-soft hover:shadow-premium transition-all h-[280px] cursor-pointer"
            >
              <img src={dest.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-1.5 text-white/70 text-[10px] uppercase font-bold tracking-widest mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {dest.state}
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-2xl font-display font-black text-white">{dest.name}</h4>
                  <div className="bg-secondary px-3 py-1 rounded-full text-[10px] font-black text-white shadow-glow">
                    {dest.homestayCount}+ {t("stays").toLowerCase()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationsSection;
