import { Star, Quote, MapPin } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Rohan Malhotra",
      location: "Mumbai, Maharashtra",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "The homestay in Munnar was breathtaking. Staying amidst tea gardens and having 'Appam and Stew' made by Biju's family was an experience no 5-star hotel could ever match. Pure soul of Bharat!",
      trip: "Munnar Tea Trail"
    },
    {
      name: "Ananya Sharma",
      location: "Delhi, NCR",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "As a solo explorer, I felt so safe at the Jaipur Haveli. The hosts treated me like their own daughter, even teaching me how to make traditional Gatte ki Sabzi. Best trip of my life!",
      trip: "Jaipur Heritage Walk"
    },
    {
      name: "Karthik Raja",
      location: "Bengaluru, Karnataka",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Waking up to the sound of temple bells in Varanasi and having a direct view of the Ganga from my balcony was spiritual. The local insights shared by our host were invaluable.",
      trip: "Kashi Spiritual Journey"
    }
  ];

  return (
    <section className="py-32 px-4 bg-white dark:bg-card/20 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-nature/5 rounded-full blur-[100px]" />

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-5xl md:text-7xl font-display font-black text-foreground tracking-tighter leading-none">
            Anubhav <span className="text-primary italic">Stories.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Real stories from travelers who chose to stay local and explore the authentic heart of India.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-muted/30 rounded-[3.5rem] p-10 shadow-soft hover:shadow-premium transition-all hover:-translate-y-3 group animate-slide-up border border-border/50 flex flex-col"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Quote & Rating */}
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-glow">
                  <Quote className="w-6 h-6 fill-current" />
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
              </div>

              <p className="text-foreground font-medium text-lg leading-relaxed italic mb-8 flex-1">
                "{testimonial.text}"
              </p>

              {/* Trip Badge */}
              <div className="mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-card/50 text-xs font-black uppercase tracking-widest text-primary rounded-full shadow-soft border border-primary/10">
                  <MapPin className="w-3 h-3" />
                  {testimonial.trip}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-8 border-t border-border/50">
                <div className="relative">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/20 shadow-soft"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-nature rounded-full border-2 border-white" />
                </div>
                <div>
                  <h4 className="font-black text-foreground text-sm">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-muted-foreground font-bold">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
