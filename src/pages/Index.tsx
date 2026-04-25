import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import NavigationHeader from "@/components/NavigationHeader";
import apiClient from '@/config/axios';
import HeroSection from "@/components/HeroSection";
import HomestayCard from "@/components/HomestayCard";
import HotelCard from "@/components/HotelCard";
import AttractionCard from "@/components/AttractionCard";
import StatsSection from "@/components/StatsSection";
import DestinationsSection from "@/components/DestinationsSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Star, Home, Sparkles, Globe, Heart } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { motion, useScroll, useSpring } from "framer-motion";

// India Assets
import manaliSnow from "@/assets/manali-snow.jpg";
import jaipurHaveli from "@/assets/jaipur-haveli.jpg";
import varanasiGhats from "@/assets/varanasi-ghats.jpg";
import keralaHouseboat from "@/assets/kerala-houseboat.jpg";
import goaBeach from "@/assets/goa-beach.jpg";
import munnarTea from "@/assets/munnar-tea.jpg";

const Index = () => {
  const { user, loading } = useAuth();
  const { t } = useAppContext();
  const navigate = useNavigate();
  const [featuredStays, setFeaturedStays] = useState<any[]>([]);
  const [mustVisits, setMustVisits] = useState<any[]>([]);
  const [featuredHotels, setFeaturedHotels] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homestaysRes, attractionsRes, hotelsRes] = await Promise.all([
          apiClient.get(`/api/homestays`),
          apiClient.get(`/api/attractions`),
          apiClient.get(`/api/hotels`)
        ]);
        
        if (homestaysRes.data) {
          setFeaturedStays(homestaysRes.data.slice(0, 6));
        }
        
        if (attractionsRes.data) {
          setMustVisits(attractionsRes.data.slice(0, 4));
        }

        if (hotelsRes.data) {
          setFeaturedHotels(hotelsRes.data.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching landing page data:", error);
      }
    };
    fetchData();
  }, []);



  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8 }
    }
  };


  return (
    <div className="min-h-screen bg-background selection:bg-secondary/20">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-secondary origin-[0%] z-[100]"
        style={{ scaleX }}
      />
      <NavigationHeader />
      <HeroSection />
      <StatsSection />
      <DestinationsSection />

      {/* Featured Homestays Section */}
      <section className="py-32 px-4 bg-white dark:bg-card/30 relative">
        <div className="container mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16 space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/5 rounded-full">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-secondary font-black uppercase tracking-[0.2em] text-[10px]">{t("premiumCurations")}</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-display font-black tracking-tighter text-foreground leading-[0.85]">
              Heritage <span className="text-secondary italic">{t("heritageStays").includes("Heritage") ? "Stays" : t("heritageStays")}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto font-medium">
              {t("staysSubtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredStays.map((stay, index) => (
              <motion.div 
                key={stay.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.05 }}
                whileHover={{ y: -10 }}
              >
                <Link to={`/homestay/${stay.id}`}>
                  <HomestayCard {...stay} />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link to="/homestays">
              <Button size="lg" className="h-16 px-12 rounded-2xl bg-foreground text-background font-black text-lg hover:bg-secondary hover:text-white transition-all shadow-xl group">
                {t("exploreMore")}
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Premium Hotels Section */}
      <section className="py-32 px-4 bg-muted/20 relative">
        <div className="container mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16 space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">{t("luxuryLabel")}</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-display font-black tracking-tighter text-foreground leading-[0.85]">
              Grand <span className="text-primary italic">{t("hotelsLabel")}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto font-medium">
              {t("hotelsSubtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredHotels.map((hotel, index) => (
              <motion.div 
                key={hotel.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.05 }}
                whileHover={{ y: -10 }}
              >
                <HotelCard {...hotel} />
              </motion.div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link to="/hotels">
              <Button size="lg" className="h-16 px-12 rounded-2xl bg-foreground text-background font-black text-lg hover:bg-primary hover:text-white transition-all shadow-xl group">
                {t("viewAllHotels")}
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <section className="py-32 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-16 items-center">
            <div className="lg:col-span-1 space-y-8">
              <h2 className="text-5xl md:text-7xl font-display font-black text-foreground tracking-tighter leading-none">
                {t("experienceIndia").split(" ")[0]} <br />
                <span className="text-nature italic">{t("experienceIndia").split(" ")[1] || "India"}</span>
              </h2>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                {t("experienceSubtitle")}
              </p>
              <div className="space-y-4">
                {[
                  { icon: Star, text: t("localGuides") },
                  { icon: MapPin, text: t("hiddenGems") },
                  { icon: Heart, text: t("authenticCultural") }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 font-bold text-foreground/80">
                    <div className="w-10 h-10 bg-nature/10 rounded-xl flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-nature" />
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>
              <Link to="/attractions">
                <Button variant="outline" className="h-14 px-8 rounded-xl border-2 border-nature/20 text-nature font-black hover:bg-nature hover:text-white transition-all">
                  {t("browseTours")}
                </Button>
              </Link>
            </div>

            <div className="lg:col-span-2">
              <div className="grid sm:grid-cols-2 gap-8">
                {mustVisits.map((attraction, index) => (
                  <AttractionCard key={index} {...attraction} />
                ))}
                <div className="bg-white dark:bg-card/50 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center shadow-soft border border-border/50 group hover:shadow-premium transition-all">
                  <div className="w-20 h-20 bg-nature/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Globe className="w-10 h-10 text-nature" />
                  </div>
                  <h3 className="text-2xl font-display font-black mb-4">{t("teaEstateWalks")}</h3>
                  <p className="text-muted-foreground mb-8 font-medium italic">"{t("teaEstateDesc")}"</p>
                  <Button variant="ghost" className="text-nature font-black uppercase tracking-widest text-xs">{t("bookTour")}</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Community Section */}
      <section className="py-32 px-4 bg-secondary text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="container mx-auto relative z-10 text-center space-y-12">
          <h2 className="text-5xl md:text-8xl font-display font-black tracking-tighter leading-none mb-10">
            {t("bePartOfCommunity").split("our")[0]} <br />
            <span className="text-background italic underline decoration-background/30">{t("bePartOfCommunity").split("our")[1] || t("community")}</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: t("travel"), desc: t("travelDesc"), link: "/homestays", icon: MapPin },
              { title: t("host"), desc: t("shareHeritage"), link: "/become-host", icon: Home },
              { title: t("guide"), desc: t("tellStory"), link: "/contact", icon: Sparkles }
            ].map((role, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-10 rounded-[3rem] border border-white/20 hover:bg-white/20 transition-all text-center group cursor-pointer">
                <role.icon className="w-12 h-12 mx-auto mb-6 text-white group-hover:scale-110 transition-transform" />
                <h3 className="text-3xl font-display font-black mb-2">{role.title}</h3>
                <p className="text-white/70 font-medium mb-8">{role.desc}</p>
                <Link to={role.link}>
                  <Button className="bg-white text-secondary font-black px-8 rounded-xl h-12">{t("joinNow")}</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-24 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-16">
            <div className="space-y-6 max-w-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center">
                  <Home className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-display font-black text-white">TourNest</span>
              </div>
              <p className="text-white/60 text-lg font-medium leading-relaxed italic">
                {t("heroSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h5 className="font-black uppercase tracking-widest text-xs text-secondary">{t("discover")}</h5>
                <div className="flex flex-col gap-2 font-bold text-white/70">
                  <Link to="/homestays" className="hover:text-white transition-colors">{t("homestays")}</Link>
                  <Link to="/attractions" className="hover:text-white transition-colors">{t("attractions")}</Link>
                  <Link to="/hotels" className="hover:text-white transition-colors">{t("hotelsDemo")}</Link>
                </div>
              </div>
              <div className="space-y-4">
                <h5 className="font-black uppercase tracking-widest text-xs text-secondary">{t("community")}</h5>
                <div className="flex flex-col gap-2 font-bold text-white/70">
                  <Link to="/become-host" className="hover:text-white transition-colors">{t("becomeHost")}</Link>
                  <Link to="/contact" className="hover:text-white transition-colors">{t("joinAsGuide")}</Link>
                </div>
              </div>
              <div className="space-y-4">
                <h5 className="font-black uppercase tracking-widest text-xs text-secondary">{t("support")}</h5>
                <div className="flex flex-col gap-2 font-bold text-white/70">
                  <Link to="/contact" className="hover:text-white transition-colors">{t("contactUs")}</Link>
                  <a href="#" className="hover:text-white transition-colors">{t("privacy")}</a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-xs font-bold uppercase tracking-widest">
            <p>© 2026 TourNest India. {t("rightsReserved")}</p>
            <div className="flex gap-6">
              <span>Instagram</span>
              <span>LinkedIn</span>
              <span>Twitter</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;