import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
    LayoutDashboard,
    Search,
    FileText,
    DollarSign,
    Clock,
    ArrowLeft,
    Calendar,
    Layers,
    Send
} from "lucide-react";
import { projectAPI } from "../../../api/projects";
import { proposalAPI } from "../../../api/proposals";
import { toast } from "sonner";
import { motion } from "motion/react";

import { freelancerNavItems as navItems } from "../../../config/navigation";

interface Project {
    _id: string;
    title: string;
    description: string;
    budget: number;
    deadline?: string;
    skills: string[];
    status: 'open' | 'active' | 'completed' | 'draft';
    createdAt: string;
    student?: {
        name: string;
        email: string;
    };
}

export function FreelancerProjectDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Proposal Form State
    const [message, setMessage] = useState("");
    const [bidAmount, setBidAmount] = useState("");

    useEffect(() => {
        const fetchProject = async () => {
            try {
                if (!id) return;
                const data = await projectAPI.getProjectById(id);
                setProject(data);
                // Pre-fill bid amount with project budget as a starting point
                if (data && data.budget) {
                    setBidAmount(data.budget.toString());
                }
            } catch (error) {
                toast.error("Failed to load project details");
                console.error(error);
                navigate("/freelancer/browse");
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id, navigate]);

    const handleSubmitProposal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project || !id) return;

        setSubmitting(true);
        try {
            await proposalAPI.create({
                projectId: id,
                message: message,
                bidAmount: Number(bidAmount)
            });
            toast.success("Proposal submitted successfully!");
            navigate("/freelancer/proposals");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit proposal");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout navItems={navItems} userType="freelancer" theme="emerald">
                <div className="flex items-center justify-center h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!project) return null;

    return (
        <DashboardLayout navItems={navItems} userType="freelancer" theme="emerald">
            <div className="max-w-4xl mx-auto pb-10">
                <div className="mb-6 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/freelancer/browse")}
                        className="rounded-full h-10 w-10 bg-background/50 hover:bg-background/80 shadow-sm border border-border/50"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Project Details</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Project Info - Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="overflow-hidden border shadow-lg bg-card/50 backdrop-blur-sm">
                                <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500" />
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <Badge variant={project.status === 'open' ? 'default' : 'secondary'} className="capitalize">
                                            {project.status === 'open' ? 'Open for Proposals' : project.status}
                                        </Badge>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" /> Posted {new Date(project.createdAt).toLocaleDateString()}
                                            </span>
                                            {project.student && (
                                                <span className="flex items-center gap-1 font-medium text-foreground">
                                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-[10px] text-white">
                                                        {project.student.name.charAt(0)}
                                                    </div>
                                                    {project.student.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <h2 className="text-3xl font-extrabold text-foreground mb-4">{project.title}</h2>

                                    <div className="flex flex-wrap gap-4 mb-8 text-sm">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="font-semibold">Budget: ${project.budget.toLocaleString()}</span>
                                        </div>
                                        {project.deadline && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg border border-orange-100 dark:border-orange-900/30">
                                                <Clock className="w-4 h-4" />
                                                <span className="font-semibold">Due: {new Date(project.deadline).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-muted-foreground" /> Description
                                            </h3>
                                            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {project.description}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                                <Layers className="w-5 h-5 text-muted-foreground" /> Skills Required
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {(project.skills || []).map(skill => (
                                                    <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm bg-secondary/50">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Proposal Form - Right Column */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="p-6 border shadow-lg sticky top-24 bg-card/80 backdrop-blur-md">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Send className="w-5 h-5 text-primary" /> Submit Proposal
                                </h3>

                                <form onSubmit={handleSubmitProposal} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bidAmount">Your Bid ($)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="bidAmount"
                                                type="number"
                                                className="pl-9"
                                                placeholder="Enter amount"
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="coverLetter">Cover Letter</Label>
                                        <Textarea
                                            id="coverLetter"
                                            placeholder="Explain why you are the best fit for this project..."
                                            className="min-h-[150px] resize-none"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-[1.02] transition-transform" disabled={submitting}>
                                            {submitting ? "Sending..." : "Send Proposal"}
                                        </Button>
                                        <p className="text-xs text-center text-muted-foreground mt-3">
                                            By submitting, you agree to our terms of service.
                                        </p>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
