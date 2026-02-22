import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

import { gigAPI } from "../../../api/gigs";
import { orderAPI } from "../../../api/orders";
import { proposalAPI } from "../../../api/proposals";
import { projectAPI } from "../../../api/projects";
import { authAPI } from "../../../api/auth";
import { messageAPI } from "../../../api/messages";

import { Skeleton } from "../../components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { motion, animate } from "motion/react";
import {
  Search,
  FileText,
  DollarSign,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Plus,
  Target,
  CheckSquare,
  Bell,
  MoreHorizontal,
  Trash2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subMonths, eachMonthOfInterval, isSameMonth, parseISO } from "date-fns";

import { freelancerNavItems as navItems } from "../../../config/navigation";
import { TimeAgo } from "../../components/ui/time-ago";

export function FreelancerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeGigs: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalEarnings: 0,
    pendingProposals: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recommendedProjects, setRecommendedProjects] = useState<any[]>([]);
  const [inboxPreview, setInboxPreview] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Todo List State
  const [todos, setTodos] = useState<{ id: number; text: string; completed: boolean }[]>(() => {
    const saved = localStorage.getItem("freelancer_todos");
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Update portfolio with recent work", completed: false },
      { id: 2, text: "Reply to new client inquiries", completed: true },
    ];
  });
  const [newTodo, setNewTodo] = useState("");

  // Goal Tracker State
  const [earningsGoal, setEarningsGoal] = useState(() => {
    return parseInt(localStorage.getItem("earnings_goal") || "2000");
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(earningsGoal.toString());

  useEffect(() => {
    localStorage.setItem("earnings_goal", earningsGoal.toString());
  }, [earningsGoal]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const fetchData = async () => {
      try {
        const userInfo = await authAPI.getMe();
        setUser(userInfo);

        const [gigs, orders, proposals, openProjects, conversations] = await Promise.all([
          gigAPI.getMyGigs(),
          orderAPI.getMyOrders(),
          proposalAPI.getMyProposals(),
          projectAPI.getOpenProjects(),
          messageAPI.getConversations()
        ]);

        // Filter orders for this seller
        const myOrders = orders.filter((o: any) => o.seller._id === userInfo._id);
        const activeOrders = myOrders.filter((o: any) => o.status === 'active');
        const completedOrders = myOrders.filter((o: any) => o.status === 'completed');

        const earnings = completedOrders.reduce((sum: number, o: any) => sum + o.price, 0);

        setStats({
          activeGigs: gigs.length,
          activeOrders: activeOrders.length,
          completedOrders: completedOrders.length,
          totalEarnings: earnings,
          pendingProposals: proposals.length
        });

        setRecentOrders(activeOrders.slice(0, 3));
        setRecommendedProjects(openProjects.slice(0, 3));
        setInboxPreview(conversations.slice(0, 3));

        // Generate Activity Feed
        const feed = [
          ...activeOrders.map((o: any) => ({
            type: 'order',
            title: 'New Order Received',
            desc: `Order for ${o.gig?.title || o.project?.title || 'Custom Service'}`,
            date: new Date(o.createdAt),
            icon: <Briefcase className="w-4 h-4 text-emerald-500" />
          })),
          ...proposals.map((p: any) => ({
            type: 'proposal',
            title: 'Proposal Submitted',
            desc: `For project: ${p.project.title}`,
            date: new Date(p.createdAt),
            icon: <FileText className="w-4 h-4 text-teal-500" />
          }))
        ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
        setActivityFeed(feed);

        // Generate Chart Data
        const today = new Date();
        const sixMonthsAgo = subMonths(today, 5);
        const months = eachMonthOfInterval({ start: sixMonthsAgo, end: today });
        const chartData = months.map(month => {
          const amount = completedOrders
            .filter((o: any) => isSameMonth(parseISO(o.createdAt), month))
            .reduce((sum: number, o: any) => sum + o.price, 0);
          return { name: format(month, 'MMM'), amount };
        });
        setMonthlyEarnings(chartData);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Poll for live updates every 10 seconds
    interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Todo Handlers
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
    setNewTodo("");
  };
  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };
  const deleteTodo = (id: number) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  // Goal Handler
  const handleGoalUpdate = () => {
    const val = parseInt(tempGoal);
    if (!isNaN(val) && val > 0) {
      setEarningsGoal(val);
      setIsEditingGoal(false);
    }
  };

  // Goal Calculation
  const currentMonthEarnings = monthlyEarnings[monthlyEarnings.length - 1]?.amount || 0;
  const goalProgress = Math.min((currentMonthEarnings / earningsGoal) * 100, 100);

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} userType="freelancer" theme="emerald">
        <div className="min-h-screen space-y-8 pb-10">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64 rounded-xl" />
              <Skeleton className="h-4 w-96 rounded-lg" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32 rounded-full" />
              <Skeleton className="h-10 w-32 rounded-full" />
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
              <Skeleton className="h-80 rounded-2xl" /> {/* Chart */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-8">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={navItems} userType="freelancer" theme="emerald">
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
                {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">{user?.name?.split(' ')[0] || 'Freelancer'}</span> 👋
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl">
                Here's what's happening with your projects today.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="rounded-full shadow-sm" onClick={() => navigate("/messages")}>
                <MessageSquare className="w-4 h-4 mr-2" /> Messages
              </Button>
              <Button className="rounded-full shadow-lg shadow-emerald-200 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all hover:scale-105" onClick={() => navigate("/freelancer/create-gig")}>
                <Plus className="w-5 h-5 mr-2" /> Create New Gig
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Active Gigs"
            value={stats.activeGigs}
            icon={<Briefcase className="w-6 h-6" />}
            colorName="blue"
            trend="Live Services"
            delay={0.1}
          />
          <StatsCard
            title="Sent Proposals"
            value={stats.pendingProposals}
            icon={<FileText className="w-6 h-6" />}
            colorName="purple"
            trend="Pending Review"
            delay={0.2}
          />
          <StatsCard
            title="Total Earnings"
            value={`$${stats.totalEarnings}`}
            icon={<DollarSign className="w-6 h-6" />}
            colorName="emerald"
            trend="Lifetime Earnings"
            delay={0.3}
          />
          <StatsCard
            title="Active Orders"
            value={stats.activeOrders}
            icon={<TrendingUp className="w-6 h-6" />}
            colorName="amber"
            trend="In Progress"
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Area - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">

            {/* PERFORMANCE CHART */}
            <Card className="p-6 border shadow-sm bg-white/60 backdrop-blur-md hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" /> Earnings Analytics
                </h2>
                <Badge variant="outline" className="bg-white/50">Last 6 Months</Badge>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} fontSize={12} stroke="#888888" />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#888888" tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'rgba(255, 255, 255, 0.9)' }}
                      formatter={(value) => [`$${value}`, 'Earnings']}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                      {monthlyEarnings.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="url(#colorGradient)" />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Active Orders Section */}
            <Card className="p-6 border shadow-sm bg-white/60 backdrop-blur-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" /> Active Orders
                </h2>
                <Link to="/orders" className="text-sm text-primary hover:underline font-medium">View All</Link>
              </div>

              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                    <TrendingUp className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground">No active orders right now.</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order._id} className="group p-4 bg-background border rounded-xl hover:border-primary/50 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/orders')}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              In Progress
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">ID: {order._id.slice(-6)}</span>
                          </div>
                          <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">{order.gig?.title || order.project?.title || 'Custom Order'}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> Client: {order.buyer.name}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: <TimeAgo date={order.createdAt} /></span>
                          </div>
                        </div>
                        <div className="text-right pl-4 border-l">
                          <div className="text-2xl font-bold text-green-600">${order.price}</div>
                          <Button size="sm" variant="ghost" className="h-8 mt-1 text-xs" onClick={() => navigate('/orders')}>
                            Manage Order <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Recommended Projects Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" /> Recommended Projects
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {recommendedProjects.length > 0 ? (
                  recommendedProjects.map((project, idx) => (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (idx * 0.1) }}
                      className="glass-card rounded-2xl p-6 transition-all hover:scale-[1.01] hover:shadow-xl border border-white/40 bg-white/60 relative overflow-hidden group cursor-pointer"
                      onClick={() => navigate(`/freelancer/projects/${project._id}`)}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-500/10" />

                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <h3 className="font-bold text-lg mb-2 group-hover:text-emerald-600 transition-colors">{project.title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 max-w-2xl">{project.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {(project.skills || []).slice(0, 3).map((skill: string) => (
                              <Badge key={skill} variant="secondary" className="text-xs bg-white/50 hover:bg-white/80">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="font-bold text-xl text-foreground mb-1">${project.budget}</div>
                          <div className="text-xs text-muted-foreground mb-3">Fixed Price</div>
                          <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all">View Details</Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">No matching projects found at the moment.</p>
                    <Button variant="link" className="mt-2" onClick={() => navigate('/freelancer/browse')}>Browse All Projects</Button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-8">

            {/* EARNINGS GOAL TRACKER */}
            <Card className="p-6 border shadow-sm bg-gradient-to-br from-emerald-900 to-teal-900 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-300" /> Monthly Goal
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-emerald-300 hover:text-white" onClick={() => setIsEditingGoal(!isEditingGoal)}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {isEditingGoal ? (
                <div className="space-y-2 mb-4">
                  <Input
                    type="number"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                  />
                  <Button size="sm" onClick={handleGoalUpdate} className="w-full bg-emerald-500 hover:bg-emerald-600">Update Goal</Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-bold">${currentMonthEarnings}</span>
                    <span className="text-sm text-emerald-200 mb-1">/ ${earningsGoal}</span>
                  </div>
                  <Progress value={goalProgress} className="h-3 bg-white/20" />
                  <p className="text-xs text-emerald-200 mt-2 text-center">
                    {goalProgress >= 100 ? "🎉 You hit your goal!" : `${Math.round(goalProgress)}% of your monthly target`}
                  </p>
                </>
              )}
            </Card>

            {/* TO-DO LIST */}
            <Card className="p-6 border shadow-sm bg-white/60 backdrop-blur-md">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-500" /> To-Do List
              </h2>
              <form onSubmit={addTodo} className="flex gap-2 mb-4">
                <Input
                  placeholder="Add a task..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  className="h-9"
                />
                <Button type="submit" size="sm" className="h-9 w-9 p-0 bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4" />
                </Button>
              </form>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                {todos.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No tasks yet.</p>}
                {todos.map(todo => (
                  <div key={todo.id} className="flex items-center justify-between group p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${todo.completed ? 'bg-emerald-500 border-emerald-500' : 'border-input hover:border-primary'}`}
                        onClick={() => toggleTodo(todo.id)}
                      >
                        {todo.completed && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className={`text-sm ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>{todo.text}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteTodo(todo.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* INBOX PREVIEW */}
            <Card className="p-6 border shadow-sm bg-white/60 backdrop-blur-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" /> Messages
                </h2>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">Recent</Badge>
              </div>
              <div className="space-y-4">
                {inboxPreview.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent messages.</p>
                ) : (
                  inboxPreview.map((conv: any) => (
                    <div key={conv._id} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors" onClick={() => navigate('/messages')}>
                      <Avatar className="h-9 w-9 border">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${conv.name}`} />
                        <AvatarFallback>{conv.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p className="text-sm font-medium truncate">{conv.name}</p>
                          <span className="text-[10px] text-muted-foreground">New</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">Click to message...</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button variant="outline" className="w-full mt-4 text-xs h-8" onClick={() => navigate('/messages')}>View All Messages</Button>
            </Card>

            {/* ACTIVITY FEED */}
            <Card className="p-6 border shadow-sm bg-white/60 backdrop-blur-md">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" /> Recent Activity
              </h2>
              <div className="relative border-l-2 border-muted ml-2 space-y-6 pl-6 py-2">
                {activityFeed.map((item, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-[33px] top-0 bg-background border-2 border-white shadow-sm rounded-full p-1 h-8 w-8 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                      <TimeAgo date={item.date} className="text-[10px] text-muted-foreground mt-1 block" />
                    </div>
                  </div>
                ))}
                {activityFeed.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}
              </div>
            </Card>

            {/* Quick Actions Card */}
            <Card className="p-6 border shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
              <h2 className="font-bold text-lg mb-4 relative z-10">Quick Actions</h2>
              <div className="space-y-3 relative z-10">
                <Button className="w-full justify-start bg-white hover:bg-gray-50 text-foreground border shadow-sm" variant="outline" asChild>
                  <Link to="/freelancer/create-gig">
                    <Plus className="mr-2 h-4 w-4 text-emerald-600" /> Create New Gig
                  </Link>
                </Button>
                <Button className="w-full justify-start bg-white hover:bg-gray-50 text-foreground border shadow-sm" variant="outline" asChild>
                  <Link to="/freelancer/browse">
                    <Search className="mr-2 h-4 w-4 text-blue-600" /> Find Work
                  </Link>
                </Button>
              </div>
            </Card>

          </div>
        </div>

      </div>
    </DashboardLayout>
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
    emerald: {
      border: "border-b-emerald-500",
      bg: "bg-emerald-50/50",
      hoverBg: "group-hover:bg-emerald-100/50",
      text: "text-emerald-600",
    },
    purple: {
      border: "border-b-purple-500",
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
