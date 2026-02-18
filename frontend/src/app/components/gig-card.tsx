import { Gig } from "@/api/gigs";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Star, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

interface GigCardProps {
    gig: Gig;
}

export function GigCard({ gig }: GigCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Link to={`/gigs/${gig._id}`}>
                <Card className="group h-full overflow-hidden border-border/50 bg-card hover:border-primary/50 hover:shadow-xl transition-all duration-300">
                    <div className="relative aspect-video w-full overflow-hidden">
                        <img
                            src={gig.images[0] || "https://placehold.co/600x400?text=No+Image"}
                            alt={gig.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background text-muted-foreground hover:text-red-500 transition-colors">
                                <Heart className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="absolute bottom-2 left-2">
                            <Badge variant="secondary" className="bg-background/80 backdrop-blur-md shadow-sm">
                                {gig.category}
                            </Badge>
                        </div>
                    </div>

                    <CardHeader className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6 ring-2 ring-background">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${gig.freelancer.name}`} />
                                    <AvatarFallback>{gig.freelancer.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                    {gig.freelancer.name}
                                </span>
                            </div>
                            {gig.rating > 0 && (
                                <div className="flex items-center gap-1 text-xs font-semibold bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full">
                                    <Star className="h-3 w-3 fill-current" />
                                    <span>{gig.rating.toFixed(1)}</span>
                                    <span className="text-muted-foreground/60 font-normal">({gig.reviewCount})</span>
                                </div>
                            )}
                        </div>
                        <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                            {gig.title}
                        </h3>
                    </CardHeader>

                    <CardContent className="p-4 pt-0">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{gig.deliveryTime} Days</span>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 mt-auto border-t border-border/50 bg-secondary/5">
                        <div className="flex items-center justify-between w-full mt-3">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Starting at</span>
                            <span className="text-lg font-bold text-primary">
                                ${gig.price}
                            </span>
                        </div>
                    </CardFooter>
                </Card>
            </Link>
        </motion.div>
    );
}
