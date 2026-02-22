import { Gig } from "@/api/gigs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Star, Clock, Heart, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { TimeAgo } from "./ui/time-ago";

interface GigCardProps {
    gig: Gig;
}

export function GigCard({ gig }: GigCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <Link to={`/gigs/${gig._id}`}>
                <div className="group relative h-full rounded-3xl overflow-hidden bg-card/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                    {/* Image Container with Hover Effect */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <img
                            src={gig.images[0] || "https://placehold.co/600x400?text=No+Image"}
                            alt={gig.title}
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
                        
                        {/* Tags & Actions */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                            <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 px-3 py-1 text-[10px] uppercase tracking-wider font-bold">
                                {gig.category}
                            </Badge>
                            <button className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-red-500 hover:bg-white/20 transition-all transform hover:scale-110">
                                <Heart className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Price Tag Overlay */}
                        <div className="absolute bottom-4 right-4">
                            <div className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/20">
                                ${gig.price}
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 ring-2 ring-white/10">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${gig.freelancer.name}`} />
                                <AvatarFallback className="bg-primary/20 text-[10px] font-bold">
                                    {gig.freelancer.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                    {gig.freelancer.name}
                                </span>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                                    <span className="text-[10px] font-bold">{gig.rating.toFixed(1)}</span>
                                    <span className="text-[10px] text-muted-foreground">({gig.reviewCount})</span>
                                </div>
                            </div>
                        </div>

                        <h3 className="font-bold text-lg leading-tight line-clamp-2 h-[3.5rem] bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text group-hover:text-primary transition-colors">
                            {gig.title}
                        </h3>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 text-primary/70" />
                                <TimeAgo date={Date.now() + gig.deliveryTime * 86400000} addSuffix={false} /> Delivery
                            </div>
                            <div className="group-hover:translate-x-1 transition-transform">
                                <ArrowUpRight className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Progress Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
            </Link>
        </motion.div>
    );
}
