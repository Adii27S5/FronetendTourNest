import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import NavigationHeader from "@/components/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/config/api";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, MapPin, Bed, IndianRupee, Loader2, CheckCircle, Sparkles, Camera } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/config/axios";
import { z } from "zod";
import { useAppContext } from "@/contexts/AppContext";

const BecomeHost = () => {
  const { t } = useAppContext();
  
  const hostSchema = z.object({
    propertyName: z.string().trim().min(3, t("errPropertyName")).max(100),
    propertyType: z.string().min(1, t("errPropertyType")),
    propertyLocation: z.string().trim().min(3, t("errLocation")).max(200),
    propertyDescription: z.string().trim().min(20, t("errDescription")).max(2000),
    numRooms: z.number().min(1, t("errRooms")).max(50),
    pricePerNight: z.number().min(800, t("errPrice")).max(100000)
  });

  const amenitiesList = [
    { id: "WiFi", key: "amenity_wifi" },
    { id: "Kitchen", key: "amenity_kitchen" },
    { id: "Parking", key: "amenity_parking" },
    { id: "Air Conditioning", key: "amenity_ac" },
    { id: "Power Backup", key: "amenity_power" },
    { id: "Traditional Meals", key: "amenity_meals" },
    { id: "Garden", key: "amenity_garden" },
    { id: "Balcony", key: "amenity_balcony" },
    { id: "Temple View", key: "amenity_temple" },
    { id: "Mountain View", key: "amenity_mountain" },
    { id: "Pet Friendly", key: "amenity_pets" }
  ];

  const stayTypes = [
    { id: "haveli", label: t("haveli") },
    { id: "houseboat", label: t("houseboat") },
    { id: "villa", label: t("villa") },
    { id: "cottage", label: t("cottage") },
    { id: "apartment", label: t("apartment") },
    { id: "farm", label: t("farm") }
  ];

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    propertyName: "",
    propertyType: "",
    propertyLocation: "",
    propertyDescription: "",
    numRooms: 1,
    pricePerNight: 2000,
    amenities: [] as string[],
    image: ""
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error(t("toastSignInRequired"), {
        description: t("msgSignInToBecomeHost")
      });
      navigate("/auth");
    }
  }, [user, authLoading, navigate, toast, t]);

  useEffect(() => {
    const fetchExistingData = async () => {
      if (!editId) return;
      
      try {
        const response = await apiClient.get(`/api/homestays/${editId}`);
        if (response.data) {
          const data = response.data;
          setFormData({
            propertyName: data.title,
            propertyType: (data.category || "").toLowerCase(),
            propertyLocation: data.location,
            propertyDescription: data.description || "",
            numRooms: data.bedrooms || 1,
            pricePerNight: data.price || 2000,
            amenities: data.amenities || [],
            image: data.image || ""
          });
        }
      } catch (error) {
        console.error("Error fetching detailed data:", error);
      }
    };
    
    fetchExistingData();
  }, [editId]);

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, amenities: [...formData.amenities, amenityId] });
    } else {
      setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenityId) });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setFormData(prev => ({ ...prev, image: compressedBase64 }));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      hostSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) fieldErrors[error.path[0] as string] = error.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    if (!user) {
      toast.error(t("toastError"), {
        description: t("loginToReserve")
      });
      return;
    }
    if (!formData.image) {
      toast.error("Missing Information", { description: "You must upload a property photo." });
      return;
    }

    if (formData.amenities.length === 0) {
      toast.error("Missing Information", { description: "Please select at least one premium amenity." });
      return;
    }

    setIsSubmitting(true);
    
    const homestayData = {
      image: formData.image, 
      title: formData.propertyName,
      location: formData.propertyLocation,
      rating: 5.0,
      price: formData.pricePerNight,
      host: user.email || "Owner",
      guests: formData.numRooms * 2,
      bedrooms: formData.numRooms,
      bathrooms: Math.max(1, Math.floor(formData.numRooms / 2)),
      amenities: formData.amenities,
      category: formData.propertyType.charAt(0).toUpperCase() + formData.propertyType.slice(1),
      maxCapacity: formData.numRooms * 4,
      description: formData.propertyDescription,
      region: formData.propertyLocation.includes(",") ? formData.propertyLocation.split(",")[1].trim() : "Heritage",
      bestSeason: "Year-Round"
    };

    try {
      const response = editId 
        ? await apiClient.put(`/api/homestays/${editId}`, homestayData)
        : await apiClient.post(`/api/homestays`, { ...homestayData, approved: false });

      if (response.status === 200 || response.status === 201) {
        setIsSubmitting(false);
        setSubmitted(true);
        toast.success(editId ? "Property Updated" : "Application Received", {
          description: editId ? "Your changes are now live." : "Your property is pending review."
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
      toast.error("Submission Failed", {
        description: "Check your connection and try again."
      });
    }

  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/20 selection:bg-secondary/20 font-sans">
        <NavigationHeader />
        <div className="pt-32 pb-20 px-4 flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center bg-white dark:bg-card p-12 rounded-[3.5rem] shadow-premium border border-border/50 animate-scale-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-tricolor" />
            <div className="w-24 h-24 bg-nature/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle className="w-12 h-12 text-nature" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-foreground mb-6 tracking-tight">
              {t("applicationReceived")}
            </h1>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed italic px-6">
              {t("atithiDevoBhava")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" className="flex-1">
                <Button size="lg" className="w-full h-16 rounded-2xl bg-foreground text-background font-black text-xs uppercase tracking-widest hover:bg-secondary hover:text-white transition-all">
                  {t("backToHub")}
                </Button>
              </Link>
              <Link to="/host-dashboard" className="flex-1">
                <Button size="lg" className="w-full h-16 rounded-2xl bg-secondary text-white font-black text-xs uppercase tracking-widest shadow-glow hover:scale-105 transition-transform">
                  {t("goToDashboard")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 selection:bg-secondary/20 font-sans">
      <NavigationHeader />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/5 rounded-full">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-secondary font-black tracking-[0.2em] uppercase text-[10px]">{editId ? t("updateHeritage") : t("shareYourHeritage")}</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black text-foreground tracking-tighter leading-none">
              {editId ? t("editLabel") : t("becomeHost")}<span className="text-secondary italic ml-4">{t("asA")} {t("roleHost")}</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed italic">
              {editId ? t("refineStory") : t("joinMovement")}
            </p>
          </div>

          <Card className="shadow-premium border border-border/50 rounded-[4rem] overflow-hidden bg-white dark:bg-card/50 backdrop-blur-md animate-scale-in">
            <div className="p-12 md:p-16 space-y-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-black flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                    <Home className="w-6 h-6" />
                  </div>
                  {t("propertyStory")}
                </h2>
                <p className="text-muted-foreground font-medium pl-16">
                  {t("tellUsHome")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <Label htmlFor="propertyName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("labelPropertyName")}</Label>
                    <Input
                      id="propertyName"
                      placeholder={t("placeholderPropertyName")}
                      value={formData.propertyName}
                      onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                      className="h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-secondary focus:bg-white transition-all font-bold text-lg"
                    />
                    {errors.propertyName && <p className="text-xs text-destructive font-bold ml-2">{errors.propertyName}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="propertyType" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("stayType")}</Label>
                    <Select value={formData.propertyType} onValueChange={(value) => setFormData({ ...formData, propertyType: value })}>
                      <SelectTrigger className="h-16 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-secondary focus:bg-white transition-all font-bold text-lg">
                        <SelectValue placeholder={t("selectType")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {stayTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.propertyType && <p className="text-xs text-destructive font-bold ml-2">{errors.propertyType}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="propertyLocation" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("locationPin")}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                    <Input
                      id="propertyLocation"
                      placeholder={t("placeholderLocation")}
                      value={formData.propertyLocation}
                      onChange={(e) => setFormData({ ...formData, propertyLocation: e.target.value })}
                      className="h-16 pl-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-secondary focus:bg-white transition-all font-bold text-lg"
                    />
                  </div>
                  {errors.propertyLocation && <p className="text-xs text-destructive font-bold ml-2">{errors.propertyLocation}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="propertyDescription" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("theStory")}</Label>
                  <Textarea
                    id="propertyDescription"
                    placeholder={t("placeholderDescription")}
                    rows={6}
                    value={formData.propertyDescription}
                    onChange={(e) => setFormData({ ...formData, propertyDescription: e.target.value })}
                    className="rounded-[2.5rem] bg-muted/30 border-2 border-transparent focus:border-secondary focus:bg-white transition-all font-medium p-8 resize-none text-lg leading-relaxed shadow-inner"
                  />
                  {errors.propertyDescription && <p className="text-xs text-destructive font-bold ml-2">{errors.propertyDescription}</p>}
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Property Media</Label>
                  <div className="relative group">
                    <input type="file" accept="image/*" className="hidden" id="property-image" onChange={handleImageChange} />
                    <label htmlFor="property-image" className="flex flex-col items-center justify-center w-full h-64 rounded-[3rem] bg-muted/20 border-2 border-dashed border-muted-foreground/30 hover:border-secondary transition-all cursor-pointer overflow-hidden relative">
                      {formData.image ? (
                        <img src={formData.image} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                          <span className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Upload Property Photo</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <Label htmlFor="numRooms" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("roomsForGuests")}</Label>
                    <div className="relative">
                      <Bed className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                      <Input
                        id="numRooms"
                        type="number"
                        min={1}
                        max={50}
                        value={formData.numRooms}
                        onChange={(e) => setFormData({ ...formData, numRooms: parseInt(e.target.value) || 1 })}
                        className="h-16 pl-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-secondary focus:bg-white transition-all font-bold text-lg"
                      />
                    </div>
                    {errors.numRooms && <p className="text-xs text-destructive font-bold ml-2">{errors.numRooms}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="pricePerNight" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t("pricePerNightInr")}</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-nature font-black" />
                      <Input
                        id="pricePerNight"
                        type="number"
                        min={800}
                        value={formData.pricePerNight}
                        onChange={(e) => setFormData({ ...formData, pricePerNight: parseInt(e.target.value) || 800 })}
                        className="h-16 pl-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-secondary focus:bg-white transition-all font-bold text-lg"
                      />
                    </div>
                    {errors.pricePerNight && <p className="text-xs text-destructive font-bold ml-2">{errors.pricePerNight}</p>}
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                  <Label className="uppercase tracking-widest text-[10px] font-black text-muted-foreground ml-2">{t("premiumAmenities")}</Label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {amenitiesList.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-4 p-5 bg-muted/20 rounded-[1.5rem] hover:bg-muted/40 transition-all cursor-pointer group border border-transparent hover:border-secondary/20 shadow-soft">
                        <Checkbox
                          id={amenity.id}
                          checked={formData.amenities.includes(amenity.id)}
                          onCheckedChange={(checked) => handleAmenityChange(amenity.id, checked as boolean)}
                          className="w-5 h-5 rounded-lg border-secondary/20 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                        />
                        <Label htmlFor={amenity.id} className="text-sm font-black cursor-pointer transition-colors group-hover:text-secondary uppercase tracking-widest text-[11px]">
                          {t(amenity.key as any)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-10">
                  <Button type="submit" className="w-full h-20 rounded-3xl font-black text-xs uppercase tracking-[0.3em] bg-secondary text-white shadow-glow hover:scale-[1.02] transition-transform active:scale-95" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : null}
                    {editId ? t("submitChanges") : t("submitApplication")}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BecomeHost;
