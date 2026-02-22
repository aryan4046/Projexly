import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { gigAPI } from "@/api/gigs";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Briefcase } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { DashboardLayout } from "../../components/dashboard-layout";
import { freelancerNavItems as navItems } from "../../../config/navigation";

interface CreateGigForm {
    title: string;
    description: string;
    category: string;
    price: number;
    deliveryTime: number;
    revisions: number;
    features: string; // comma separated
    image: string; // URL
}

export function CreateGig() {
    const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<CreateGigForm>({
        defaultValues: {
            revisions: 1,
            price: 5,
            deliveryTime: 1
        }
    });
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const isEditing = !!id;
    const category = watch("category");

    useEffect(() => {
        if (isEditing) {
            fetchGigDetails();
        }
    }, [id]);

    const fetchGigDetails = async () => {
        setFetching(true);
        try {
            const gig = await gigAPI.getById(id!);
            reset({
                title: gig.title,
                description: gig.description,
                category: gig.category,
                price: gig.price,
                deliveryTime: gig.deliveryTime,
                revisions: gig.revisions,
                features: gig.features.join(", "),
                image: gig.images[0] || ""
            });
        } catch (error) {
            console.error("Failed to fetch gig details", error);
            toast.error("Failed to load gig details");
            navigate("/freelancer/gigs");
        } finally {
            setFetching(false);
        }
    };

    const onSubmit = async (data: CreateGigForm) => {
        setLoading(true);
        try {
            const formattedData = {
                ...data,
                features: data.features.split(",").map(f => f.trim()),
                images: [data.image],
                price: Number(data.price),
                deliveryTime: Number(data.deliveryTime),
                revisions: Number(data.revisions)
            };

            if (isEditing) {
                await gigAPI.update(id!, formattedData);
                toast.success("Gig updated successfully!");
            } else {
                await gigAPI.create(formattedData);
                toast.success("Gig created successfully!");
            }
            navigate("/freelancer/gigs");
        } catch (error) {
            console.error(error);
            toast.error(isEditing ? "Failed to update gig." : "Failed to create gig.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="text-center p-10">Loading gig details...</div>;

    return (
        <DashboardLayout navItems={navItems} userType="freelancer" theme="emerald">
            <div className="container mx-auto py-10 max-w-2xl">
                <Button variant="ghost" className="mb-6 group text-muted-foreground hover:text-emerald-600 transition-colors" onClick={() => navigate("/freelancer/gigs")}>
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to My Gigs
                </Button>
                <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl ring-1 ring-white/10">
                    <CardHeader className="space-y-1 pb-8">
                        <div className="bg-emerald-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                            <Briefcase className="w-6 h-6 text-emerald-500" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Service Details" : "Create a New Service"}</CardTitle>
                        <p className="text-muted-foreground">Fill in the details below to publish your service to the Projexly marketplace.</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-medium">Gig Title</Label>
                                    <Input 
                                        id="title" 
                                        placeholder="I will do something amazing..." 
                                        className={cn("h-11", errors.title && "border-destructive focus-visible:ring-destructive/20")}
                                        {...register("title", { required: "Title is required" })} 
                                    />
                                    {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                                </div>
    
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                                    <Select onValueChange={(val) => setValue("category", val)} value={category}>
                                        <SelectTrigger className={cn("h-11", errors.category && "border-destructive")}>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Web Development">Web Development</SelectItem>
                                            <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                                            <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                                            <SelectItem value="Writing">Writing</SelectItem>
                                            <SelectItem value="Video Animation">Video Animation</SelectItem>
                                            <SelectItem value="AI Services">AI Services</SelectItem>
                                            <SelectItem value="Music & Audio">Music & Audio</SelectItem>
                                            <SelectItem value="Programming & Tech">Programming & Tech</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <input type="hidden" {...register("category", { required: "Category is required" })} />
                                    {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
                                </div>
    
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Describe your service in detail..." 
                                        className={cn("min-h-[150px] resize-none", errors.description && "border-destructive focus-visible:ring-destructive/20")}
                                        {...register("description", { required: "Description is required" })} 
                                    />
                                    {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-sm font-medium">Price ($)</Label>
                                    <Input 
                                        id="price" 
                                        type="number" 
                                        className={cn("h-11", errors.price && "border-destructive")}
                                        {...register("price", { required: "Price is required", min: { value: 5, message: "Min price is $5" } })} 
                                    />
                                    {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deliveryTime" className="text-sm font-medium">Delivery (Days)</Label>
                                    <Input 
                                        id="deliveryTime" 
                                        type="number" 
                                        className={cn("h-11", errors.deliveryTime && "border-destructive")}
                                        {...register("deliveryTime", { required: "Delivery time is required", min: 1 })} 
                                    />
                                    {errors.deliveryTime && <p className="text-xs text-destructive">Required</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="revisions" className="text-sm font-medium">Revisions</Label>
                                    <Input 
                                        id="revisions" 
                                        type="number" 
                                        className={cn("h-11", errors.revisions && "border-destructive")}
                                        {...register("revisions", { required: "Revisions is required", min: 0 })} 
                                    />
                                    {errors.revisions && <p className="text-xs text-destructive">Required</p>}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border/50">
                                <div className="space-y-2">
                                    <Label htmlFor="image" className="text-sm font-medium">Cover Image URL</Label>
                                    <Input 
                                        id="image" 
                                        placeholder="https://..." 
                                        className={cn("h-11", errors.image && "border-destructive")}
                                        {...register("image", { required: "Image URL is required" })} 
                                    />
                                    {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
                                </div>
    
                                <div className="space-y-2">
                                    <Label htmlFor="features" className="text-sm font-medium">Features (Comma separated)</Label>
                                    <Input 
                                        id="features" 
                                        placeholder="Source code, High resolution, etc." 
                                        className="h-11"
                                        {...register("features")} 
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]" 
                                loading={loading}
                            >
                                {isEditing ? "Update Service" : "Publish Gig"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
