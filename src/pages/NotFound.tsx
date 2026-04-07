import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import NavigationHeader from "@/components/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Ghost, Home } from "lucide-react";

const NotFound = () => {
  const { t } = useAppContext();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-muted/20 selection:bg-secondary/20 font-sans flex flex-col">
      <NavigationHeader />
      <main className="flex-1 flex items-center justify-center p-6 pt-32">
        <div className="text-center max-w-2xl animate-scale-in">
          <div className="relative mb-12">
            <h1 className="text-[12rem] md:text-[18rem] font-display font-black text-secondary/5 leading-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-white dark:bg-card rounded-[2.5rem] shadow-premium flex items-center justify-center animate-bounce duration-[3000ms]">
                <Ghost className="w-16 h-16 text-secondary" />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight text-foreground">{t("oopsPageNotFound")}</h2>
            <p className="text-xl text-muted-foreground font-medium italic max-w-md mx-auto leading-relaxed">
              "Every corner of India is an adventure, but this particular path seems to be a hidden legend... or just non-existent."
            </p>
            
            <div className="pt-10">
              <Link to="/" className="inline-block hover:scale-105 transition-transform">
                <Button size="lg" className="h-20 px-12 rounded-3xl bg-foreground text-background font-black text-xs uppercase tracking-[0.2em] shadow-premium flex items-center gap-4">
                  <Home className="w-6 h-6" />
                  {t("returnToHome")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
