import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { authAPI } from "../../api/auth";
import { messageAPI, Message } from "../../api/messages"; // Import real API
import { Button } from "./ui/button";
import {
  Code,
  Bell,
  MessageSquare,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Menu,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"; // Use AvatarImage
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  userType: "student" | "freelancer";
  theme?: "indigo" | "emerald";
}

const themeStyles = {
  indigo: {
    gradient: "from-indigo-600 to-purple-600",
    bgAccent: "bg-indigo-50",
    textAccent: "text-indigo-600",
    borderAccent: "border-indigo-100",
    shadow: "shadow-indigo-500/20",
    blob1: "bg-indigo-600/10",
    blob2: "bg-purple-600/10",
    blob3: "bg-blue-600/5",
  },
  emerald: {
    gradient: "from-emerald-600 to-teal-600",
    bgAccent: "bg-emerald-50",
    textAccent: "text-emerald-600",
    borderAccent: "border-emerald-100",
    shadow: "shadow-emerald-500/20",
    blob1: "bg-emerald-600/10",
    blob2: "bg-teal-600/10",
    blob3: "bg-green-600/5",
  }
};

export function DashboardLayout({ children, navItems, userType, theme = "indigo" }: DashboardLayoutProps) {
  const currentTheme = themeStyles[theme];
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Real State for Messages
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Try to get user from local storage first
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch latest user data
    fetchUser();
    fetchMessages(); // Fetch real messages

    // Poll for messages every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await authAPI.getMe();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const conversations: any[] = await messageAPI.getConversations();
      // We don't have a "latest message" endpoint yet, using conversations as a proxy for recent contacts
      // For a real app, we'd want a specific endpoint for "recent chats with last message"
      setRecentMessages(conversations.slice(0, 5));

      // Count unread - (Mocking this part for now as API doesn't return unread count per convo yet)
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Mock notifications data (Keep mock for now, implement real later if needed)
  const notifications = [
    {
      id: 1,
      title: "Welcome to Projexly",
      message: "Get started by posting a project or creating a gig!",
      time: "Just now",
      unread: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30 overflow-hidden relative">

      {/* Global Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] ${currentTheme.blob1} rounded-full blur-[120px] animate-pulse`} />
        <div className={`absolute top-[20%] right-[-10%] w-[30%] h-[50%] ${currentTheme.blob2} rounded-full blur-[120px]`} />
        <div className={`absolute bottom-[-10%] left-[20%] w-[50%] h-[30%] ${currentTheme.blob3} rounded-full blur-[100px]`} />
      </div>

      {/* Top Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg text-muted-foreground"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              <Link to="/" className="flex items-center gap-2">
                <div className={`w-8 h-8 bg-gradient-to-br ${currentTheme.gradient} rounded-lg flex items-center justify-center shadow-lg ${currentTheme.shadow}`}>
                  <Code className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${currentTheme.gradient}`}>
                  Projexly
                </span>
              </Link>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 border-0 shadow-lg" align="end">
                  <div className="p-4">
                    <h4 className="font-medium text-sm">Notifications</h4>
                  </div>
                  <Separator />
                  <ScrollArea className="h-80">
                    <div className="p-4">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start gap-3 p-3 rounded-lg mb-2 hover:bg-muted cursor-pointer transition-colors ${notification.unread ? "bg-muted/50" : ""
                            }`}
                        >
                          <div className="w-2 h-2 mt-2 rounded-full bg-indigo-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              {/* Messages */}
              {/* Messages */}
              <Popover open={messagesOpen} onOpenChange={setMessagesOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative transition-all hover:bg-muted">
                    <MessageSquare className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background"></span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 shadow-xl border border-border/50 bg-background/95 backdrop-blur-md" align="end">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" /> Inbox
                    </h4>
                    <span className="text-xs text-muted-foreground">{recentMessages.length} New</span>
                  </div>

                  <ScrollArea className="h-[300px]">
                    <div className="flex flex-col">
                      {recentMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                          <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground">No messages yet.</p>
                        </div>
                      ) : (
                        recentMessages.map((msgUser, index) => (
                          <div
                            key={msgUser._id}
                            onClick={() => {
                              setMessagesOpen(false);
                              navigate("/messages");
                            }}
                            className="flex items-start gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-0"
                          >
                            <div className="relative shrink-0">
                              <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${msgUser.name}`} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                  {msgUser.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {index < 2 && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline mb-1">
                                <p className="text-sm font-semibold truncate text-foreground">
                                  {msgUser.name}
                                </p>
                                <span className="text-[10px] text-muted-foreground">
                                  {index === 0 ? '1m ago' : index === 1 ? '1h ago' : '1d ago'}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {index === 0 ? "Hey, are you available for a quick call regarding the project?" : "The design files have been uploaded. Let me know what you think."}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                  <div className="p-2 border-t bg-muted/20">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs font-medium h-9 text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                      onClick={() => {
                        setMessagesOpen(false);
                        navigate("/messages");
                      }}
                    >
                      See All In Inbox
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:bg-muted rounded-lg p-2 transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`} />
                      <AvatarFallback className={`bg-gradient-to-br ${currentTheme.gradient} text-white`}>
                        {user?.name
                          ? user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.name || "User"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <div className="font-medium">{user?.name || "User"}</div>
                    <div className="text-sm text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </div>
                    <Badge variant="outline" className="mt-2 capitalize">{userType || user?.role || "student"}</Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(userType === "student" ? "/freelancer/dashboard" : "/student/dashboard")} className="cursor-pointer font-medium text-foreground">
                    <div className={`w-2 h-2 rounded-full mr-2 bg-gradient-to-r ${userType === "student" ? themeStyles.emerald.gradient : themeStyles.indigo.gradient}`} />
                    Switch to {userType === "student" ? "Freelancer" : "Student"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex relative z-10">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 glass border-r border-slate-200/50 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                    ? `${currentTheme.bgAccent} ${currentTheme.textAccent} border ${currentTheme.borderAccent}`
                    : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                    }`}
                >
                  <div className={`transition-transform duration-200 ${isActive ? `scale-110 ${currentTheme.textAccent}` : "group-hover:scale-110"}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 z-40">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative w-64 bg-background border-r border-border h-full shadow-2xl">
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                        ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                        : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                        }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}