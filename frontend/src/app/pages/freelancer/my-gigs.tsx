import { useEffect, useState } from "react";
import { gigAPI, Gig } from "@/api/gigs";
import { Button } from "@/app/components/ui/button";
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
import { DashboardLayout } from "@/app/components/dashboard-layout";
import { Card, CardFooter, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { motion } from "motion/react";
import { toast } from "sonner";

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

    const navItems = [
        { label: "Dashboard", path: "/freelancer/dashboard", icon: <Briefcase className="w-5 h-5" /> },
        { label: "My Gigs", path: "/freelancer/my-gigs", icon: <Briefcase className="w-5 h-5" /> },
    ];

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
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="group h-full overflow-hidden border-border/50 bg-card hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 flex flex-col">
                {/* Image Section */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    <img
                        src={gig.images[0] || "https://placehold.co/600x400?text=No+Image"}
                        alt={gig.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-md shadow-sm">
                            {gig.category}
                        </Badge>
                    </div>
                </div>

                {/* Content Section */}
                <CardHeader className="p-4 space-y-3 flex-1">
                    <div className="flex justify-between items-start gap-2">
                        <Link to={`/gigs/${gig._id}`} className="hover:underline">
                            <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                {gig.title}
                            </h3>
                        </Link>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-medium text-foreground">{gig.rating.toFixed(1)}</span>
                            <span>({gig.reviewCount})</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{gig.deliveryTime}d</span>
                        </div>
                    </div>
                </CardHeader>

                {/* Footer / Actions */}
                <CardFooter className="p-4 pt-0 mt-auto border-t border-border/50 bg-secondary/5">
                    <div className="flex items-center justify-between w-full mt-3">
                        <span className="text-lg font-bold text-emerald-600">${gig.price}</span>

                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-500" onClick={onEdit}>
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onDelete}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-emerald-600">
                                <Link to={`/gigs/${gig._id}`}>
                                    <Eye className="w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
