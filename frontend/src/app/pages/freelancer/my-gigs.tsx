import { useEffect, useState } from "react";
import { gigAPI, Gig } from "@/api/gigs";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { CardHeader } from "@/app/components/ui/card";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import {
    Plus,
    Pencil,
    Trash2,
    Eye,
    Star,
    Briefcase,
    Clock
} from "lucide-react";
import { toast } from "sonner";
import { freelancerNavItems as navItems } from "../../../config/navigation";
import { DashboardLayout } from "../../components/dashboard-layout";

export function MyGigs() {
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGigs();
    }, []);

    const fetchGigs = async () => {
        try {
            const data = await gigAPI.getMyGigs();
            setGigs(data);
        } catch (error) {
            console.error("Failed to fetch my gigs", error);
            toast.error("Failed to load gigs");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this gig? This action cannot be undone.")) return;
        try {
            await gigAPI.delete(id);
            setGigs(gigs.filter(g => g._id !== id));
            toast.success("Gig deleted successfully");
        } catch (error) {
            console.error("Failed to delete gig", error);
            toast.error("Failed to delete gig");
        }
    };



    if (loading) return (
        <DashboardLayout navItems={navItems} userType="freelancer" theme="emerald">
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout navItems={navItems} userType="freelancer" theme="emerald">
            <div className="min-h-screen bg-none space-y-8 pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Gigs</h1>
                        <p className="text-muted-foreground mt-1">Manage your services and track their performance.</p>
                    </div>
                    <Button onClick={() => navigate("/freelancer/create-gig")} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
                        <Plus className="mr-2 h-4 w-4" /> Create New Gig
                    </Button>
                </div>

                {/* Gigs Grid */}
                {gigs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {gigs.map((gig) => (
                            <ManageGigCard
                                key={gig._id}
                                gig={gig}
                                onDelete={() => handleDelete(gig._id)}
                                onEdit={() => navigate(`/freelancer/edit-gig/${gig._id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed rounded-3xl bg-card/50"
                    >
                        <div className="bg-emerald-50/50 p-6 rounded-full mb-6">
                            <Briefcase className="w-12 h-12 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No Gigs Yet</h2>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Start selling your services to millions of buyers. Create your first gig today!
                        </p>
                        <Button onClick={() => navigate("/freelancer/create-gig")} size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="mr-2 h-4 w-4" /> Create Your First Gig
                        </Button>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
}

function ManageGigCard({ gig, onDelete, onEdit }: { gig: Gig, onDelete: () => void, onEdit: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group"
        >
            <div className="relative h-full rounded-3xl overflow-hidden bg-card/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500">
                {/* Image Section with Glass Overlay */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <img
                        src={gig.images[0] || "https://placehold.co/600x400?text=No+Image"}
                        alt={gig.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                        <Badge className="bg-emerald-500/20 backdrop-blur-md text-emerald-400 border-none px-3 py-1 text-[10px] uppercase tracking-wider font-bold">
                            {gig.category}
                        </Badge>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0">
                            <Button 
                                variant="secondary" 
                                size="icon" 
                                className="h-8 w-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-emerald-500 hover:text-white transition-all shadow-xl"
                                onClick={onEdit}
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                                variant="secondary" 
                                size="icon" 
                                className="h-8 w-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                                onClick={onDelete}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Quick Stats Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/5">
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-bold text-white">{gig.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/5">
                                <Clock className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-xs font-bold text-white">{gig.deliveryTime}d</span>
                            </div>
                        </div>
                        <div className="text-xl font-black text-white drop-shadow-lg">
                            ${gig.price}
                        </div>
                    </div>
                </div>

                {/* Info Content */}
                <CardHeader className="p-6 space-y-3">
                    <Link to={`/gigs/${gig._id}`}>
                        <h3 className="text-lg font-bold leading-tight line-clamp-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text group-hover:text-emerald-500 transition-colors">
                            {gig.title}
                        </h3>
                    </Link>
                    
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                        <div className="flex items-center gap-1.5 bg-secondary/30 px-2 py-1 rounded-lg border border-border/50">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>{gig.reviewCount} Orders</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-secondary/30 px-2 py-1 rounded-lg border border-border/50">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                        </div>
                    </div>
                </CardHeader>

                {/* Hover Action Preview */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
        </motion.div>
    );
}
