import { Users, Home, MapPin, Star, IndianRupee, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";

const StatsSection = () => {
  const [userCount, setUserCount] = useState<string>("...");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`);
        if (response.ok) {
          const data = await response.json();
          setUserCount(data.length.toString());
        } else {
          setUserCount("1 Lakh+");
        }
      } catch (error) {
        console.error("Failed to fetch user count:", error);
        setUserCount("1 Lakh+");
      }
    };
    fetchUsers();
  }, []);

  const stats = [
    {
      icon: Home,
      number: "5+",
      label: "Verified Hosts",
      description: "Across 28 Indian States",
      color: "from-primary to-primary/60"
    },
    {
      icon: Users,
      number: userCount,
      label: "Happy Explorers",
      description: "Discovering India",
      color: "from-nature to-nature/60"
    },
    {
      icon: Star,
      number: "4.9/5",
      label: "Heritage Rating",
      description: "Community Approved",
      color: "from-gold to-amber-500"
    },
    {
      icon: Heart,
      number: "100%",
      label: "Selected Love",
      description: "Local, Pure, Authentic",
      color: "from-rose-500 to-rose-300"
    }
  ];

  return (
    <section className="py-32 px-4 bg-muted/10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-5xl md:text-7xl font-display font-black text-foreground tracking-tighter leading-none">
            Selected for <span className="text-primary italic">You.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            We're building the most authentic community of Indian hosts and travelers, sharing stories one home at a time.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group animate-slide-up bg-white dark:bg-card/50 p-10 rounded-[3rem] shadow-soft hover:shadow-premium transition-all hover:-translate-y-2 border border-border/50"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative mb-8">
                <div className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-[2rem] flex items-center justify-center mx-auto shadow-glow group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-4xl font-display font-black text-foreground mb-2">
                {stat.number}
              </h3>
              <p className="text-sm font-black uppercase tracking-widest text-primary mb-1">
                {stat.label}
              </p>
              <p className="text-xs text-muted-foreground font-bold italic opacity-60">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;