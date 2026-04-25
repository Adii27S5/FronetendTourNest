import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavigationHeader from "@/components/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star as StarIcon, MapPin, Clock, Utensils, MessageSquare, 
  Send, Loader2, IndianRupee, ArrowLeft, Heart, 
  Sparkles, Camera
} from "lucide-react";
import { resolveImage } from "@/lib/image-mapper";
import apiClient from "@/config/axios";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/AppContext";

const AttractionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, isFavorite, addFavorite, removeFavorite } = useAppContext();
    
    const [attraction, setAttraction] = useState<any>(null);
    const [foods, setFoods] = useState<any[]>([]);
    const [nearbyAccommodations, setNearbyAccommodations] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

    const fetchData = async () => {
        try {
            setLoading(true);
            const attrRes = await apiClient.get(`/api/attractions/${id}`);

            if (attrRes.data) {
                const attrData = attrRes.data;
                setAttraction(attrData);

                // Use the first part of the location (city) for precise filtering
                const city = attrData.location.split(',')[0].trim();
                
                const [foodsRes, reviewsRes, staysRes, hotelsRes] = await Promise.all([
                    apiClient.get(`/api/foods?location=${encodeURIComponent(city)}`),
                    apiClient.get(`/api/reviews/attraction/${id}`),
                    apiClient.get(`/api/homestays?location=${encodeURIComponent(city)}`),
                    apiClient.get(`/api/hotels?location=${encodeURIComponent(city)}`)
                ]);

                if (foodsRes.data) setFoods(foodsRes.data);
                if (reviewsRes.data) setReviews(reviewsRes.data);
                
                const combinedAcc = [
                    ...(staysRes.data || []).filter((s: any) => s.location && s.location.toLowerCase().includes(city.toLowerCase())).map((s: any) => ({ ...s, type: 'Boutique Stay' })),
                    ...(hotelsRes.data || []).filter((h: any) => h.location && h.location.toLowerCase().includes(city.toLowerCase())).map((h: any) => ({ ...h, title: h.name, type: 'Premium Hotel' }))
                ];
                setNearbyAccommodations(combinedAcc.slice(0, 4));
                
                // Also filter culinary experiences strictly
                const filteredFoods = (foodsRes.data || []).filter((f: any) => f.location && f.location.toLowerCase().includes(city.toLowerCase()));
                setFoods(filteredFoods);
            }

        } catch (error) {
            console.error("Error fetching attraction details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error(t("pleaseSignIn"));
            return;
        }

        setIsSubmittingReview(true);
        try {
            const reviewData = {
                attractionId: parseInt(id!),
                userEmail: user.email,
                userName: user.user_metadata?.full_name || user.email.split('@')[0],
                rating: newReview.rating,
                comment: newReview.comment
            };

            const response = await apiClient.post(`/api/reviews`, reviewData);

            if (response.data) {
                toast.success(t("reviewSubmitted"));
                setNewReview({ rating: 5, comment: "" });
                fetchData(); // Refresh reviews
            }
        } catch (error) {
            toast.error(t("failedToSubmitReview"));
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-secondary" />
            </div>
        );
    }

    if (!attraction) return <div className="pt-40 text-center">{t("attractionNotFound")}</div>;

    return (
        <div className="min-h-screen bg-muted/30 selection:bg-secondary/20 font-sans">
            <NavigationHeader />

            {/* Hero Section */}
            <div className="relative h-[70vh] w-full overflow-hidden">
                <img 
                    src={resolveImage(attraction.image)} 
                    className="w-full h-full object-cover animate-scale-in" 
                    alt={attraction.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-32 left-8 md:left-20 flex gap-4">
                    <Button 
                        onClick={() => navigate(-1)}
                        className="bg-white/10 backdrop-blur-md hover:bg-white/20 border-white/20 rounded-2xl h-12 px-6 flex items-center gap-2 text-white font-bold"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        {t("backToExperiences")}
                    </Button>
                    <Button 
                        onClick={() => isFavorite(id!) ? removeFavorite(id!) : addFavorite({ id: id!, type: 'attraction', data: attraction })}
                        className={`backdrop-blur-md rounded-2xl h-12 w-12 flex items-center justify-center border-white/20 transition-all ${isFavorite(id!) ? 'bg-red-500/80 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        <Heart className={`w-5 h-5 ${isFavorite(id!) ? 'fill-current' : ''}`} />
                    </Button>
                </div>

                <div className="absolute bottom-16 left-8 md:left-20 right-8">
                    <div className="max-w-4xl space-y-6">
                        <div className="flex flex-wrap gap-3">
                            <Badge className="bg-secondary text-white shadow-glow border-0 font-black uppercase tracking-widest text-xs px-4 py-1.5">
                                {attraction.category}
                            </Badge>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-white font-black text-xs">
                                <StarIcon className="w-4 h-4 fill-gold text-gold" />
                                {attraction.rating} • {reviews.length} {t("stories")}
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-display font-black text-white tracking-tighter leading-[0.8] animate-slide-up">
                            {attraction.title}
                        </h1>
                        <div className="flex items-center gap-6 text-white/80 font-bold uppercase tracking-widest text-sm">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-secondary" />
                                {attraction.location}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-secondary" />
                                {attraction.duration}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 md:px-20 -mt-10 relative z-10 pb-20">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column: Info + Foods */}
                    <div className="lg:col-span-2 space-y-16">
                        {/* Description */}
                        <Card className="rounded-[3rem] border-0 shadow-premium overflow-hidden bg-white dark:bg-card">
                            <CardContent className="p-10 md:p-16 space-y-8">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-secondary" />
                                    <h2 className="text-3xl font-display font-black">{t("aboutExperience")}</h2>
                                </div>
                                <p className="text-xl text-muted-foreground leading-relaxed italic font-medium">
                                    "{attraction.description}"
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-border/50">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t("stateLabel")}</p>
                                        <p className="text-lg font-bold">{attraction.location.split(',').pop()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">BEST SEASON</p>
                                        <p className="text-lg font-bold">{attraction.bestSeason || 'Oct - March'}</p>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t("guideProvided")}</p>
                                        <p className="text-lg font-bold">Yes</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Local Culinary Highlights Section */}
                        {foods.length > 0 && (
                            <div className="space-y-10 pt-10 border-t border-border/50">
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-widest">
                                        <Utensils className="w-3 h-3" /> {t("localFlavors")}
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight">{t("culinaryExperiences")}</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {foods.map((food) => (
                                        <div key={food.id} className="group relative flex items-center gap-6 p-6 bg-white dark:bg-card rounded-[2.5rem] shadow-soft hover:shadow-premium transition-all">
                                            <div className="w-32 h-32 rounded-3xl overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                                                <img 
                                                    src={resolveImage(food.image)} 
                                                    className="w-full h-full object-cover"
                                                    alt={food.title}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter mb-1 border-secondary/20 text-secondary">
                                                    {food.category}
                                                </Badge>
                                                <h3 className="text-xl font-display font-black leading-tight">{food.title}</h3>
                                                <p className="text-xs text-muted-foreground line-clamp-2 italic font-medium">"{food.description}"</p>
                                                <div className="flex items-center gap-3 pt-2">
                                                     <span className="text-sm font-black text-secondary">₹{food.price}</span>
                                                     <span className="text-[10px] font-bold text-gold flex items-center gap-1">
                                                          <StarIcon className="w-3 h-3 fill-gold" /> {food.rating}
                                                     </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Premier Local Stays Section */}
                        <div className="space-y-10 pt-10 border-t border-border/50">
                            <div className="flex items-end justify-between">
                                <div className="space-y-2">
                                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-widest">
                                        <MapPin className="w-3 h-3" /> {t("premierStays")}
                                   </div>
                                   <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight">{t("nearbyAccommodations")}</h2>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => navigate(`/hotels?location=${encodeURIComponent(attraction.location.split(',')[0])}`)}
                                    className="text-secondary font-black text-xs uppercase tracking-widest hover:bg-secondary/5"
                                >
                                    {t("viewAllStays")}
                                </Button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {nearbyAccommodations.length > 0 ? nearbyAccommodations.map((stay) => (
                                    <Card key={stay.id} className="group rounded-[2.5rem] border-0 shadow-soft hover:shadow-premium transition-all overflow-hidden flex flex-col">
                                        <div className="h-48 overflow-hidden relative">
                                            <img src={resolveImage(stay.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={stay.title} />
                                            <div className={`absolute top-4 right-4 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-white ${stay.type === 'Premium Hotel' ? 'bg-secondary/80' : 'bg-nature/80'}`}>
                                                {stay.type}
                                            </div>
                                        </div>
                                        <CardContent className="p-8 flex-1 flex flex-col">
                                            <h3 className="text-2xl font-display font-black mb-2 line-clamp-1">{stay.title}</h3>
                                            <p className="text-muted-foreground text-xs font-bold mb-4 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {stay.location}
                                            </p>
                                            <div className="mt-auto pt-6 border-t border-border/50 flex justify-between items-center">
                                                <span className="text-xl font-display font-black text-secondary">
                                                    ₹{stay.price} <span className="text-[10px] text-muted-foreground uppercase">{t("perNight")}</span>
                                                </span>
                                                {stay.hotelCapacityLimit && (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Capacity</span>
                                                        <span className="text-xs font-bold text-secondary">
                                                            {stay.hotelCapacityLimit} {t("guestsCount")}
                                                        </span>
                                                    </div>
                                                )}
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => navigate(stay.type === 'Premium Hotel' ? `/hotel/${stay.id}` : `/homestay/${stay.id}`)}
                                                    className="rounded-xl bg-muted/50 text-foreground font-black text-[10px] uppercase tracking-widest hover:bg-secondary hover:text-white"
                                                >
                                                    {t("bookNow")}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )) : (
                                    <div className="col-span-2 py-20 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                                         <MapPin className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                                         <p className="text-muted-foreground font-bold italic">{t("findingNearbyStays")}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Review Section */}
                    <div className="space-y-12">
                         <div className="sticky top-32 space-y-12">
                            {/* Review Section */}
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-3xl font-display font-black flex items-center gap-3">
                                        <MessageSquare className="w-7 h-7 text-secondary" />
                                        {t("travelerStories")}
                                    </h3>
                                    <Badge variant="outline" className="rounded-full border-border/50 text-muted-foreground">{reviews.length}</Badge>
                                </div>

                                {/* Review List */}
                                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {reviews.length > 0 ? reviews.map((review) => (
                                        <Card key={review.id} className="rounded-2xl border-border/50 shadow-soft overflow-hidden group">
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-secondary text-white font-black flex items-center justify-center text-sm">
                                                            {review.userName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-sm">{review.userName}</h4>
                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t("travelerLabel")}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 font-bold text-xs text-gold">
                                                        <StarIcon className="w-3 h-3 fill-gold" />
                                                        {review.rating}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed italic font-medium">
                                                    "{review.comment}"
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )) : (
                                        <p className="text-center text-muted-foreground italic py-10">{t("noStoriesYet")}</p>
                                    )}
                                </div>

                                {/* Leave a Review Form */}
                                {user ? (
                                    localStorage.getItem('user_role') === 'guide' ? (
                                        <Card className="rounded-[2.5rem] border-2 border-dashed border-secondary/20 shadow-soft bg-white/50 backdrop-blur-sm overflow-hidden">
                                            <CardContent className="p-8">
                                                <form onSubmit={handleReviewSubmit} className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("rateYourStory")}</label>
                                                        <div className="flex gap-2">
                                                            {[1,2,3,4,5].map(star => (
                                                                <button 
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${newReview.rating >= star ? 'bg-secondary text-white shadow-glow' : 'bg-muted/30 text-muted-foreground'}`}
                                                                >
                                                                    <StarIcon className={`w-5 h-5 ${newReview.rating >= star ? 'fill-current' : ''}`} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("shareYourExperience")}</label>
                                                        <textarea 
                                                            required
                                                            placeholder={t("chroniclePlaceholder")}
                                                            value={newReview.comment}
                                                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                                            className="w-full p-4 rounded-2xl bg-muted/20 border-0 outline-none transition-all font-medium text-sm resize-none italic"
                                                            rows={3}
                                                        />
                                                    </div>
                                                    <Button type="submit" disabled={isSubmittingReview} className="w-full h-14 rounded-2xl bg-secondary text-white font-black text-[10px] uppercase tracking-widest shadow-glow">
                                                        {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> {t("publishGuideReview")}</>}
                                                    </Button>
                                                </form>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="p-8 bg-muted/20 border-2 border-dotted border-muted-foreground/20 rounded-[2.5rem] text-center">
                                             <p className="text-sm font-bold text-muted-foreground italic mb-2">{t("exclusiveFeature")}</p>
                                             <p className="text-xs font-medium text-muted-foreground">{t("guideOnlyFeature")}</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="p-8 bg-muted/20 border-2 border-dotted border-muted-foreground/20 rounded-[2.5rem] text-center">
                                         <p className="text-sm font-bold text-muted-foreground italic mb-4">{t("signInToShareChronicle")}</p>
                                         <Button onClick={() => navigate(`/auth?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`)} variant="outline" className="rounded-xl font-bold uppercase tracking-widest text-[10px] border-2">Sign In</Button>
                                    </div>
                                )}
                            </div>
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AttractionDetails;
