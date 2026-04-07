import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavigationHeader from "@/components/NavigationHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Compass, Sparkles, MapPin, Plus, Settings,
    MessageSquare, ArrowUpRight, BarChart, Users,
    X, IndianRupee, Loader2, Camera, Utensils, Trash2
} from "lucide-react";
import apiClient from '@/config/axios';
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/useAuth";

const GuideDashboard = () => {
    const { t } = useAppContext();
    const { toast } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [experiences, setExperiences] = useState<any[]>([]);

    const fetchExperiences = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/api/attractions`);
            if (response.data) {
                setExperiences(response.data);
            }
        } catch (error) {
            console.error("Error fetching experiences:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExperiences();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/20 selection:bg-secondary/20 font-sans">
            <NavigationHeader />
            <main className="pt-32 pb-16 px-6 font-sans">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-8">
                        <div className="space-y-4 animate-slide-up">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/5 rounded-full">
                                <Sparkles className="w-4 h-4 text-secondary" />
                                <span className="text-secondary font-black uppercase tracking-[0.2em] text-[10px]">{t("guideStoryStudio")}</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-foreground leading-none">
                                {t("yourStoryTitle")} <br />
                                <span className="text-secondary italic">{t("studio")}</span>
                            </h1>
                        </div>
                        <Button
                            onClick={() => navigate('/submit-tour')}
                            className="h-16 px-10 rounded-2xl bg-secondary text-white font-black text-xs uppercase tracking-widest shadow-glow hover:scale-105 transition-transform flex items-center gap-3 animate-scale-in"
                        >
                            <Plus className="w-6 h-6" />
                            {t("createNewTour")}
                        </Button>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-1 space-y-6 animate-slide-up delay-100">
                            <Card className="rounded-[2.5rem] border-border/50 shadow-soft overflow-hidden group hover:shadow-premium transition-all">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-12 bg-nature rounded-2xl flex items-center justify-center text-white shadow-glow">
                                            <BarChart className="w-6 h-6" />
                                        </div>
                                        <ArrowUpRight className="w-6 h-6 text-muted-foreground opacity-30" />
                                    </div>
                                    <div>
                                        <h4 className="text-4xl font-display font-black">₹42.5K</h4>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{t("earningsMonth")}</p>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-nature w-[70%]" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2.5rem] border-border/50 shadow-soft overflow-hidden group hover:shadow-premium transition-all">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-white shadow-glow">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <ArrowUpRight className="w-6 h-6 text-muted-foreground opacity-30" />
                                    </div>
                                    <div>
                                        <h4 className="text-4xl font-display font-black">1.2K</h4>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{t("peopleGuided")}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-3 space-y-8 animate-scale-in delay-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-display font-black">{t("activeExperiences")}</h2>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" className="rounded-xl border-border/50"><Settings className="w-5 h-5 text-muted-foreground" /></Button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {experiences.map((exp) => (
                                    <Card key={exp.id} className="group overflow-hidden rounded-[3rem] border-border/50 shadow-soft hover:shadow-premium transition-all border-2 hover:border-secondary/20 bg-white dark:bg-card">
                                        <CardContent className="p-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                                                    <Compass className="w-8 h-8" />
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    exp.approved ? 'bg-secondary/10 text-secondary' : 'bg-gold/10 text-gold animate-pulse'
                                                }`}>
                                                    {exp.approved ? 'Live' : 'Pending Approval'}
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-10">
                                                <h3 className="text-3xl font-display font-black leading-tight group-hover:text-secondary transition-colors line-clamp-2">{exp.title}</h3>
                                                <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold">
                                                    <MapPin className="w-4 h-4 text-secondary" />
                                                    {exp.location}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-border/50">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t("totalBookings")}</p>
                                                    <p className="text-2xl font-display font-black">{exp.bookings || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t("guideReward")}</p>
                                                    <p className="text-2xl font-display font-black text-secondary">₹{exp.price}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 mt-10">
                                                <Button 
                                                    onClick={() => navigate(`/attraction/${exp.id}`)}
                                                    className="flex-1 h-14 rounded-2xl bg-secondary text-white font-black text-xs uppercase tracking-widest shadow-glow hover:scale-105 transition-transform active:scale-95"
                                                >
                                                    {t("manageExperience")}
                                                </Button>
                                                <Button variant="ghost" className="h-14 w-15 rounded-2xl hover:bg-muted/50">
                                                    <MessageSquare className="w-6 h-6 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GuideDashboard;
