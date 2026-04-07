import { useState, useEffect } from "react";
import NavigationHeader from "@/components/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, MessageSquare, Clock, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";
import { useAppContext } from "@/contexts/AppContext";

const Contact = () => {
  const { t } = useAppContext();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const contactSchema = z.object({
    name: z.string().trim().min(2, t("errName")).max(100),
    email: z.string().trim().email(t("errEmailInvalid")).max(255),
    subject: z.string().trim().min(3, t("errSubject")).max(200),
    message: z.string().trim().min(10, t("errMessage")).max(2000)
  });

  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      contactSchema.parse(formData);
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

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8082'}/api/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        }),
      });

      if (!response.ok) throw new Error('Failed to send inquiry');

      setIsSubmitting(false);
      setSubmitted(true);
      toast.success(t("msgSentSuccess"));
    } catch (error) {
      console.error('Support submission error:', error);
      setIsSubmitting(false);
      toast.error(t("errSubmitMessage"));
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 pb-20">
        <NavigationHeader />
        <div className="container mx-auto pt-40 px-4">
          <div className="max-w-md mx-auto text-center bg-white dark:bg-card p-12 rounded-[2rem] shadow-premium animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-4">{t("thankYou")}</h1>
            <p className="text-muted-foreground mb-10 leading-relaxed italic">
              {t("worldOneFamily")}
            </p>
            <Button className="w-full h-14 rounded-xl font-bold bg-primary hover:bg-primary/90" onClick={() => setSubmitted(false)}>
              {t("sendAnotherEnquiry")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <NavigationHeader />

      <main className="container mx-auto pt-40 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl font-display font-black tracking-tight text-foreground">{t("letsStartStory")}</h1>
                <p className="text-lg text-muted-foreground font-medium">{t("whetherTraveler")}</p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Mail, title: t("mailUs"), sub: "tournestofc@gmail.com" },
                  { icon: MapPin, title: t("ourHub"), sub: "Hub: KLU Vadh" },
                  { icon: Clock, title: "Available 24/7", sub: "Global Support" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 bg-white dark:bg-card rounded-2xl shadow-soft border border-border/50">
                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0 text-primary">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground font-medium">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="lg:col-span-2 border-none shadow-premium rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="text-3xl font-display font-bold">{t("yourMessage")}</CardTitle>
                <CardDescription className="text-base font-medium italic">{t("valueFeedback")}</CardDescription>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="ml-1 text-xs font-bold uppercase tracking-wider opacity-60">{t("fullName")}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-14 rounded-xl border-border/50 focus:border-primary transition-all font-medium"
                      />
                      {errors.name && <p className="text-xs text-destructive font-black">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="ml-1 text-xs font-bold uppercase tracking-wider opacity-60">{t("email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-14 rounded-xl border-border/50 focus:border-primary transition-all font-medium"
                      />
                      {errors.email && <p className="text-xs text-destructive font-black">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="ml-1 text-xs font-bold uppercase tracking-wider opacity-60">{t("labelSubject")}</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="h-14 rounded-xl border-border/50 focus:border-primary transition-all font-medium"
                    />
                    {errors.subject && <p className="text-xs text-destructive font-black">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="ml-1 text-xs font-bold uppercase tracking-wider opacity-60">{t("yourMessage")}</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="rounded-2xl border-border/50 focus:border-primary transition-all font-medium resize-none"
                    />
                    {errors.message && <p className="text-xs text-destructive font-black">{errors.message}</p>}
                  </div>

                  <Button type="submit" className="w-full h-16 rounded-2xl font-bold bg-primary text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {t("sendMyMessage")}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
