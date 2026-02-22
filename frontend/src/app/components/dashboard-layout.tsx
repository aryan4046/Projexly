import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { authAPI } from "../../api/auth";
import { messageAPI } from "../../api/messages";
import { notificationAPI, Notification } from "../../api/notifications";
import { io, Socket } from "socket.io-client";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  Layers,
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
import { TimeAgo } from "./ui/time-ago";

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

  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // 1. Initialize Socket
    const newSocket = io(import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000", {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });
    console.log("[Socket] Initializing connection...");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    // Join user-specific channel
    const joinId = user._id || user.id;
    console.log(`[Socket] Attempting to join with ID: ${joinId}`);
    socket.emit("join", joinId);

    // Listen for new notifications
    socket.on("notification_received", (newNoti: Notification) => {
      setNotifications(prev => [newNoti, ...prev]);
      setUnreadNotifications(prev => prev + 1);

      // Trigger toast popup
      toast.info(newNoti.title, {
        description: newNoti.message,
        duration: 5000,
      });
    });

    return () => {
      socket.off("notification_received");
    };
  }, [socket, user]);

  useEffect(() => {
    // Try to get user from local storage first
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch latest user data
    fetchUser();
    fetchMessages();
    fetchNotifications();

    // Poll for updates every 60 seconds
    const interval = setInterval(() => {
      fetchMessages();
      fetchNotifications();
    }, 60000);
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
      setUnreadMessages(0);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  }

  const fetchNotifications = async () => {
    try {
      const data = await notificationAPI.getAll();
      setNotifications(data);
      const unread = data.filter(n => !n.isRead).length;
      setUnreadNotifications(unread);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotifications(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleRoleSwitch = async () => {
    try {
      const data = await authAPI.switchRole();
      
      // Update local storage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.role = data.newRole;
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }
      
      localStorage.setItem("token", data.token);
      
      toast.success(`Role switched to ${data.newRole} successfully!`, {
        description: "Your session has been updated.",
      });

      // Navigate to the appropriate dashboard
      navigate(data.newRole === "student" ? "/student/dashboard" : "/freelancer/dashboard", { replace: true });
      
      // Force a page reload to ensure all components and API calls pick up the new role/token
      window.location.reload();
    } catch (error) {
      console.error("Failed to switch role", error);
      toast.error("Failed to switch role. Please try again.");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Mock removed

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
              <Link to="/" className="flex items-center gap-3 group">
                <div className={`w-10 h-10 bg-gradient-to-br ${currentTheme.gradient} rounded-xl flex items-center justify-center shadow-lg ${currentTheme.shadow} group-hover:scale-110 transition-transform duration-300 ring-4 ring-white/10`}>
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <span className={`text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r ${currentTheme.gradient} tracking-tight`}>
                  Projexly
                </span>
              </Link>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative transition-all hover:bg-muted">
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background animate-pulse"></span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 shadow-xl border border-border/50 bg-background/95 backdrop-blur-md" align="end">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" /> Notifications
                    </h4>
                    {unreadNotifications > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-primary hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <ScrollArea className="h-80">
                    <div className="p-2">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                          <Bell className="w-8 h-8 opacity-20 mb-2" />
                          <p className="text-xs">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() => {
                              handleMarkAsRead(notification._id);
                              // Optional: navigate to relatedId
                            }}
                            className={`flex items-start gap-3 p-3 rounded-lg mb-1 hover:bg-muted/50 cursor-pointer transition-colors relative group ${!notification.isRead ? "bg-primary/5" : ""}`}
                          >
                            <div className="shrink-0 mt-1">
                              {notification.sender && notification.sender.profilePicture ? (
                                <Avatar className="w-8 h-8 border border-border/50">
                                  <AvatarImage src={notification.sender.profilePicture} />
                                  <AvatarFallback className="text-[10px]">{notification.sender.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                  <Bell className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold text-foreground ${!notification.isRead ? "pr-4" : ""}`}>
                                {notification.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
                                {notification.message}
                              </p>
                              <TimeAgo 
                                date={notification.createdAt} 
                                className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-tighter font-medium"
                              />
                            </div>
                            {!notification.isRead && (
                              <div className="absolute top-4 right-3 w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                        ))
                      )}
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
                    {unreadMessages > 0 && (
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
                                <TimeAgo 
                                  date={Date.now() - (index * 3600000)} // Mocking relative time based on index for demo
                                  className="text-[10px] text-muted-foreground"
                                />
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
                      <AvatarImage src={user?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`} />
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
                  <DropdownMenuItem onClick={handleRoleSwitch} className="cursor-pointer font-medium text-foreground">
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
                        ? `${currentTheme.bgAccent} ${currentTheme.textAccent} border ${currentTheme.borderAccent}`
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