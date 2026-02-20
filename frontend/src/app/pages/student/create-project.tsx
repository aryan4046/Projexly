import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    ArrowLeft,
    DollarSign,
    Calendar,
    Layers,
    Sparkles
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import { projectAPI } from "../../../api/projects";

import { studentNavItems as navItems } from "../../../config/navigation";

export function CreateProject() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        budget: "",
        deadline: "",
        skills: "",
    });

    useEffect(() => {
        if (isEditMode && id) {
            const fetchProject = async () => {
                try {
                    const projects = await projectAPI.getMyProjects();
                    // @ts-ignore
                    const project = projects.find(p => p._id === id);
                    if (project) {
                        setFormData({
                            title: project.title,
                            description: project.description,
                            budget: project.budget.toString(),
                            deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : "",
                            skills: (project.skills || []).join(", "),
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch project details", error);
                }
            };
            fetchProject();
        }
    }, [id, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate inputs
            if (!formData.title || !formData.description || !formData.budget) {
                toast.error("Please fill in all required fields");
                setLoading(false);
                return;
            }

            const payload = {
                ...formData,
                budget: Number(formData.budget),
                skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean)
            };

            if (isEditMode && id) {
                await projectAPI.update(id, payload);
                toast.success("Project updated successfully!");
            } else {
                await projectAPI.create(payload);
                toast.success("Project posted successfully!");
            }

            navigate("/student/projects");
        } catch (error) {
            console.error(error);
            toast.error(isEditMode ? "Failed to update project" : "Failed to post project");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout navItems={navItems} userType="student" theme="indigo">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="rounded-full h-10 w-10 bg-background/50 hover:bg-background/80 shadow-sm border border-border/50"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-3xl font-extrabold tracking-tight mb-1">{isEditMode ? "Edit Project" : "Post a New Project"}</h1>
                        <p className="text-muted-foreground">{isEditMode ? "Update your project details" : "Describe your project and find the perfect freelancer."}</p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="p-8 border shadow-lg bg-card/50 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-base font-semibold flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-yellow-500" /> Project Title
                                    </Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. E-Commerce Website Development"
                                        className="h-12 text-lg bg-background/50"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-base font-semibold">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Describe your project requirements in detail..."
                                        className="min-h-[150px] bg-background/50 resize-y"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="budget" className="text-base font-semibold flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-green-500" /> Budget (USD)
                                    </Label>
                                    <Input
                                        id="budget"
                                        name="budget"
                                        type="number"
                                        min="0"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        placeholder="5000"
                                        className="h-11 bg-background/50"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deadline" className="text-base font-semibold flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-orange-500" /> Deadline
                                    </Label>
                                    <Input
                                        id="deadline"
                                        name="deadline"
                                        type="date"
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        className="h-11 bg-background/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="skills" className="text-base font-semibold flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-blue-500" /> Required Skills
                                </Label>
                                <Input
                                    id="skills"
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    placeholder="React, Node.js, Design (comma separated)"
                                    className="h-11 bg-background/50"
                                />
                                <p className="text-xs text-muted-foreground ml-1">Separate skills with commas</p>
                            </div>

                            <div className="pt-4 flex justify-end gap-4">
                                <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                                    Cancel
                                </Button>
                                <Button type="submit" size="lg" className="px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200" disabled={loading}>
                                    {loading ? "Saving..." : (isEditMode ? "Update Project" : "Post Project")}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
