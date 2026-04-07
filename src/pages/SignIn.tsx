import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/config/axios";
import Captcha from "@/components/Captcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Mail, Lock, User, Loader2, ArrowLeft, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/AppContext";

const SignIn = () => {
  const { t } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = location.state?.returnUrl || new URLSearchParams(location.search).get('returnUrl');

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error(t("selectRoleToContinue"));
      return;
    }

    if (!validateEmail(email)) {
      toast.error(t("errEmailInvalid"));
      return;
    }

    setIsLoading(true);
    try {
      // Hardcoded Admin Override
      if (selectedRole === 'admin') {
        if (email === "tournestofc@gmail.com" && password === "123456") {
          toast.success(t("masterAdminGranted"));
          localStorage.setItem('user_role', 'admin');
          localStorage.setItem('user_name', 'admin');
          window.location.href = returnUrl || "/admin-dashboard";
          return;
        } else {
          toast.error("Invalid Admin Credentials");
          setIsLoading(false);
          return;
        }
      }

      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        localStorage.setItem('user_role', selectedRole);

        // Try to recover name from previous logs or set a default if not found
        const existingName = localStorage.getItem('user_name') || email.split('@')[0];
        localStorage.setItem('user_name', existingName);

        const adminReports = JSON.parse(localStorage.getItem('admin_reports') || '[]');
        const userName = localStorage.getItem('user_name') || email.split('@')[0];
        adminReports.unshift({
          id: `log_${Math.random().toString(36).substr(2, 9)}`,
          title: "User Session Started",
          user: userName,
          date: "Just now",
          type: "Activity",
          details: `Explorer ${userName} (${email}) logged into the platform as ${selectedRole}.`,
          email: email
        });
        localStorage.setItem('admin_reports', JSON.stringify(adminReports.slice(0, 50)));

        // Sync with Spring Boot Backend on login if missing
        try {
          try {
            await apiClient.get(`/api/users/email/${email}`);
          } catch (checkError: any) {
            if (checkError.response && checkError.response.status === 404) {
              console.log("User missing in backend, syncing...");
              await apiClient.post(`/api/users`, {
                name: userName,
                fullName: userName,
                email: email,
                role: selectedRole,
                joined: new Date().toLocaleDateString(),
                bookingsCount: 0,
                status: 'Active'
              });
            }
          }
        } catch (backendError) {
          console.error("Failed to sync user to backend during login:", backendError);
        }

        toast.success(`${t("welcome")} ${userName}!`);
        navigate(returnUrl || rolePaths[selectedRole as keyof typeof rolePaths]);
      } else {
        const { error } = await signUp(email, password, fullName || email.split('@')[0]);
        if (error) throw error;
        localStorage.setItem('user_role', selectedRole);
        localStorage.setItem('user_name', fullName || email.split('@')[0]);

        const userName = fullName || email.split('@')[0];
        // Sync with Spring Boot Backend
        try {
          await apiClient.post(`/api/users`, {
            name: fullName || email.split('@')[0],
            fullName: fullName || email.split('@')[0],
            email: email,
            role: selectedRole,
            joined: new Date().toLocaleDateString(),
            bookingsCount: 0,
            status: 'Active'
          });
        } catch (backendError) {
          console.error("Failed to sync user to backend:", backendError);
        }

        toast.success(`${t("signUp")} ${userName}!`);
        navigate(returnUrl || rolePaths[selectedRole as keyof typeof rolePaths]);
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const rolePaths = {
    tourist: "/tourist-dashboard",
    host: "/host-dashboard",
    guide: "/guide-dashboard",
    admin: "/admin-dashboard"
  };

  const roles = [
    {
      id: "tourist",
      title: t("roleTourist"),
      description: t("discoverGems"),
      icon: User,
      color: "border-secondary text-secondary bg-secondary/5"
    },
    {
      id: "host",
      title: t("roleHost"),
      description: t("hostDesc"),
      icon: Home,
      color: "border-nature text-nature bg-nature/5"
    },
    {
      id: "guide",
      title: t("roleGuide"),
      description: t("guideToursAuth"),
      icon: Sparkles,
      color: "border-primary text-primary bg-primary/5"
    },
    {
      id: "admin",
      title: t("roleAdmin"),
      description: t("adminDesc"),
      icon: ShieldCheck,
      color: "border-gray-500 text-gray-500 bg-gray-500/5"
    }
  ];

  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["" ,"", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (forgotPasswordStep === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [forgotPasswordStep, resendTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetOtp = otpDigits.join("");

  const handleOtpDigit = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value.slice(-1);
    setOtpDigits(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(resetEmail)) {
      toast.error(t("errEmailInvalid"));
      return;
    }
    setIsResetLoading(true);
    try {
      if (forgotPasswordStep === 1) {
        await apiClient.post(`/api/users/forgot-password`, { email: resetEmail });
        toast.success("OTP sent! Check your inbox.");
        setForgotPasswordStep(2);
        setResendTimer(120);
      } else if (forgotPasswordStep === 2) {
        if (resetOtp.length < 6) { toast.error("Enter all 6 digits"); setIsResetLoading(false); return; }
        await apiClient.post(`/api/users/verify-otp`, { email: resetEmail, otp: resetOtp });
        toast.success("OTP Verified! Create your new password.");
        setForgotPasswordStep(3);
      } else if (forgotPasswordStep === 3) {
        if (resetNewPassword.length < 6) { toast.error("Password must be at least 6 characters"); setIsResetLoading(false); return; }
        if (resetNewPassword !== resetConfirmPassword) { toast.error("Passwords do not match"); setIsResetLoading(false); return; }
        await apiClient.post(`/api/users/reset-password`, { email: resetEmail, otp: resetOtp, newPassword: resetNewPassword });
        toast.success("Password reset successfully! Please login.");
        setIsForgotPasswordOpen(false);
        setForgotPasswordStep(1);
        setResetEmail("");
        setOtpDigits(["", "", "", "", "", ""]);
        setResetNewPassword("");
        setResetConfirmPassword("");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to process request");
    } finally {
      setIsResetLoading(false);
    }
  };

  const getRoleTranslation = (roleId: string) => {
    switch(roleId) {
      case 'tourist': return t('roleTourist');
      case 'host': return t('roleHost');
      case 'guide': return t('roleGuide');
      case 'admin': return t('roleAdmin');
      default: return roleId;
    }
  };

  if (isForgotPasswordOpen) {
    const steps = [
      { num: 1, label: "Email" },
      { num: 2, label: "OTP Code" },
      { num: 3, label: "New Password" },
    ];
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-tricolor opacity-5" />
        {/* Blurred orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-scale-in">
          <div className="bg-white/80 dark:bg-card/60 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-premium border border-border/40 relative overflow-hidden">
            {/* Top gradient bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-secondary via-primary to-nature" />

            {/* Back button */}
            <button
              onClick={() => { setIsForgotPasswordOpen(false); setForgotPasswordStep(1); }}
              className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold group bg-transparent border-0 p-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </button>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mb-10">
              {steps.map((step, i) => (
                <div key={step.num} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 transition-all ${
                    forgotPasswordStep > step.num ? 'text-green-500' :
                    forgotPasswordStep === step.num ? 'text-secondary' : 'text-muted-foreground/40'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                      forgotPasswordStep > step.num ? 'bg-green-500 border-green-500 text-white' :
                      forgotPasswordStep === step.num ? 'bg-secondary border-secondary text-white scale-110' :
                      'border-muted-foreground/30 text-muted-foreground/40'
                    }`}>
                      {forgotPasswordStep > step.num ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                    </div>
                    <span className="text-xs font-bold hidden sm:inline">{step.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-px w-8 transition-all ${
                      forgotPasswordStep > step.num ? 'bg-green-400' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <h2 className="text-3xl font-display font-black tracking-tight mb-1">
              {forgotPasswordStep === 1 && "Forgot Password"}
              {forgotPasswordStep === 2 && "Enter OTP Code"}
              {forgotPasswordStep === 3 && "Create New Password"}
            </h2>
            <p className="text-muted-foreground mb-8 text-sm">
              {forgotPasswordStep === 1 && "We'll send a 6-digit code to your email address."}
              {forgotPasswordStep === 2 && `Code sent to ${resetEmail}. Check your inbox (and spam).`}
              {forgotPasswordStep === 3 && "Almost done! Set a strong new password."}
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-6">
              {forgotPasswordStep === 1 && (
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-secondary transition-all font-bold"
                      required
                    />
                  </div>
                </div>
              )}

              {forgotPasswordStep === 2 && (
                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">6-Digit OTP</Label>
                  {/* Premium 6-box OTP input */}
                  <div className="flex gap-3 justify-center">
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpDigit(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        onFocus={e => e.target.select()}
                        className={`w-12 h-14 rounded-2xl text-center text-2xl font-black border-2 transition-all duration-200 outline-none bg-muted/30
                          ${ digit ? 'border-secondary bg-secondary/5 text-secondary scale-105' : 'border-border/60 hover:border-secondary/40 focus:border-secondary focus:bg-secondary/5' }
                        `}
                      />
                    ))}
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    Didn't receive it?{" "}
                    {resendTimer > 0 ? (
                      <span className="font-black text-muted-foreground">
                        Resend in {formatTimer(resendTimer)}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await apiClient.post(`/api/users/forgot-password`, { email: resetEmail });
                            toast.success("New OTP sent!");
                            setOtpDigits(["", "", "", "", "", ""]);
                            setResendTimer(120);
                            otpRefs.current[0]?.focus();
                          } catch { toast.error("Failed to resend"); }
                        }}
                        className="font-black text-secondary hover:underline bg-transparent border-0 p-0 cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </p>
                </div>
              )}

              {forgotPasswordStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        className="pl-12 pr-14 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-secondary transition-all font-bold"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(s => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-secondary bg-transparent border-0 p-0 cursor-pointer"
                      >
                        {showNewPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Confirm Password</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Repeat new password"
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        className={`pl-12 h-14 rounded-2xl bg-muted/30 border-2 transition-all font-bold ${
                          resetConfirmPassword && resetNewPassword !== resetConfirmPassword ? 'border-destructive focus:border-destructive' : 'border-transparent focus:border-secondary'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Password strength bar */}
                  <div className="flex gap-1 mt-2">
                    {[6, 10, 14].map((minLen, i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                        resetNewPassword.length >= minLen
                          ? i === 0 ? 'bg-red-400' : i === 1 ? 'bg-yellow-400' : 'bg-green-400'
                          : 'bg-muted'
                      }`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{resetNewPassword.length < 6 ? "Too short" : resetNewPassword.length < 10 ? "Fair" : resetNewPassword.length < 14 ? "Good" : "Strong 💪"}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isResetLoading}
                className="w-full h-14 rounded-2xl bg-secondary text-white font-black text-lg shadow-glow hover:scale-[1.02] active:scale-[0.99] transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isResetLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : forgotPasswordStep === 1 ? (
                  <><Mail className="w-5 h-5" /> Send OTP</>
                ) : forgotPasswordStep === 2 ? (
                  <><ShieldCheck className="w-5 h-5" /> Verify OTP</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> Reset Password</>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden selection:bg-secondary/20 font-sans">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-tricolor opacity-5" />
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 relative z-10">
        <div className="space-y-8 animate-slide-up">
          <div className="space-y-4">
            <button 
              onClick={() => navigate(-1)} 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold group bg-transparent border-0 p-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t("backToHome")}
            </button>
            <h1 className="text-4xl md:text-5xl font-display font-black text-foreground tracking-tighter">
              {t("chooseIdentity")} <br />
              <span className="text-secondary italic">{t("identity")}</span>
            </h1>
            <p className="text-muted-foreground font-medium">{t("selectExperience")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roles.map((role) => (
              <Card
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`cursor-pointer transition-all duration-300 rounded-[2rem] border-2 shadow-soft hover:shadow-premium group overflow-hidden ${selectedRole === role.id
                  ? `border-primary bg-card`
                  : 'border-border grayscale hover:grayscale-0 bg-card/50'
                  }`}
              >
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${selectedRole === role.id ? 'bg-secondary text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                    <role.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">{role.title}</h3>
                    <p className="text-xs font-medium text-muted-foreground">{role.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className={`animate-scale-in delay-200 ${!selectedRole ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <div className="bg-white dark:bg-card/50 backdrop-blur-xl p-10 rounded-[3rem] shadow-premium border border-border/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary via-white to-nature" />
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-black tracking-tight">
                  {isLogin ? t("welcomeBack") : t("startJourneyAuth")}
                </h2>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest italic">
                  {selectedRole ? `${t("asA")} ${getRoleTranslation(selectedRole)}` : t("selectRoleToContinue")}
                </p>
              </div>
              <form onSubmit={handleAuth} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2 animate-fade-in">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">{t("fullName")}</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={t("placeholderName")}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-secondary transition-all font-bold"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">{t("email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder={t("placeholderEmail")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-secondary transition-all font-bold"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">{t("password")}</Label>
                    {isLogin && (
                      <button 
                        type="button" 
                        onClick={() => setIsForgotPasswordOpen(true)}
                        className="text-xs font-bold text-secondary hover:text-primary transition-colors"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder={t("placeholderPassword")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-secondary transition-all font-bold"
                      required
                    />
                  </div>
                </div>
                <Captcha onVerify={setIsVerified} />
                <Button
                  type="submit"
                  disabled={isLoading || !isVerified}
                  className="w-full h-16 rounded-2xl bg-secondary text-white font-black text-lg shadow-glow hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {isLogin ? t("signIn") : t("signUp")}
                    </>
                  )}
                </Button>
              </form>
              <div className="text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm font-bold text-muted-foreground hover:text-secondary transition-colors italic"
                >
                  {isLogin ? t("newExplorer") : t("alreadyHaveIdentity")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
