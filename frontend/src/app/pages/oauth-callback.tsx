import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Code } from "lucide-react";

export function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        const userStr = searchParams.get("user");

        if (token && userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));

                if (!user.isVerified) {
                    // Redirect to login with OTP required state
                    navigate(`/login?email=${encodeURIComponent(user.email)}&requiresOTP=true`, { replace: true });
                    return;
                }

                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));

                if (user.role === "freelancer") {
                    navigate("/freelancer/dashboard", { replace: true });
                } else {
                    navigate("/student/dashboard", { replace: true });
                }
            } catch (err) {
                console.error("Failed to parse user data from oauth callback");
                navigate("/login", { replace: true });
            }
        } else {
            navigate("/login", { replace: true });
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
                    <Code className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-foreground animate-pulse">Verifying Access...</h2>
                <p className="text-muted-foreground text-sm">Please wait while we log you in securely.</p>
            </div>
        </div>
    );
}
