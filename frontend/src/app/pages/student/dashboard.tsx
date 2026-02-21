import { useState, useEffect } from "react";
import { Skeleton } from "../../components/ui/skeleton";
import { projectAPI } from "../../../api/projects";
import { orderAPI } from "../../../api/orders";
import { authAPI } from "../../../api/auth";
import { gigAPI } from "../../../api/gigs"; // Import gigAPI
import { GigCard } from "../../components/gig-card"; // Import GigCard
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { motion, animate } from "motion/react";
import {
  LayoutDashboard,
  Plus,
  Clock,
  FileText,
  DollarSign,
  Sparkles,
  ArrowRight,
  Briefcase,
  MessageSquare,
  Search
} from "lucide-react";
import { toast } from "sonner";

import { studentNavItems as navItems } from "../../../config/navigation";

export function StudentDashboard() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [recommendedGigs, setRecommendedGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [skills, setSkills] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userInfo = await authAPI.getMe();
      setUser(userInfo);

      const [projectsData, ordersData, gigsData] = await Promise.all([
        projectAPI.getMyProjects(),
        orderAPI.getMyOrders(),
        gigAPI.getAll({ sort: 'newest' }) // Fetch new gigs for recommendation
      ]);

      setProjects(projectsData);

      // Filter orders where I am the buyer
      const myOrders = ordersData.filter((o: any) => o.buyer._id === userInfo._id);
      setOrders(myOrders);

      // Set recommended gigs (taking first 4)
      setRecommendedGigs(gigsData.slice(0, 4));

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      toast.error("Failed to load dashboard info");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await projectAPI.create({
        title,
        description,
        budget: Number(budget),
        deadline,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setDialogOpen(false);
      toast.success("Project posted successfully!");
      fetchData(); // Refresh list
      // Reset form
      setTitle("");
      setDescription("");
      setBudget("");
      setDeadline("");
      setSkills("");
    } catch (error) {
      console.error("Failed to create project", error);
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeOrders = orders.filter((o: any) => o.status === 'active');
  const totalSpent = orders.reduce((sum, o) => sum + o.price, 0);
  const activeProjects = projects.filter((p: any) => p.status === 'open' || p.status === 'active');
  const recentProjects = projects.slice(0, 3);

  // Calculate total proposals received across all projects
  const totalProposals = projects.reduce((sum, p) => sum + (p.proposalsCount || 0), 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };



  if (loading) {
    return (
      <DashboardLayout navItems={navItems} userType="student" theme="indigo">
        <div className="min-h-screen space-y-8 pb-10">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64 rounded-xl" />
              <Skeleton className="h-4 w-96 rounded-lg" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32 rounded-full" />
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-2xl" />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-8">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={navItems} userType="student" theme="indigo">
      <div className="min-h-screen bg-none space-y-8 pb-10">

        {/* Personalized Header */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
          >
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
                {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{user?.name?.split(' ')[0] || 'Student'}</span> 👋
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl">
                Here's what's happening with your projects today. You have {activeOrders.length} active orders and {activeProjects.length} open projects.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="rounded-full shadow-sm" onClick={() => navigate("/messages")}>
                <MessageSquare className="w-4 h-4 mr-2" /> Messages
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="rounded-full shadow-lg shadow-indigo-200 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all hover:scale-105">
                    <Plus className="w-5 h-5 mr-2" /> Post New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Post a New Project</DialogTitle>
                    <DialogDescription>Find the perfect freelancer for your next big idea.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateProject} className="space-y-6 mt-4">
                    {/* Form content same as before but styled if needed */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Project Title</Label>
                        <Input id="title" placeholder="e.g. Build a Mobile App" value={title} onChange={(e) => setTitle(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Describe your project..." value={description} onChange={(e) => setDescription(e.target.value)} required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="budget">Budget ($)</Label>
                          <Input id="budget" type="number" placeholder="5000" value={budget} onChange={(e) => setBudget(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deadline">Deadline</Label>
                          <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} className="cursor-pointer" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="skills">Skills (comma-separated)</Label>
                        <Input id="skills" placeholder="React, Node.js" value={skills} onChange={(e) => setSkills(e.target.value)} />
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                      <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20">
                        {isSubmitting ? "Posting..." : "Post Project"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Projects"
            value={projects.length}
            icon={<LayoutDashboard className="w-6 h-6" />}
            trend={`${activeProjects.length} active`}
            colorName="blue"
            delay={0.1}
          />
          <StatsCard
            title="Active Orders"
            value={activeOrders.length}
            icon={<Clock className="w-6 h-6" />}
            trend="In progress"
            colorName="amber"
            delay={0.2}
          />
          <StatsCard
            title="Total Spent"
            value={`$${totalSpent}`}
            icon={<DollarSign className="w-6 h-6" />}
            trend="+12% vs last month"
            colorName="teal"
            delay={0.3}
          />
          <StatsCard
            title="Total Proposals"
            value={totalProposals}
            icon={<FileText className="w-6 h-6" />}
            trend="Received"
            colorName="fuchsia"
            delay={0.4}
          />
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <Sparkles className="w-5 h-5 text-yellow-500" /> Recommended Services
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {recommendedGigs.length > 0 ? (
                  recommendedGigs.map((gig) => (
                    <GigCard key={gig._id} gig={gig} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-10 text-muted-foreground bg-muted/30 rounded-xl border border-dashed hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/gigs')}>
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Explore our marketplace to find services</p>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <Button variant="link" className="text-primary" onClick={() => navigate('/gigs')}>
                  Browse All Services <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </section>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-8">
            {/* Recent Orders */}
            {/* Recent Orders */}
            <Card className="p-6 border shadow-sm bg-card/50 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg text-foreground">Active Orders</h2>
                <Link to="/orders" className="text-xs text-primary hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {activeOrders.length > 0 ? (
                  activeOrders.slice(0, 3).map((order: any) => (
                    <div key={order._id} className="flex gap-4 items-start p-3 rounded-xl bg-background border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/orders')}>
                      <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center border border-teal-200 dark:border-teal-800 shrink-0">
                        <DollarSign className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold truncate text-foreground">{order.gig.title}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> Due {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-primary">${order.price}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No active orders
                  </div>
                )}
              </div>
            </Card>

            {/* Recent Projects */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-foreground">Recent Projects</h2>
                <Link to="/student/projects" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project, idx) => (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + (idx * 0.1) }}
                      className="glass-card rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-xl border border-white/40 bg-white/60 relative overflow-hidden group"
                      onClick={() => navigate(`/projects/${project._id}`)}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-indigo-500/10" />

                      <div className="flex items-center justify-between relative z-10">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-indigo-600 transition-colors">{project.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${project.status === 'open' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mt-3 line-clamp-2 relative z-10">{project.description}</p>
                      <div className="flex items-center justify-between mt-5 text-sm text-muted-foreground relative z-10">
                        <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg border border-white/50">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-foreground">${project.budget}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          <span>{project.proposalsCount || 0} Proposals</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm glass-card rounded-xl">
                    No projects posted yet.
                  </div>
                )}
                <Button variant="outline" className="w-full text-xs h-10 rounded-xl bg-white border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-500 transition-all" onClick={() => setDialogOpen(true)}>
                  <Plus className="w-3 h-3 mr-1" /> Post Project
                </Button>
              </div>
            </div>

            {/* Quick Tips or Promo */}
            <RecentActivity />
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white text-center shadow-lg hover:shadow-indigo-500/25 transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Briefcase className="w-8 h-8 mx-auto mb-3 opacity-80 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-bold mb-2">Need Custom Work?</h3>
              <p className="text-sm text-indigo-100 mb-4 relative z-10">Post a project detailing your specific needs and let experts come to you.</p>
              <Button size="sm" variant="secondary" onClick={() => setDialogOpen(true)} className="w-full bg-white text-indigo-600 hover:bg-gray-50 shadow-md transform transition-transform group-hover:translate-y-[-2px]">
                Post a Project Now
              </Button>
            </motion.div>
          </div>
        </div>

      </div>
      {/* Floating Action Button for Mobile */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 z-50 md:hidden"
      >
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>
    </DashboardLayout >
  );
}

// Helper component for animated numbers
function AnimatedNumber({ value }: { value: string | number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;
  const prefix = typeof value === 'string' && value.startsWith('$') ? '$' : '';
  const suffix = typeof value === 'string' && value.endsWith('%') ? '%' : (typeof value === 'string' && value.endsWith('+') ? '+' : '');

  useEffect(() => {
    const controls = animate(0, numericValue, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest: number) => setDisplayValue(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [numericValue]);

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
}

// StatsCard component with "underline box" style
function StatsCard({ title, value, icon, trend, colorName, delay }: any) {
  const colorStyles: Record<string, { border: string; bg: string; hoverBg: string; text: string }> = {
    blue: {
      border: "border-b-blue-500",
      bg: "bg-blue-50/50",
      hoverBg: "group-hover:bg-blue-100/50",
      text: "text-blue-600",
    },
    amber: {
      border: "border-b-amber-500",
      bg: "bg-amber-50/50",
      hoverBg: "group-hover:bg-amber-100/50",
      text: "text-amber-600",
    },
    teal: {
      border: "border-b-teal-500",
      bg: "bg-teal-50/50",
      hoverBg: "group-hover:bg-teal-100/50",
      text: "text-teal-600",
    },
    fuchsia: {
      border: "border-b-fuchsia-500",
      bg: "bg-purple-50/50",
      hoverBg: "group-hover:bg-purple-100/50",
      text: "text-purple-600",
    },
  };

  const styles = colorStyles[colorName] || colorStyles.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Card className={`h-full p-0 border-b-4 ${styles.border} shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden relative group`}>
        {/* Right side colored box */}
        <div className={`absolute right-0 top-0 h-full w-24 ${styles.bg} transition-colors ${styles.hoverBg} flex items-center justify-center`}>
          <div className={`p-3 rounded-xl bg-white/60 backdrop-blur-md shadow-sm ${styles.text} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>

        <div className="p-6 relative z-10 max-w-[calc(100%-6rem)]">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
            <AnimatedNumber value={value} />
          </h3>

          <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted/50 text-muted-foreground border border-border/50">
            {trend}
          </div>
        </div>
      </Card>
    </motion.div>
  );

}

function RecentActivity() {
  const activities = [
    { id: 1, text: "New proposal received for 'Website Redesign'", time: "2h ago", type: "proposal" },
    { id: 2, text: "Order #1234 marked as complete", time: "5h ago", type: "order" },
    { id: 3, text: "Payment of $500 released", time: "1d ago", type: "payment" },
  ];
  return (
    <div className="mb-8">
      <h3 className="font-bold text-lg text-foreground mb-4">Recent Activity</h3>
      <Card className="p-6 border shadow-sm bg-card/50 backdrop-blur-sm">
        <div className="relative border-l-2 border-muted ml-2 space-y-6 pl-6 py-2">
          {activities.map((activity) => (
            <div key={activity.id} className="relative">
              <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-background bg-indigo-500 shadow-sm" />
              <p className="text-sm font-medium text-foreground">{activity.text}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}