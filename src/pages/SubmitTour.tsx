import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationHeader from "@/components/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
    Compass, MapPin, 
    Camera, Utensils, Plus, Trash2, 
    CheckCircle, Sparkles, Clock, IndianRupee, Loader2, Send, AlertCircle
} from "lucide-react";
import apiClient from '@/config/axios';
import { toast } from "sonner";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/useAuth";

const SubmitTour = () => {
    const { t } = useAppContext();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        location: "",
        duration: "3 Hours",
        category: "Heritage",
        description: "",
        price: 1500,
        image: ""
    });

    const [localFoods, setLocalFoods] = useState<any[]>([
        { title: "", description: "", price: "250", rating: "4.5", image: "" }
    ]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'tour' | number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const MAX_DIM = 800;
                let { width, height } = img;
                if (width > height && width > MAX_DIM) {
                    height *= MAX_DIM / width;
                    width = MAX_DIM;
                } else if (height > MAX_DIM) {
                    width *= MAX_DIM / height;
                    height = MAX_DIM;
                }
                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);
                const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                
                if (target === 'tour') {
                    setFormData(prev => ({ ...prev, image: compressedBase64 }));
                } else {
                    const updated = [...localFoods];
                    updated[target].image = compressedBase64;
                    setLocalFoods(updated);
                }
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    const addFood = () => setLocalFoods([...localFoods, { title: "", description: "", price: "250", rating: "4.5", image: "" }]);
    const removeFood = (idx: number) => setLocalFoods(localFoods.filter((_, i) => i !== idx));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Auth Required", { description: "Please sign in to submit a tour." });
            return;
        }

        if (!formData.image) {
            toast.error("Missing Information", { description: "You must provide cover media for the experience." });
            return;
        }

        const validFoods = localFoods.filter(f => f.title.trim() !== "");
        if (validFoods.length === 0) {
            toast.error("Missing Information", { description: "You must add at least one Culinary Signature dish." });
            return;
        }

        for (let i = 0; i < validFoods.length; i++) {
            if (!validFoods[i].image || !validFoods[i].price) {
                toast.error("Missing Information", { description: `Dish "${validFoods[i].title}" is missing an image or price.` });
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const tourPayload = {
                attraction: {
                    title: formData.title,
                    location: formData.location,
                    duration: formData.duration,
                    category: formData.category,
                    description: formData.description,
                    rating: 5.0,
                    image: formData.image,
                    region: formData.location.includes(",") ? formData.location.split(",")[1].trim() : "Heritage North",
                    bestSeason: "Year-Round",
                    approved: false
                },
                foods: validFoods.map(f => ({
                    ...f,
                    price: f.price.toString()
                })),
                guideEmail: user.email
            };

            const response = await apiClient.post('/api/attractions/with-foods', tourPayload);
      
            if (response.status === 200 || response.status === 201) {
                toast.success("Experience Submitted Successfully!", {
                    description: "Your tour is now pending admin approval."
                });
                navigate("/guide-dashboard");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Submission Failed", {
                description: "Please check your network connection."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/20 selection:bg-secondary/20 font-sans">
            <NavigationHeader />
            <main className="pt-32 pb-16 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex flex-col items-center text-center space-y-6 mb-16 animate-fade-in">
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-secondary/10 rounded-full border border-secondary/20">
                            <Sparkles className="w-5 h-5 text-secondary" />
                            <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px]">Creator Studio</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-none">
                            {t("designYourTour")}
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium max-w-2xl italic">
                            {t("sharePieceOfWorld")}
                        </p>
                    </div>

                    <Card className="rounded-[4rem] border-border/50 shadow-premium overflow-hidden bg-white dark:bg-card border-t-8 border-t-secondary animate-scale-in">
                        <form onSubmit={handleSubmit} className="p-12 md:p-20 space-y-16">
                            {/* Section: Core Details */}
                            <div className="space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                                        <Compass className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-3xl font-display font-black">Experience Core</h2>
                                </div>

                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Experience Title</Label>
                                        <Input
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="h-16 rounded-2xl border-2 bg-muted/20 focus:bg-white transition-all font-bold text-lg"
                                            placeholder="e.g. Whispers of Old Varanasi"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Location Hub</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                                            <Input
                                                required
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="h-16 pl-14 rounded-2xl border-2 bg-muted/20 focus:bg-white transition-all font-bold text-lg"
                                                placeholder="City, Region"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Price (INR)</Label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                                            <Input
                                                type="number"
                                                required
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                                className="h-16 pl-12 rounded-2xl border-2 bg-muted/20 focus:bg-white transition-all font-black text-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Duration</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                                            <Input
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                className="h-16 pl-12 rounded-2xl border-2 bg-muted/20 focus:bg-white transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4 col-span-2 md:col-span-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Cover Media</Label>
                                        <div className="relative group">
                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'tour')} className="hidden" id="tour-upload" />
                                            <label htmlFor="tour-upload" className="flex items-center justify-center h-16 rounded-2xl bg-muted border-2 border-dashed border-muted-foreground/30 hover:border-secondary cursor-pointer transition-all gap-3 overflow-hidden px-4">
                                                {formData.image ? (
                                                    <div className="flex items-center gap-2 w-full truncate">
                                                        <CheckCircle className="w-5 h-5 text-secondary shrink-0" />
                                                        <span className="text-[10px] font-black uppercase truncate">Media Synced</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Camera className="w-5 h-5 text-muted-foreground" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Upload Cover</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">The Narrative</Label>
                                    <Textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="min-h-[200px] rounded-[2.5rem] border-2 bg-muted/20 focus:bg-white transition-all p-8 font-medium text-lg italic leading-relaxed shadow-inner"
                                        placeholder="Tell the story of this journey..."
                                    />
                                </div>
                            </div>

                            {/* Section: Culinary */}
                            <div className="space-y-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-nature/10 rounded-2xl flex items-center justify-center text-nature">
                                            <Utensils className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-3xl font-display font-black">Culinary Signature</h2>
                                    </div>
                                    <Button type="button" onClick={addFood} variant="ghost" className="text-secondary font-black text-[10px] uppercase tracking-widest hover:bg-secondary/5 px-6 rounded-xl">
                                        <Plus className="w-4 h-4 mr-2" /> Add Dish
                                    </Button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    {localFoods.map((food, idx) => (
                                        <div key={idx} className="p-10 bg-muted/20 rounded-[3rem] border border-border/50 space-y-6 relative group animate-scale-in">
                                            {localFoods.length > 1 && (
                                                <Button type="button" onClick={() => removeFood(idx)} variant="ghost" size="icon" className="absolute top-6 right-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            )}
                                            <div className="space-y-4">
                                                <Input
                                                    placeholder="Dish Name"
                                                    value={food.title}
                                                    onChange={(e) => {
                                                        const updated = [...localFoods];
                                                        updated[idx].title = e.target.value;
                                                        setLocalFoods(updated);
                                                    }}
                                                    className="bg-transparent border-0 border-b-2 border-border/50 rounded-none h-12 px-0 focus-visible:ring-0 focus:border-secondary font-black text-xl placeholder:text-muted-foreground/30"
                                                />
                                                <div className="flex gap-4">
                                                    <div className="relative group/upload flex-1">
                                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, idx)} className="hidden" id={`food-${idx}`} />
                                                        <label htmlFor={`food-${idx}`} className="flex items-center justify-center h-12 rounded-xl bg-white/50 border border-dashed border-muted-foreground/20 hover:border-secondary cursor-pointer transition-all gap-2 px-4 shadow-soft">
                                                            {food.image ? <CheckCircle className="w-4 h-4 text-nature" /> : <Camera className="w-4 h-4 text-muted-foreground" />}
                                                            <span className="text-[10px] font-black uppercase">Asset</span>
                                                        </label>
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        value={food.price}
                                                        onChange={(e) => {
                                                            const updated = [...localFoods];
                                                            updated[idx].price = e.target.value;
                                                            setLocalFoods(updated);
                                                        }}
                                                        className="w-24 h-12 rounded-xl border-2 bg-white/50 font-black text-center"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sticky Footer Action */}
                            <div className="pt-12 border-t-2 border-border/50 flex flex-col items-center gap-6">
                                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest italic">All submissions are reviewed within 24 hours</span>
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="h-24 px-20 rounded-[2.5rem] bg-secondary text-white font-black text-xl uppercase tracking-[0.3em] shadow-glow hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                    ) : (
                                        <>
                                            Launch Experience <Send className="w-6 h-6 ml-6 group-hover:translate-x-2 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default SubmitTour;
