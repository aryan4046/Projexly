import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    ArrowLeft,
    DollarSign,
    Clock,
    Users,
    Edit,
    Trash2,
    Calendar,
    Layers,
    CheckCircle2
} from "lucide-react";
import { projectAPI } from "../../../api/projects";
import { toast } from "sonner";
import { motion } from "motion/react";

const navItems = [
    { label: "Dashboard", path: "/student/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "My Projects", path: "/student/projects", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "Proposals", path: "/student/proposals", icon: <FileText className="w-5 h-5" /> },
];

interface Project {
    _id: string;
    title: string;
    description: string;
    budget: number;
    deadline?: string;
    skills: string[];
    status: 'open' | 'active' | 'completed' | 'draft';
    proposalsCount?: number;
    createdAt: string;
}

export function StudentProjectDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                // We might need a specific getProjectById API, or filter from getMyProjects if optimization isn't a concern yet
                // Assuming getMyProjects returns all, we can find it there or add a specific endpoint. 
                // For better practice, let's assume we might need a getById. 
                // But since api/projects.ts only has getMyProjects/getOpen, I'll use getMyProjects and find it for now to avoid backend changes if not needed
                // OR add getById to API. Let's add getById to API first/next. 
                // For now, let's try to fetch all and find. 
                const projects = await projectAPI.getMyProjects();
                const found = projects.find((p: Project) => p._id === id);
                if (found) {
                    setProject(found);
                } else {
                    toast.error("Project not found");
                    navigate("/student/projects");
                }
            } catch (error) {
                toast.error("Failed to load project details");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProject();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!project || !confirm("Are you sure you want to delete this project?")) return;
        try {
            await projectAPI.delete(project._id);
            toast.success("Project deleted successfully");
            navigate("/student/projects");
        } catch (error) {
            toast.error("Failed to delete project");
        }
    };

    if (loading) {
        return (
            <DashboardLayout navItems={navItems} userType="student">
                <div className="flex items-center justify-center h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!project) return null;

    return (
        <DashboardLayout navItems={navItems} userType="student">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/student/projects")}
                        className="rounded-full h-10 w-10 bg-background/50 hover:bg-background/80 shadow-sm border border-border/50"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Project Details</h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="overflow-hidden border shadow-lg bg-card/50 backdrop-blur-sm">
                        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-3xl font-extrabold text-foreground">{project.title}</h2>
                                        <Badge variant={project.status === 'completed' ? 'default' : 'secondary'} className="capitalize h-6 px-3">
                                            {project.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center text-muted-foreground gap-4 text-sm">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" /> Posted {new Date(project.createdAt).toLocaleDateString()}
                                        </span>
                                        {project.deadline && (
                                            <span className="flex items-center gap-1 text-orange-600 font-medium">
                                                <Clock className="w-4 h-4" /> Due {new Date(project.deadline).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => navigate(`/student/projects/edit/${project._id}`)}>
                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                    </Button>
                                    <Button variant="destructive" onClick={handleDelete}>
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">Budget</span>
                                    <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center">
                                        <DollarSign className="w-5 h-5 mr-1" />
                                        {project.budget.toLocaleString()}
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">Proposals</span>
                                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 flex items-center">
                                        <Users className="w-5 h-5 mr-2" />
                                        {project.proposalsCount || 0}
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Status</span>
                                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 flex items-center capitalize">
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        {project.status}
                                    </div>
                                </div>
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
        </DashboardLayout>
    );
}
