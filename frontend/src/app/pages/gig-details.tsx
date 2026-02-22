import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { gigAPI, Gig } from "@/api/gigs";
import { orderAPI } from "@/api/orders";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Separator } from "@/app/components/ui/separator";
import { Textarea } from "@/app/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";
import { Check, Clock, RotateCcw, Star, ArrowLeft, ChevronRight, ShieldCheck, Zap, Info } from "lucide-react";
import { DashboardLayout } from "../components/dashboard-layout";
import { studentNavItems as navItems } from "../../config/navigation";
import { Badge } from "@/app/components/ui/badge";
import { motion } from "motion/react";

export function GigDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [gig, setGig] = useState<Gig | null>(null);
    const [loading, setLoading] = useState(true);
    const [requirements, setRequirements] = useState("");
    const [orderLoading, setOrderLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchGig = async () => {
            if (!id) return;
            try {
                const data = await gigAPI.getById(id);
                setGig(data);
            } catch (error) {
                console.error("Failed to fetch gig details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGig();
    }, [id]);

    const handleOrder = async () => {
        if (!gig) return;
        setOrderLoading(true);
        try {
            await orderAPI.create(gig._id, requirements);
            toast.success("Order placed successfully!");
            setOpen(false);
            navigate("/orders");
        } catch (error) {
            console.error(error);
            toast.error("Failed to place order. You cannot order your own gig.");
        } finally {
            setOrderLoading(false);
        }
    };

    if (loading) return (
        <DashboardLayout navItems={navItems} userType="student" theme="indigo">
            <div className="container py-20 text-center space-y-4">
                <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
                <p className="text-muted-foreground font-medium">Loading professional services...</p>
            </div>
        </DashboardLayout>
    );

    if (!gig) return (
        <DashboardLayout navItems={navItems} userType="student" theme="indigo">
            <div className="container py-20 text-center">
                <h2 className="text-2xl font-bold">Service not found</h2>
                <Button className="mt-4" onClick={() => navigate("/gigs")}>Back to Marketplace</Button>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout navItems={navItems} userType="student" theme="indigo">
            <div className="container mx-auto py-8">
                {/* Header Section: Back Button & Breadcrumbs */}
                <div className="flex flex-col gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full bg-white/60 backdrop-blur-md border-white/40 shadow-sm hover:bg-white/90 transition-all font-black text-indigo-600 group px-5 h-11 shrink-0"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Go Back
                        </Button>
                        <nav className="flex items-center gap-2 text-sm text-muted-foreground overflow-hidden">
                            <Link to="/student/dashboard" className="hover:text-indigo-600 transition-colors font-bold shrink-0">Home</Link>
                            <ChevronRight className="w-4 h-4 opacity-30 shrink-0" />
                            <Link to="/gigs" className="hover:text-indigo-600 transition-colors font-bold shrink-0">Marketplace</Link>
                            <ChevronRight className="w-4 h-4 opacity-30 shrink-0" />
                            <span className="text-foreground font-black truncate max-w-[150px] md:max-w-[300px]">{gig.title}</span>
                        </nav>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    {/* Left Column: Content */}
                    <div className="lg:col-span-2 space-y-10">
                        <section className="space-y-6">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
                                {gig.title}
                            </h1>
                            
                            <div className="flex flex-wrap items-center gap-6 py-2">
                                <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/40 shadow-sm">
                                    <Avatar className="h-10 w-10 ring-2 ring-indigo-100">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${gig.freelancer.name}`} />
                                        <AvatarFallback className="font-bold text-indigo-600">
                                            {gig.freelancer.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-sm text-foreground leading-none mb-1">{gig.freelancer.name}</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex items-center text-yellow-500">
                                                <Star className="h-3 w-3 fill-current" />
                                                <span className="text-[11px] font-black ml-1 text-foreground">{gig.rating.toFixed(1)}</span>
                                            </div>
                                            <Separator orientation="vertical" className="h-3 mx-1" />
                                            <span className="text-[11px] font-bold text-muted-foreground">{gig.reviewCount} Reviews</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs uppercase tracking-widest">
                                    <Zap className="w-4 h-4" />
                                    Top Rated Seller
                                </div>
                            </div>
                        </section>

                        {/* Image Gallery - Smaller Size */}
                        <div className="flex justify-center">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative group rounded-[2rem] overflow-hidden bg-card/40 backdrop-blur-xl border border-white/20 shadow-xl max-w-2xl w-full"
                            >
                                <img
                                    src={gig.images[0] || "https://placehold.co/1200x800?text=Premium+Service"}
                                    alt={gig.title}
                                    className="w-full aspect-[21/9] object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </motion.div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-1.5 bg-indigo-600 rounded-full" />
                                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">About This Gig</h3>
                            </div>
                            <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-sm">
                                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-lg italic font-medium">
                                    {gig.description}
                                </p>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100 flex gap-4">
                                <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 shrink-0">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-foreground">Verified Quality</h4>
                                    <p className="text-sm text-muted-foreground">Every delivery is guaranteed to meet professional standards.</p>
                                </div>
                            </div>
                            <div className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100 flex gap-4">
                                <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 shrink-0">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-foreground">Quick Turnaround</h4>
                                    <p className="text-sm text-muted-foreground">Fast results without compromising on detail or accuracy.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Pricing & Contact */}
                    <div className="lg:col-span-1">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="sticky top-28"
                        >
                            <Card className="rounded-[2.5rem] overflow-hidden border-none bg-card/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-white/20">
                                <CardHeader className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold uppercase tracking-[0.2em] text-[10px] opacity-80">Premium Package</span>
                                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md font-bold text-xs">Standard</Badge>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black">${gig.price}</span>
                                        <span className="text-sm font-bold opacity-60">/ Order</span>
                                    </div>
                                    <CardTitle className="text-xl font-bold mt-4 leading-snug">
                                        Full Professional Service Package
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <p className="text-muted-foreground font-medium leading-relaxed">
                                        Get your project started today with our comprehensive professional service tailored to your needs.
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Delivery</span>
                                                <span className="text-sm font-black">{gig.deliveryTime} Days</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                                                <RotateCcw className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Revisions</span>
                                                <span className="text-sm font-black">{gig.revisions} Cycles</span>
                                            </div>
                                        </div>
                                    </div>

                                    <ul className="space-y-4">
                                        <h4 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                            <Info className="w-4 h-4 text-indigo-500" /> What's Included
                                        </h4>
                                        {gig.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-4 p-3 rounded-2xl bg-white/40 border border-white/60 hover:border-indigo-200 transition-colors">
                                                <div className="mt-0.5 p-1 rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/20 shrink-0">
                                                    <Check className="h-3 w-3" />
                                                </div>
                                                <span className="text-sm font-bold text-muted-foreground leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter className="px-8 pb-8">
                                    <Dialog open={open} onOpenChange={setOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="w-full h-16 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-black text-lg shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                                Order Now <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="rounded-3xl border-none shadow-2xl ring-1 ring-white/20 bg-card/95 backdrop-blur-xl">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl font-black">Project Requirements</DialogTitle>
                                                <DialogDescription className="text-lg font-medium">
                                                    Share your vision with the freelancer to ensure the best results.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-6">
                                                <div className="space-y-3">
                                                    <Label htmlFor="requirements" className="text-sm font-black uppercase tracking-widest text-muted-foreground">Detailed Brief</Label>
                                                    <Textarea
                                                        id="requirements"
                                                        placeholder="Describe your goals, preferred style, and any specific assets you have..."
                                                        value={requirements}
                                                        onChange={(e) => setRequirements(e.target.value)}
                                                        className="min-h-[180px] rounded-2xl bg-white/50 border-white/60 focus-visible:ring-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button 
                                                    onClick={handleOrder} 
                                                    disabled={orderLoading || !requirements}
                                                    className="w-full h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-600/20"
                                                >
                                                    {orderLoading ? "Securing Payment..." : "Confirm & Place Order"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardFooter>
                                <p className="text-center text-[10px] text-muted-foreground/60 pb-6 px-8 leading-tight">
                                    Secured by Projexly Escrow. Payments are only released when you're 100% satisfied with the work.
                                </p>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
