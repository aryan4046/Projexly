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
import { ArrowLeft, Briefcase, LayoutDashboard } from "lucide-react";
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
    const { register, handleSubmit, setValue, reset } = useForm<CreateGigForm>();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const isEditing = !!id;

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
                <Button variant="ghost" className="mb-4 pl-0 hover:pl-2 transition-all" onClick={() => navigate("/freelancer/gigs")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Gigs
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{isEditing ? "Edit Gig" : "Create a New Gig"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Gig Title</Label>
                                <Input id="title" placeholder="I will do something amazing..." {...register("title", { required: true })} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select onValueChange={(val) => setValue("category", val)} defaultValue={isEditing ? undefined : ""}> {/* Need to handle default value for select correctly with RHF but setValue works */}
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Web Development">Web Development</SelectItem>
                                        <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                                        <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                                        <SelectItem value="Writing">Writing</SelectItem>
                                        <SelectItem value="Video Animation">Video Animation</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" placeholder="Describe your service in detail..." className="min-h-[150px]" {...register("description", { required: true })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price ($)</Label>
                                    <Input id="price" type="number" {...register("price", { required: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deliveryTime">Delivery Time (Days)</Label>
                                    <Input id="deliveryTime" type="number" {...register("deliveryTime", { required: true })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Cover Image URL</Label>
                                <Input id="image" placeholder="https://..." {...register("image", { required: true })} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="features">Features (Comma separated)</Label>
                                <Input id="features" placeholder="Source code, High resolution, etc." {...register("features")} />
                            </div>

                            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                                {loading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Gig" : "Publish Gig")}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
