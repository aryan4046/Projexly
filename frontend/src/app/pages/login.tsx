import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await authAPI.login({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on selected User Type (with validation)
      if (userType === "student") {
        // Everyone can be a student
        navigate("/student/dashboard");
      } else {
        // Only actual freelancers can access freelancer dashboard
        if (data.user.role === "freelancer") {
          navigate("/freelancer/dashboard");
        } else {
          // If a student tries to login as freelancer
          navigate("/student/dashboard");
          // Optional: Add a toast here saying "Please upgrade to Freelancer account"
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30 overflow-hidden relative flex items-center justify-center p-4">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[30%] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Code className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
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
                className="bg-white border-slate-200 text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-indigo-500/20"
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
                className="bg-white border-slate-200 text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold h-11 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all hover:scale-[1.02]"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              Sign up
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
