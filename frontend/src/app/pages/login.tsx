import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Code, GraduationCap, Briefcase } from "lucide-react";
import { Card } from "../components/ui/card";
import { authAPI } from "../../api/auth";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"student" | "freelancer">("student");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

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
    try {
      const data = await authAPI.login({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect strictly based on the user's actual role in the DB
      if (data.user.role === "freelancer") {
        // Freelancers can choose which dashboard to enter based on the tab they selected
        navigate(userType === "student" ? "/student/dashboard" : "/freelancer/dashboard");
      } else {
        // Students MUST go to student dashboard, regardless of which tab they clicked
        navigate("/student/dashboard");
      }
    } catch (error: any) {
      if (error.response?.status === 403 && error.response?.data?.requiresOTP) {
        setShowOTP(true);
        return;
      }
      alert(error.response?.data?.message || "Login failed");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await authAPI.verifyOTP({ email, otp });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "freelancer") {
        navigate("/freelancer/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "OTP Verification failed");
    }
  };

  const handleResendOTP = async () => {
    try {
      setCountdown(60);
      setCanResend(false);
      setOtp("");
      await authAPI.resendOTP({ email });
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to resend OTP");
      setCountdown(0);
      setCanResend(true);
    }
  };

  const primaryGradient = userType === "freelancer"
    ? "from-emerald-500 to-teal-500"
    : "from-indigo-600 to-purple-600";

  const buttonGradient = userType === "freelancer"
    ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20 hover:shadow-emerald-500/40"
    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/20 hover:shadow-indigo-600/40";

  const textColor = userType === "freelancer" ? "text-emerald-600" : "text-indigo-600";
  const focusRing = userType === "freelancer" ? "focus:border-emerald-500 focus:ring-emerald-500/20" : "focus:border-indigo-500 focus:ring-indigo-500/20";
  const selectionColor = userType === "freelancer" ? "selection:bg-emerald-500/30" : "selection:bg-indigo-500/30";

  return (
    <div className={`min-h-screen bg-background text-foreground ${selectionColor} overflow-hidden relative flex items-center justify-center p-4`}>
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-500">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse ${userType === "freelancer" ? "bg-emerald-600/10" : "bg-indigo-600/10"}`} />
        <div className={`absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full blur-[120px] ${userType === "freelancer" ? "bg-teal-600/10" : "bg-purple-600/10"}`} />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[30%] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className={`w-10 h-10 bg-gradient-to-br ${primaryGradient} rounded-xl flex items-center justify-center shadow-lg ${userType === 'freelancer' ? 'shadow-emerald-500/20' : 'shadow-indigo-500/20'}`}>
            <Code className="w-6 h-6 text-white" />
          </div>
          <span className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${primaryGradient}`}>
            Projexly
          </span>
        </Link>

        <Card className="p-8 shadow-2xl border border-slate-200 bg-white/70 backdrop-blur-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          {/* Modern Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div
              onClick={() => setUserType("student")}
              className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${userType === "student"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-100"
                : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50 text-muted-foreground"
                }`}
            >
              <div className={`p-2 rounded-full ${userType === "student" ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-muted-foreground"}`}>
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-semibold text-sm">Student</span>
            </div>

            <div
              onClick={() => setUserType("freelancer")}
              className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${userType === "freelancer"
                ? "border-purple-500 bg-purple-50 text-purple-700 shadow-lg shadow-purple-100"
                : "border-slate-200 hover:border-purple-200 hover:bg-slate-50 text-muted-foreground"
                }`}
            >
              <div className={`p-2 rounded-full ${userType === "freelancer" ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-muted-foreground"}`}>
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="font-semibold text-sm">Freelancer</span>
            </div>
          </div>

          {showOTP ? (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground">Your email is not verified.</p>
                <p className="text-sm text-muted-foreground mt-1">We sent a new 6-digit code to <strong>{email}</strong>.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-foreground">One-Time Password (OTP)</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className={`bg-white border-slate-200 text-center text-2xl tracking-[0.5em] text-foreground placeholder:text-muted-foreground ${focusRing} transition-colors h-14`}
                />
              </div>
              <Button
                type="submit"
                className={`w-full text-white font-semibold h-11 rounded-xl transition-all hover:scale-[1.02] ${buttonGradient}`}
              >
                Verify & Sign In
              </Button>
              <div className="flex flex-col items-center gap-2 mt-4 text-sm">
                {!canResend ? (
                  <p className="text-muted-foreground w-full text-center">
                    Expires in <span className={`font-bold ${textColor}`}>00:{countdown.toString().padStart(2, '0')}</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className={`${textColor} font-medium hover:underline w-full text-center`}
                  >
                    Resend OTP
                  </button>
                )}
                <button type="button" onClick={() => { setShowOTP(false); setCountdown(60); setCanResend(false); }} className="text-muted-foreground hover:underline mt-2">
                  Back to login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`bg-white border-slate-200 text-foreground placeholder:text-muted-foreground ${focusRing} transition-colors`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`bg-white border-slate-200 text-foreground placeholder:text-muted-foreground ${focusRing} transition-colors`}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className={`rounded border-slate-300 ${textColor} ${userType === 'freelancer' ? 'focus:ring-emerald-500' : 'focus:ring-indigo-500'}`} />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <a href="#" className={`${userType === 'freelancer' ? 'text-emerald-500 hover:text-emerald-400' : 'text-indigo-400 hover:text-indigo-300'} transition-colors`}>
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className={`w-full text-white font-semibold h-11 rounded-xl transition-all hover:scale-[1.02] ${buttonGradient}`}
              >
                Sign In
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-200"
                  onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-200"
                  onClick={() => window.location.href = "http://localhost:5000/api/auth/github"}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className={`${textColor} hover:opacity-80 font-medium transition-colors`}>
              Sign up
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
