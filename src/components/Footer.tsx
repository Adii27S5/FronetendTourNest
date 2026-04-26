import { Heart, Mail, Phone, MapPin, Instagram, Facebook, Twitter, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative mt-32 pt-24 pb-12 overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-secondary/5 to-secondary/10 -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-16 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
               <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-glow">
                  <ShieldCheck className="text-white w-6 h-6" />
               </div>
               <span className="text-2xl font-display font-black tracking-tighter">TourNest <span className="text-secondary italic">India</span></span>
            </div>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed italic">
              "Curating the finest heritage stays and soul-stirring experiences across the incredible landscape of India."
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-secondary hover:bg-secondary hover:text-white transition-all shadow-soft">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-display font-black uppercase tracking-widest text-foreground">Explore</h4>
            <ul className="space-y-4">
              {['Heritage Stays', 'Cultural Tours', 'Spiritual Journeys', 'Adventure Treks'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-secondary transition-colors font-bold text-sm">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-display font-black uppercase tracking-widest text-foreground">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-muted-foreground text-sm font-medium">
                <MapPin className="w-4 h-4 text-secondary" /> KLU boys hostel - Tulip
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm font-medium">
                <Phone className="w-4 h-4 text-secondary" /> +91 1800-TOUR-NEST
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm font-medium">
                <Mail className="w-4 h-4 text-secondary" /> tournestofc@gmail.com
              </li>
            </ul>
          </div>

          <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/30 shadow-premium relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Heart className="w-20 h-20 text-secondary" />
            </div>
            <h4 className="text-xl font-display font-black mb-4 relative">Namaste India</h4>
            <p className="text-xs text-muted-foreground mb-6 font-medium leading-relaxed relative">
              Subscribe to our newsletter for hidden gems and exclusive cultural insights.
            </p>
            <div className="flex gap-2 relative">
              <input type="text" placeholder="Email" className="bg-white/50 border-white/30 rounded-xl px-4 py-2 text-xs w-full focus:outline-none focus:ring-2 focus:ring-secondary/20" />
              <button className="bg-secondary text-white px-4 py-2 rounded-xl text-xs font-black shadow-glow">Go</button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            © 2026 TourNest India. Crafted with <Heart className="w-3 h-3 inline fill-secondary text-secondary" /> for Incredible India.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            <a href="#" className="hover:text-secondary">Privacy</a>
            <a href="#" className="hover:text-secondary">Terms</a>
            <a href="#" className="hover:text-secondary">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
