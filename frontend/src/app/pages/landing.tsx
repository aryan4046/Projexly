import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Code, Users, ArrowRight, CheckCircle2, Rocket } from "lucide-react";
import { motion, animate } from "motion/react";
import { useState, useEffect } from "react";

// Helper component for animated numbers
function AnimatedNumber({ value }: { value: string | number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;
  const prefix = typeof value === 'string' && value.startsWith('$') ? '$' : '';
  const suffix = typeof value === 'string' && value.endsWith('+') ? '+' : (typeof value === 'string' && value.endsWith('/5') ? '/5' : '');

  useEffect(() => {
    const controls = animate(0, numericValue, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (latest: number) => setDisplayValue(Math.floor(latest * 10) / 10), // Support decimals for rating
    });
    return () => controls.stop();
  }, [numericValue]);

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
}

export function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[30%] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Code className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Projexly
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#how-it-works">How it Works</NavLink>
              <NavLink href="#testimonials">Success Stories</NavLink>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-full px-6 transition-all hover:scale-105">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-indigo-100 mb-8 backdrop-blur-sm shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-sm font-medium text-indigo-600">The #1 Platform for Student Freelancing</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
          >
            Build Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Future Today
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Connect with top student talent or find ambitious projects to launch your career.
            Projexly is where innovation meets execution.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/register">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-105">
                Start a Project <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/freelancer/browse">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-border bg-white/50 hover:bg-white text-foreground backdrop-blur-sm shadow-sm">
                Find Work
              </Button>
            </Link>
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-20 pt-10 border-t border-border"
          >
            <StatItem value="10k+" label="Active Users" />
            <StatItem value="5k+" label="Projects Done" />
            <StatItem value="$2M+" label="Paid Out" />
            <StatItem value="4.9/5" label="Average Rating" />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-24 bg-white/50 backdrop-blur-3xl border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">Why Projexly?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We've built the ultimate ecosystem for students to showcase skills and for clients to get quality work done.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="w-8 h-8 text-indigo-600" />}
              title="Verified Student Talent"
              desc="Access a curated pool of ambitious students ready to prove their skills at competitive rates."
            />
            <FeatureCard
              icon={<Rocket className="w-8 h-8 text-purple-600" />}
              title="Fast Project Turnaround"
              desc="Get your MVPs, assignments, and prototypes built faster by motivated learners."
            />
            <FeatureCard
              icon={<CheckCircle2 className="w-8 h-8 text-pink-600" />}
              title="Secure Payments"
              desc="Funds are held securely in escrow until you are 100% satisfied with the work delivered."
            />
          </div>
        </div>
      </section>

      {/* How It Works - Visual Steps */}
      <section id="how-it-works" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">Simple & Effective</h2>
          <p className="text-muted-foreground text-lg">Three steps to your next success story</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          <StepCard
            number="01"
            title="Post a Project"
            desc="Describe your vision, set a budget, and publish your requirement to our talent pool."
          />
          <StepCard
            number="02"
            title="Hire Talent"
            desc="Review proposals, check portfolios, and hire the perfect student for your needs."
          />
          <StepCard
            number="03"
            title="Get it Done"
            desc="Collaborate via chat, review files, and release payment only when satisfied."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-12 text-center relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Ready to Transform Your Ideas?</h2>
            <p className="text-indigo-200 text-xl mb-10 max-w-2xl mx-auto">
              Join the fastest-growing community of student creators and innovators today.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-indigo-900 hover:bg-gray-100 h-14 px-10 rounded-full text-lg font-bold transition-transform hover:scale-105">
                Join Projexly Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-white py-12 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100">
              <Code className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-lg font-semibold text-foreground">Projexly</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2026 Projexly Inc. Built for Students, by Students.
          </p>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
      {children}
    </a>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
        <AnimatedNumber value={value} />
      </div>
      <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-8 rounded-3xl bg-white/50 border border-slate-200 hover:border-indigo-200 hover:bg-white hover:shadow-xl transition-all group"
    >
      <div className="mb-6 p-4 rounded-2xl bg-indigo-50 w-fit group-hover:scale-110 transition-transform duration-300 border border-indigo-100">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  )
}

function StepCard({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="text-center relative z-10">
      <div className="w-16 h-16 mx-auto bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-xl font-bold text-indigo-600 mb-6 shadow-xl shadow-indigo-100">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto">{desc}</p>
    </div>
  )
}
