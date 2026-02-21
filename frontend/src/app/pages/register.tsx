import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Code, GraduationCap, Briefcase, Eye, EyeOff } from "lucide-react";
import { authAPI } from "../../api/auth";
import { toast } from "sonner";

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"student" | "freelancer">("student");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showOTP && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [showOTP, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authAPI.register({
        name,
        email,
        password,
        role: userType,
      });

      if (data.requiresOTP) {
        toast.success("OTP sent to your email!");
        setShowOTP(true);
      } else {
        localStorage.setItem("token", data.token);
        toast.success("Registration successful!");
        if (userType === "student") {
          navigate("/student/dashboard");
        } else {
          navigate("/freelancer/dashboard");
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authAPI.verifyOTP({ email, otp });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Email verified successfully!");
      if (data.user.role === "freelancer") {
        navigate("/freelancer/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "OTP Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      setCountdown(60);
      setCanResend(false);
      setOtp("");
      await authAPI.resendOTP({ email });
      toast.success("New OTP sent!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
      setCountdown(0);
      setCanResend(true);
    } finally {
      setIsLoading(false);
    }
  };

  const primaryGradient = userType === "freelancer"
    ? "from-emerald-500 to-teal-500"
    : "from-indigo-600 to-purple-600";

  const buttonGradient = userType === "freelancer"
    ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20 hover:shadow-emerald-500/40"
    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/20 hover:shadow-indigo-600/40";

  const textColor = userType === "freelancer" ? "text-emerald-600" : "text-indigo-600";

  return (
    <div className={`h-screen w-full flex overflow-hidden bg-slate-950 relative transition-colors duration-500`}>
      {/* Background Ambience - Global */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse ${userType === "freelancer" ? "bg-emerald-600/20" : "bg-indigo-600/20"}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse delay-700 ${userType === "freelancer" ? "bg-teal-600/20" : "bg-purple-600/20"}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
      </div>

      {/* Left Side: Branding & Features */}
      <div className={`hidden lg:flex flex-col justify-between w-[40%] p-12 relative overflow-hidden`}>
        {/* Abstract Background for Branding Side */}
        <div className="absolute inset-0 z-0">
          <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-br transition-all duration-700 ${userType === 'freelancer' ? 'from-emerald-900/40 via-transparent to-teal-900/40' : 'from-indigo-950/40 via-transparent to-purple-950/40'}`} />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        </div>

        <Link to="/" className="flex items-center gap-3 relative z-10 hover:opacity-90 transition-all hover:scale-105">
          <div className={`w-12 h-12 bg-gradient-to-br ${primaryGradient} rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]`}>
            <Code className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-bold text-white tracking-tight">
            Projexly
          </span>
        </Link>

        <div className="relative z-10 max-w-lg mb-12">
          <h2 className="text-6xl font-extrabold text-white leading-[1.1] mb-8">
            Join the <br />
            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${primaryGradient} animate-gradient-x`}>
              future
            </span>
            <br />of digital work.
          </h2>
          <div className="space-y-8 mt-12">
            {[
              { icon: "🌍", title: "Global Network", desc: "Collaborate with people from all over the world." },
              { icon: "🛡️", title: "Secure Payments", desc: "Your earnings are protected with our robust payment system." },
              { icon: "🚀", title: "Instant Growth", desc: "Build your portfolio and expand your professional reach." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                  <p className="text-slate-400 text-base leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Side: Authentication Form */}
      <div className="flex-1 relative overflow-hidden">
        <div className="h-full w-full flex flex-col items-center justify-center p-4 lg:p-8 relative">
          {/* Glassmorphism Card */}
          <div className="w-full max-w-[480px] relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform transition-all duration-500 overflow-hidden group">

            {/* Refined Unique Scroll Container (No Box) */}
            <div className="relative max-h-[70vh] overflow-y-auto scroll-smooth p-6 lg:p-10 transition-all duration-300
              [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]
              [&::-webkit-scrollbar]:w-1
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-gradient-to-b
              [&::-webkit-scrollbar-thumb]:from-emerald-500/50
              [&::-webkit-scrollbar-thumb]:to-teal-500/50
              [&::-webkit-scrollbar-thumb]:rounded-full
              hover:[&::-webkit-scrollbar-thumb]:from-emerald-400
              hover:[&::-webkit-scrollbar-thumb]:to-teal-400">

              {/* Mobile Logo */}
              <Link to="/" className="flex lg:hidden items-center gap-2 justify-center mb-8">
                <div className={`w-10 h-10 bg-gradient-to-br ${primaryGradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Code className="w-6 h-6 text-white" />
                </div>
                <span className={`text-2xl font-bold text-white`}>
                  Projexly
                </span>
              </Link>

              <div className="text-center mb-6">
                <h1 className="text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight">Create Account</h1>
                <p className="text-slate-400 text-sm font-medium">Join our advanced professional platform</p>
              </div>

              {/* Role Selection - Upgraded */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setUserType("student")}
                  className={`relative overflow-hidden rounded-2xl border-2 p-5 flex flex-col items-center gap-3 transition-all duration-300 ${userType === "student"
                    ? "border-indigo-500 bg-indigo-500/10 text-white shadow-[0_0_25px_rgba(79,70,229,0.3)]"
                    : "border-white/5 hover:border-white/20 hover:bg-white/5 text-slate-400"
                    }`}
                >
                  <div className={`p-3 rounded-xl ${userType === "student" ? "bg-indigo-500 text-white" : "bg-white/10"}`}>
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm tracking-wide">STUDENT</span>
                  {userType === "student" && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />}
                </button>

                <button
                  onClick={() => setUserType("freelancer")}
                  className={`relative overflow-hidden rounded-2xl border-2 p-5 flex flex-col items-center gap-3 transition-all duration-300 ${userType === "freelancer"
                    ? "border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                    : "border-white/5 hover:border-white/20 hover:bg-white/5 text-slate-400"
                    }`}
                >
                  <div className={`p-3 rounded-xl ${userType === "freelancer" ? "bg-emerald-500 text-white" : "bg-white/10"}`}>
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm tracking-wide">FREELANCER</span>
                  {userType === "freelancer" && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                </button>
              </div>

              {showOTP ? (
                <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="text-center bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-sm text-slate-300 leading-relaxed">Verification required. We sent a 6-digit code to <br /><strong className="text-white">{email}</strong>.</p>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="otp" className="text-slate-300 font-bold ml-1">ONE-TIME PASSWORD</Label>
                    <div className="relative group">
                      <Input
                        id="otp"
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        className={`bg-white/5 border-white/10 text-white text-center text-3xl font-black tracking-[0.6em] h-16 rounded-2xl focus:ring-4 ${userType === "freelancer" ? "focus:ring-emerald-500/20 focus:border-emerald-500" : "focus:ring-indigo-500/20 focus:border-indigo-500"} transition-all placeholder:text-white/10`}
                      />
                      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 opacity-0 group-focus-within:opacity-100 pointer-events-none border-2 ${userType === "freelancer" ? "border-emerald-500/50" : "border-indigo-500/50"}`} />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    loading={isLoading}
                    className={`w-full text-white font-black text-lg h-14 rounded-2xl transition-all hover:scale-[1.03] active:scale-[0.98] ${buttonGradient} shadow-2xl`}
                  >
                    VERIFY & COMPLETE
                  </Button>
                  <div className="flex flex-col items-center gap-4 mt-6">
                    {!canResend ? (
                      <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
                          Code expires in <span className={`text-white`}>00:{countdown.toString().padStart(2, '0')}</span>
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className={`${textColor} font-black text-sm tracking-widest uppercase hover:underline hover:opacity-80 transition-all`}
                      >
                        Resend New Code
                      </button>
                    )}
                    <button type="button" onClick={() => { setShowOTP(false); setCountdown(60); setCanResend(false); }} className="text-slate-500 font-bold text-sm hover:text-white transition-colors">
                      Change email address
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="grid gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-slate-300 font-bold ml-1">FULL NAME</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={`bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-slate-600 focus:ring-4 ${userType === "freelancer" ? "focus:ring-emerald-500/20 focus:border-emerald-500" : "focus:ring-indigo-500/20 focus:border-indigo-500"} transition-all`}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-slate-300 font-bold ml-1">EMAIL ADDRESS</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-slate-600 focus:ring-4 ${userType === "freelancer" ? "focus:ring-emerald-500/20 focus:border-emerald-500" : "focus:ring-indigo-500/20 focus:border-indigo-500"} transition-all`}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="password" className="text-slate-300 font-bold ml-1">PASSWORD</Label>
                      <div className="relative group">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className={`bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-slate-600 focus:ring-4 ${userType === "freelancer" ? "focus:ring-emerald-500/20 focus:border-emerald-500" : "focus:ring-indigo-500/20 focus:border-indigo-500"} transition-all pr-12`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors duration-200"
                        >
                          {showPassword ? (
                            <Eye className="w-5 h-5 animate-in fade-in zoom-in duration-300" />
                          ) : (
                            <EyeOff className="w-5 h-5 animate-in fade-in zoom-in duration-300" />
                          )}
                        </button>
                        <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 opacity-0 group-focus-within:opacity-100 pointer-events-none border-2 ${userType === "freelancer" ? "border-emerald-500/50" : "border-indigo-500/50"}`} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mt-2">
                    <div className="relative flex items-center mt-1">
                      <input
                        type="checkbox"
                        required
                        className={`h-5 w-5 rounded-lg border-white/10 bg-white/5 ${textColor} focus:ring-offset-slate-950 transition-all cursor-pointer`}
                      />
                    </div>
                    <label className="text-sm text-slate-400 font-medium leading-tight">
                      I agree to the{" "}
                      <a href="#" className={`text-white hover:underline transition-colors`}>Terms</a> & <a href="#" className={`text-white hover:underline transition-colors`}>Privacy Policy</a>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    loading={isLoading}
                    className={`w-full text-white font-black text-lg h-12 rounded-2xl transition-all hover:scale-[1.03] active:scale-[0.98] ${buttonGradient} shadow-2xl mt-2`}
                  >
                    CREATE ACCOUNT
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-[#0f172a] px-4 text-slate-500 font-bold tracking-widest uppercase">OR CONTINUE WITH</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`}
                      className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 h-14 rounded-2xl text-white font-bold hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.95]"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <span>Google</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`}
                      className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 h-14 rounded-2xl text-white font-bold hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.95]"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      <span>GitHub</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-8 text-center pb-4">
                <p className="text-slate-500 font-bold text-sm">
                  ALREADY HAVE AN ACCOUNT?{" "}
                  <Link to="/login" className={`text-white hover:underline underline-offset-4 transition-all tracking-wide`}>
                    LOG IN
                  </Link>
                </p>
              </div>
            </div>

            {/* Submission Overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center rounded-[32px] animate-in fade-in duration-300">
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-12 h-12 border-4 ${userType === 'freelancer' ? 'border-emerald-500/20 border-t-emerald-500' : 'border-indigo-500/20 border-t-indigo-500'} rounded-full animate-spin`} />
                  <p className="text-white font-black text-sm tracking-widest animate-pulse">OPTIMIZING WORKFLOW...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
}
