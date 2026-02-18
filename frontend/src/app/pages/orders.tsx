import { useEffect, useState } from "react";
import { orderAPI } from "../../api/orders";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

import { toast } from "sonner";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../api/auth";
import {
    Package,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreHorizontal,
    Upload,
    Download,
    ExternalLink,
    ArrowLeft
} from "lucide-react";
import { motion } from "motion/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

export function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string>("");
    const [userRole, setUserRole] = useState<string>("student");
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [deliveryLink, setDeliveryLink] = useState("");
    const [openDeliveryDialog, setOpenDeliveryDialog] = useState(false);

    const theme = userRole === "freelancer" ? "emerald" : "indigo";
    const secondaryTheme = userRole === "freelancer" ? "teal" : "purple";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await authAPI.getMe();
                setUserId(user._id);
                setUserRole(user.role || "student");
                const data = await orderAPI.getMyOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
                toast.error("Failed to load orders");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDeliver = async () => {
        if (!selectedOrder) return;
        if (!deliveryLink) {
            toast.error("Please provide a delivery link");
            return;
        }
        try {
            await orderAPI.deliverWork(selectedOrder._id, [deliveryLink]);
            toast.success("Work delivered successfully!");
            setOpenDeliveryDialog(false);
            setDeliveryLink("");
            // Refresh
            const data = await orderAPI.getMyOrders();
            setOrders(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to deliver work");
        }
    };

    const handleComplete = async (orderId: string) => {
        try {
            await orderAPI.updateStatus(orderId, "completed");
            toast.success("Order marked as completed!");
            const data = await orderAPI.getMyOrders();
            setOrders(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to complete order");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
            case "active": return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
            case "cancelled": return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
            default: return "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200";
        }
    };

    const buyingOrders = orders.filter(o => o.buyer._id === userId);
    const sellingOrders = orders.filter(o => o.seller._id === userId);

    const EmptyState = ({ type }: { type: "buying" | "selling" }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="border-dashed border-2 shadow-none bg-muted/30 border-muted-foreground/20">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                        <Package className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 tracking-tight">No {type} orders yet</h3>
                    <p className="text-muted-foreground max-w-md mb-8 text-lg">
                        {type === "buying"
                            ? "You haven't purchased any services yet. Browse our marketplace to find exactly what you need."
                            : "You haven't received any orders yet. Optimize your gigs to attract more buyers."}
                    </p>
                    {type === "buying" && (
                        <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">
                            <Link to="/gigs">Browse Services</Link>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );

    const OrderCard = ({ order, isSelling }: { order: any, isSelling: boolean }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="group overflow-hidden border hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row">
                    {/* Image Section */}
                    <div className="sm:w-48 h-32 sm:h-auto bg-muted relative overflow-hidden">
                        {order.gig?.coverImage ? (
                            <img
                                src={order.gig?.coverImage || "https://images.unsplash.com/photo-1572044162444-ad6021194361?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"} // Fallback image
                                alt={order.gig?.title || order.project?.title || "Order"}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <Package className="w-8 h-8 text-gray-400" />
                            </div>
                        )}
                        <Badge className={`absolute top-2 left-2 px-2.5 py-1 capitalize border shadow-sm ${getStatusColor(order.status)} z-10`}>
                            {order.status}
                        </Badge>
                    </div>

                    {/* Content Section */}
                    <CardContent className="flex-1 p-5">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-3 flex-1">
                                <div className="flex justify-between items-start">
                                    <Link to={`/gigs/${order.gig?._id}`} className={`font-bold text-xl hover:text-${theme}-600 transition-colors line-clamp-1`}>
                                        {order.gig?.title || order.project?.title || "Custom Order"}
                                    </Link>
                                    <div className="md:hidden font-bold text-lg text-primary">
                                        ${order.price}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-full">
                                        <Avatar className="w-5 h-5 border border-background">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${isSelling ? order.buyer.name : order.seller.name}`} />
                                            <AvatarFallback className="text-[10px]">
                                                {(isSelling ? order.buyer.name : order.seller.name)?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{isSelling ? "Buyer" : "Seller"}: <span className="font-medium text-foreground">{isSelling ? order.buyer.name : order.seller.name}</span></span>
                                    </div>
                                    <div className="flex items-center gap-1.5 hidden sm:flex">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                                    </div>
                                </div>

                                {/* Delivery Status/Actions Area */}
                                {order.status === "active" && order.deliveredWork?.length > 0 && !order.isCompleted && (
                                    <div className="bg-green-50/50 dark:bg-green-900/10 p-3 rounded-xl border border-green-100 dark:border-green-900/20 text-sm">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="font-medium text-green-800 dark:text-green-300">Work Delivered</p>
                                                <p className="text-green-700 dark:text-green-400 text-xs mt-0.5">
                                                    {isSelling ? "You have delivered the work. Waiting for buyer approval." : "The seller has delivered the work. Please review."}
                                                </p>

                                                <div className="flex gap-2 mt-2">
                                                    <Button size="sm" variant="outline" className="h-7 text-xs bg-background/50 backdrop-blur-sm" asChild>
                                                        <a href={order.deliveredWork[0]} target="_blank" rel="noopener noreferrer">
                                                            <Download className="w-3 h-3 mr-1.5" /> View Files
                                                        </a>
                                                    </Button>
                                                    {!isSelling && (
                                                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white shadow-green-200" onClick={() => handleComplete(order._id)}>
                                                            Accept & Complete
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* Right Actions */}
                            <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:border-l md:pl-5 border-border/50">
                                <div className="hidden md:block font-extrabold text-2xl text-primary">
                                    ${order.price}
                                </div>

                                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-auto">
                                    <Button size="sm" variant="outline" className="flex-1 md:flex-none rounded-full" onClick={() => navigate(`/messages`)}>
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Chat
                                    </Button>

                                    {isSelling && order.status === "active" && (
                                        <Button size="sm" className={`flex-1 md:flex-none bg-${theme}-600 hover:bg-${theme}-700 rounded-full shadow-lg shadow-${theme}-200`} onClick={() => { setSelectedOrder(order); setOpenDeliveryDialog(true); }}>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Deliver
                                        </Button>
                                    )}

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-full">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => navigate(`/gigs/${order.gig?._id}`)}>
                                                <ExternalLink className="w-4 h-4 mr-2" /> View Gig
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <AlertCircle className="w-4 h-4 mr-2" /> Report Issue
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-5xl">
                <div className="space-y-4">
                    <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
                    <div className="h-64 w-full bg-muted animate-pulse rounded-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <div className="relative bg-primary/5 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(-1)}
                    className={`absolute top-4 left-4 md:top-8 md:left-8 z-50 flex items-center gap-2 px-5 py-2.5 bg-background/40 backdrop-blur-xl border border-white/10 rounded-full shadow-lg hover:shadow-${theme}-500/20 hover:border-${theme}-500/50 hover:bg-background/60 transition-all duration-300 group`}
                >
                    <div className={`bg-${theme}-500/10 p-1 rounded-full group-hover:bg-${theme}-500/20 transition-colors`}>
                        <ArrowLeft className={`w-4 h-4 text-${theme}-600 group-hover:-translate-x-0.5 transition-transform`} />
                    </div>
                    <span className="font-medium text-sm text-muted-foreground group-hover:text-foreground transition-colors">Go Back</span>
                </motion.button>

                <div className="relative container mx-auto max-w-5xl text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
                            Manage your <span className={`text-${theme}-600 bg-clip-text text-transparent bg-gradient-to-r from-${theme}-600 to-${secondaryTheme}-600`}>Orders</span> & Deliveries
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Track the progress of your orders and manage deliveries with ease.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto py-12 px-4 max-w-6xl relative z-10">

                <Tabs defaultValue="buying" className="w-full">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                        <TabsList className="grid w-full max-w-[460px] h-14 grid-cols-2 p-1.5 bg-white/60 items-center justify-center rounded-full border border-white/40 backdrop-blur-xl shadow-lg relative overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-r from-${theme}-50/30 to-${secondaryTheme}-50/30 opacity-50`} />
                            <TabsTrigger
                                value="buying"
                                className={`rounded-full flex items-center justify-center gap-2 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-${theme}-600 data-[state=active]:to-${secondaryTheme}-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 text-sm font-medium hover:text-foreground relative z-10`}
                            >
                                Buying <Badge variant="secondary" className="px-1.5 h-5 min-w-[20px] flex items-center justify-center rounded-full text-[10px] bg-white/20 text-foreground group-data-[state=active]:text-white group-data-[state=active]:bg-white/20 transition-colors">{buyingOrders.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger
                                value="selling"
                                className={`rounded-full flex items-center justify-center gap-2 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-${theme}-600 data-[state=active]:to-${secondaryTheme}-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 text-sm font-medium hover:text-foreground relative z-10`}
                            >
                                Selling <Badge variant="secondary" className="px-1.5 h-5 min-w-[20px] flex items-center justify-center rounded-full text-[10px] bg-white/20 text-foreground group-data-[state=active]:text-white group-data-[state=active]:bg-white/20 transition-colors">{sellingOrders.length}</Badge>
                            </TabsTrigger>
                        </TabsList>
                        {/* Potential Filter Dropdown could go here */}
                    </div>

                    <TabsContent value="buying" className="space-y-4 mt-0">
                        {buyingOrders.length > 0 ? (
                            buyingOrders.map((order) => (
                                <OrderCard key={order._id} order={order} isSelling={false} />
                            ))
                        ) : (
                            <EmptyState type="buying" />
                        )}
                    </TabsContent>

                    <TabsContent value="selling" className="space-y-4 mt-0">
                        {sellingOrders.length > 0 ? (
                            sellingOrders.map((order) => (
                                <OrderCard key={order._id} order={order} isSelling={true} />
                            ))
                        ) : (
                            <EmptyState type="selling" />
                        )}
                    </TabsContent>
                </Tabs>

                {/* Delivery Dialog */}
                <Dialog open={openDeliveryDialog} onOpenChange={setOpenDeliveryDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Deliver Completed Work</DialogTitle>
                            <DialogDescription>
                                Provide a link to your completed files. Ensure permissions are set correctly.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="link">File URL (Google Drive, Dropbox, etc.)</Label>
                                <Input
                                    id="link"
                                    value={deliveryLink}
                                    onChange={(e) => setDeliveryLink(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenDeliveryDialog(false)}>Cancel</Button>
                            <Button onClick={handleDeliver} className={`bg-${theme}-600 hover:bg-${theme}-700`}>
                                Send Delivery
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div >
        </div >
    );
}
