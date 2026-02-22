import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gigAPI, Gig } from "@/api/gigs";
import { GigCard } from "@/app/components/gig-card";

import { Button } from "@/app/components/ui/button";
import { motion } from "motion/react";
import { Search, SlidersHorizontal, ArrowUpRight, ArrowLeft } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { io } from "socket.io-client";

const CATEGORIES = [
    "Web Development",
    "Graphic Design",
    "Digital Marketing",
    "Writing",
    "Video Animation",
    "AI Services",
    "Music & Audio",
    "Programming & Tech"
];

export function BrowseGigs() {
    const navigate = useNavigate();
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sort, setSort] = useState("newest");

    const fetchGigs = async () => {
        setLoading(true);
        try {
            const data = await gigAPI.getAll({
                search,
                category: selectedCategory === "All" ? "" : selectedCategory || "",
                sort
            });
            setGigs(data);
        } catch (error) {
            console.error("Failed to fetch gigs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchGigs();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, selectedCategory, sort]);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000");

        socket.on("gig_new", (newGig: Gig) => {
            setGigs(prev => [newGig, ...prev]);
        });

        socket.on("gig_deleted", (deletedGigId: string) => {
            setGigs(prev => prev.filter(g => g._id !== deletedGigId));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

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
                    className="absolute top-4 left-4 md:top-8 md:left-8 z-50 flex items-center gap-2 px-5 py-2.5 bg-background/40 backdrop-blur-xl border border-white/10 rounded-full shadow-lg hover:shadow-primary/20 hover:border-primary/50 hover:bg-background/60 transition-all duration-300 group"
                >
                    <div className="bg-primary/10 p-1 rounded-full group-hover:bg-primary/20 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-0.5 transition-transform" />
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
                            Find the perfect <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">freelance services</span> for your business
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Connect with top-rated freelancers for any project, big or small.
                            Start your journey today.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="max-w-2xl mx-auto mt-8 flex group focus-within:ring-2 focus-within:ring-primary/20 rounded-full shadow-lg bg-card p-2 border"
                    >
                        <div className="flex-1 flex items-center px-4">
                            <Search className="w-5 h-5 text-muted-foreground mr-3" />
                            <input
                                type="text"
                                placeholder="What service are you looking for?"
                                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button size="lg" className="rounded-full px-8">Search</Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap justify-center gap-3 mt-6 text-sm text-muted-foreground"
                    >
                        <span>Popular:</span>
                        {["Website Design", "WordPress", "Logo Design", "AI Services"].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSearch(tag)}
                                className="hover:text-primary transition-colors border border-transparent hover:border-border rounded-full px-3 py-0.5"
                            >
                                {tag}
                            </button>
                        ))}
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Filters Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 border-b">
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        <Button
                            variant={selectedCategory === null ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(null)}
                            className="rounded-full whitespace-nowrap"
                        >
                            All
                        </Button>
                        {CATEGORIES.map(cat => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                className="rounded-full whitespace-nowrap"
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm text-muted-foreground hidden sm:inline-block">
                            {gigs.length} Services available
                        </span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <SlidersHorizontal className="w-4 h-4" /> Filters
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuCheckboxItem checked={sort === "newest"} onCheckedChange={() => setSort("newest")}>
                                    New Arrivals
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={sort === "price_asc"} onCheckedChange={() => setSort("price_asc")}>
                                    Price: Low to High
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={sort === "price_desc"} onCheckedChange={() => setSort("price_desc")}>
                                    Price: High to Low
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-[320px] bg-muted/20 animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : gigs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {gigs.map((gig, index) => (
                            <motion.div
                                key={gig._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <GigCard gig={gig} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                            <Search className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">No gigs found</h3>
                        <p className="text-muted-foreground mt-2 max-w-md">
                            We couldn't find any services matching your search. Try adjusting your filters or search terms.
                        </p>
                        <Button variant="link" onClick={() => { setSearch(""); setSelectedCategory(null); }} className="mt-4 text-primary gap-1">
                            Clear all filters <ArrowUpRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
