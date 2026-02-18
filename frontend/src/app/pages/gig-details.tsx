import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Check, Clock, RotateCcw, Star } from "lucide-react";

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

    if (loading) return <div className="container py-10">Loading...</div>;
    if (!gig) return <div className="container py-10">Gig not found</div>;

    return (
        <div className="container mx-auto py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-muted">
                        <img
                            src={gig.images[0] || "https://placehold.co/800x400?text=No+Image"}
                            alt={gig.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </Card>

                <div>
                    <h1 className="text-3xl font-bold mb-4">{gig.title}</h1>
                    <div className="flex items-center gap-4 mb-6">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${gig.freelancer.name}`} />
                            <AvatarFallback>{gig.freelancer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{gig.freelancer.name}</p>
                            <div className="flex items-center text-sm text-yellow-500">
                                <Star className="h-4 w-4 fill-current mr-1" />
                                <span className="font-medium text-foreground">{gig.rating.toFixed(1)}</span>
                                <span className="text-muted-foreground ml-1">({gig.reviewCount} reviews)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-xl font-semibold mb-2">About This Gig</h3>
                    <p className="whitespace-pre-wrap text-muted-foreground">{gig.description}</p>
                </div>
            </div>

            <div className="lg:col-span-1">
                <Card className="sticky top-24">
                    <CardHeader>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-muted-foreground">Standard Package</span>
                            <span className="text-2xl font-bold">${gig.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">A complete package to get your requirements done.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm font-medium">
                            <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4" />
                                {gig.deliveryTime} Days Delivery
                            </div>
                            <div className="flex items-center">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                {gig.revisions} Revisions
                            </div>
                        </div>

                        <Separator />

                        <ul className="space-y-2 text-sm">
                            {gig.features.map((feature, i) => (
                                <li key={i} className="flex items-start">
                                    <Check className="mr-2 h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full" size="lg">Continue (${gig.price})</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Order Requirements</DialogTitle>
                                    <DialogDescription>
                                        Please describe what you need for this order. The freelancer will use this to start working.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="requirements">Requirements</Label>
                                        <Textarea
                                            id="requirements"
                                            placeholder="I need..."
                                            value={requirements}
                                            onChange={(e) => setRequirements(e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleOrder} disabled={orderLoading || !requirements}>
                                        {orderLoading ? "Processing..." : "Confirm & Pay"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
