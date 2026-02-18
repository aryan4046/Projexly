import { useEffect, useState, useRef } from "react";
import { messageAPI, Message, ConversationUser } from "@/api/messages";
import { authAPI } from "@/api/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { CardContent } from "@/app/components/ui/card";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import {
    Send,
    User as UserIcon,
    ArrowLeft,
    Search,
    MessageSquare,
    Phone,
    Video,
    MoreVertical,
    Paperclip,
    Smile
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { motion } from "motion/react";

export function Messages() {
    const [conversations, setConversations] = useState<ConversationUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<ConversationUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Derived state for theming
    const userRole = currentUser?.role || "student";
    const theme = userRole === "freelancer" ? "emerald" : "indigo";
    const secondaryTheme = userRole === "freelancer" ? "teal" : "purple";

    useEffect(() => {
        const init = async () => {
            const user = await authAPI.getMe();
            setCurrentUser(user);
            const convos = await messageAPI.getConversations();
            setConversations(convos);
        };
        init();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            const fetchMessages = async () => {
                const msgs = await messageAPI.getMessages(selectedUser._id);
                setMessages(msgs);
            };
            fetchMessages();
            // Polling for new messages could go here
        }
    }, [selectedUser]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !newMessage.trim()) return;

        try {
            const msg = await messageAPI.send(selectedUser._id, newMessage);
            setMessages([...messages, msg]);
            setNewMessage("");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden flex flex-col">
            {/* Header / Back Button Area */}
            <div className="relative z-50 px-4 py-4 md:px-8 bg-background/50 backdrop-blur-md border-b border-border/40">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.history.back()}
                    className={`flex items-center gap-2 px-5 py-2.5 bg-background/40 backdrop-blur-xl border border-white/10 rounded-full shadow-lg hover:shadow-${theme}-500/20 hover:border-${theme}-500/50 hover:bg-background/60 transition-all duration-300 group`}
                >
                    <div className={`bg-${theme}-500/10 p-1 rounded-full group-hover:bg-${theme}-500/20 transition-colors`}>
                        <ArrowLeft className={`w-4 h-4 text-${theme}-500 group-hover:-translate-x-0.5 transition-transform`} />
                    </div>
                    <span className="font-medium text-sm text-muted-foreground group-hover:text-foreground transition-colors">Go Back</span>
                </motion.button>
            </div>

            <div className="flex-1 container mx-auto p-4 md:p-6 max-w-7xl h-[calc(100vh-80px)]">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full bg-card/30 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden">

                    {/* Sidebar */}
                    <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} md:col-span-4 flex-col border-r border-border/40 bg-muted/20`}>
                        <div className="p-6 border-b border-border/40">
                            <h2 className="text-2xl font-bold tracking-tight mb-4">Messages</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search conversations..."
                                    className="pl-9 bg-background/50 border-input/50 focus:bg-background transition-all rounded-xl"
                                />
                            </div>
                        </div>

                        <ScrollArea className="flex-1 px-3 py-3">
                            <div className="space-y-2">
                                {conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                        <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                                        <p>No conversations yet.</p>
                                    </div>
                                ) : (
                                    conversations.map(user => (
                                        <motion.div
                                            key={user._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => setSelectedUser(user)}
                                            className={cn(
                                                "flex items-center gap-4 p-4 cursor-pointer rounded-2xl transition-all duration-200 group relative overflow-hidden",
                                                selectedUser?._id === user._id
                                                    ? `bg-${theme}-500/10 shadow-sm`
                                                    : "hover:bg-muted/50"
                                            )}
                                        >
                                            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]")} />

                                            <div className="relative">
                                                <Avatar className="h-12 w-12 border-2 border-background shadow-sm group-hover:scale-105 transition-transform">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                                                    <AvatarFallback className={`bg-${theme}-500/10 text-${theme}-600`}>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {/* Online status indicator mock */}
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                                            </div>

                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex justify-between items-baseline">
                                                    <p className={cn("font-semibold truncate transition-colors", selectedUser?._id === user._id ? `text-${theme}-600` : "text-foreground")}>
                                                        {user.name}
                                                    </p>
                                                    <span className="text-[10px] text-muted-foreground font-medium">12:30 PM</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <span className="capitalize text-xs bg-muted px-1.5 py-0.5 rounded-md mr-1.5 align-middle border border-border/50">
                                                        {user.role}
                                                    </span>
                                                    Click to view chat
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Chat Window */}
                    <div className={`${!selectedUser ? 'hidden md:flex' : 'flex'} md:col-span-8 flex-col bg-background/40 relative`}>
                        {/* Decorative background pattern */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 pointer-events-none mix-blend-soft-light"></div>

                        {selectedUser ? (
                            <>
                                <div className="p-4 border-b border-border/40 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between bg-background/60">
                                    <div className="flex items-center gap-4">
                                        <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={() => setSelectedUser(null)}>
                                            <ArrowLeft className="w-5 h-5" />
                                        </Button>
                                        <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.name}`} />
                                            <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-bold text-base leading-none mb-1">{selectedUser.name}</h3>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                <span className="text-xs text-muted-foreground font-medium">Online</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10">
                                            <Phone className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10">
                                            <Video className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <CardContent className="flex-1 overflow-auto p-4 md:p-6 flex flex-col gap-6" ref={scrollRef}>
                                    <div className="flex justify-center my-4">
                                        <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">Today</span>
                                    </div>

                                    {messages.map((msg) => {
                                        const isMe = msg.sender === currentUser?._id;
                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                key={msg._id}
                                                className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}
                                            >
                                                <div className={cn("flex max-w-[75%] md:max-w-[70%] gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                                                    {!isMe && (
                                                        <Avatar className="w-8 h-8 mt-1 border border-border/50 hidden sm:block">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.name}`} />
                                                            <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    )}

                                                    <div
                                                        className={cn(
                                                            "rounded-2xl px-5 py-3 text-sm shadow-md backdrop-blur-sm transition-all relative group",
                                                            isMe
                                                                ? `bg-gradient-to-br from-${theme}-600 to-${secondaryTheme}-600 text-white rounded-tr-sm`
                                                                : "bg-white dark:bg-zinc-800 border border-border/50 text-foreground rounded-tl-sm hover:bg-gray-50 dark:hover:bg-zinc-700/80"
                                                        )}
                                                    >
                                                        <p className="leading-relaxed">{msg.message}</p>
                                                        <p className={cn(
                                                            "text-[10px] mt-1.5 text-right font-medium opacity-70",
                                                            isMe ? "text-blue-100" : "text-muted-foreground"
                                                        )}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            {isMe && <span className="ml-1">✓✓</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </CardContent>

                                <div className="p-4 bg-background/60 backdrop-blur-md border-t border-border/40">
                                    <form onSubmit={handleSend} className="flex gap-3 items-end max-w-4xl mx-auto">
                                        <div className={`flex-1 bg-muted/30 border border-border/50 hover:border-${theme}-500/30 focus-within:border-${theme}-500/50 focus-within:bg-background/80 focus-within:shadow-lg focus-within:ring-1 focus-within:ring-${theme}-500/20 rounded-3xl transition-all duration-300 flex items-center p-1.5 pl-4`}>
                                            <Input
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type a message..."
                                                className="border-none shadow-none bg-transparent focus-visible:ring-0 p-0 h-10 placeholder:text-muted-foreground/50"
                                            />
                                            <div className="flex gap-1 mr-1">
                                                <Button type="button" size="icon" variant="ghost" className={`h-8 w-8 rounded-full text-muted-foreground hover:text-${theme}-600 hover:bg-${theme}-500/10 transition-colors`}>
                                                    <Paperclip className="h-4 w-4" />
                                                </Button>
                                                <Button type="button" size="icon" variant="ghost" className={`h-8 w-8 rounded-full text-muted-foreground hover:text-${theme}-600 hover:bg-${theme}-500/10 transition-colors`}>
                                                    <Smile className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            size="icon"
                                            disabled={!newMessage.trim()}
                                            className={`h-12 w-12 rounded-full shadow-lg shadow-${theme}-500/25 bg-gradient-to-r from-${theme}-600 to-${secondaryTheme}-600 hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-${theme}-500/40`}
                                        >
                                            <Send className="h-5 w-5 text-white" />
                                        </Button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground px-4">
                                <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                                    <UserIcon className="h-12 w-12 opacity-20" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">No Chat Selected</h3>
                                <p className="max-w-xs text-center text-muted-foreground">Select a conversation from the sidebar to start chatting with your contacts.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
