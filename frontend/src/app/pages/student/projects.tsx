import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  DollarSign,
  Users,
  Edit,
  Eye,
  Trash2,
  MoreVertical,
  Plus,
  Layers,
  ArrowRight
} from "lucide-react";
import { projectAPI } from "../../../api/projects";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline?: string;
  skills: string[];
  status: 'open' | 'active' | 'completed' | 'draft';
  proposalsCount?: number; // Assuming backend might return this or we calculate
  createdAt: string;
}

const navItems = [
  { label: "Dashboard", path: "/student/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "My Projects", path: "/student/projects", icon: <FolderKanban className="w-5 h-5" /> },
  { label: "Proposals", path: "/student/proposals", icon: <FileText className="w-5 h-5" /> },
];

export function StudentProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectAPI.getMyProjects();
        setProjects(data);
      } catch (error) {
        toast.error("Failed to load projects");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await projectAPI.delete(id);
      setProjects(projects.filter(p => p._id !== id));
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const activeProjects = projects.filter(p => p.status === 'open' || p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const draftProjects = projects.filter(p => p.status === 'draft');

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} userType="student">
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const ProjectCard = ({ project }: { project: Project }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden border hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm relative h-full flex flex-col">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">{project.title}</h3>
                <Badge variant={project.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                  {project.status}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{project.description}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/projects/${project._id}`)}>
                  <Eye className="w-4 h-4 mr-2" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/student/projects/edit/${project._id}`)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(project._id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {(project.skills || []).slice(0, 3).map((skill, i) => (
              <Badge key={i} variant="outline" className="bg-background/50 text-xs font-normal text-muted-foreground">
                {skill}
              </Badge>
            ))}
            {(project.skills || []).length > 3 && (
              <Badge variant="outline" className="bg-background/50 text-xs font-normal text-muted-foreground">
                +{(project.skills || []).length - 3}
              </Badge>
            )}
          </div>

          <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Budget</span>
              <div className="flex items-center font-bold text-foreground">
                <DollarSign className="w-3.5 h-3.5 text-green-500 mr-1" />
                {project.budget.toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Proposals</span>
              <div className="flex items-center font-bold text-foreground">
                <Users className="w-3.5 h-3.5 text-blue-500 mr-1" />
                {project.proposalsCount || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="default" size="sm" className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate(`/projects/${project._id}`)}>
            View Details <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <DashboardLayout navItems={navItems} userType="student">
      <div className="min-h-screen bg-transparent">
        {/* Header */}
        <div className="relative mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-extrabold tracking-tight mb-1">My Projects</h1>
              <p className="text-muted-foreground">Manage and track all your posted projects.</p>
            </motion.div>
          </div>

          <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/25 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all hover:scale-105">
            <Link to="/student/projects/new">
              <Plus className="w-5 h-5 mr-2" /> Post New Project
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="active" className="space-y-8">
          <TabsList className="bg-white/60 p-1 rounded-full border border-white/40 backdrop-blur-xl shadow-lg inline-flex h-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 opacity-50" />
            <TabsTrigger
              value="active"
              className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 relative z-10"
            >
              Active ({activeProjects.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 relative z-10"
            >
              Completed ({completedProjects.length})
            </TabsTrigger>
            <TabsTrigger
              value="draft"
              className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 relative z-10"
            >
              Drafts ({draftProjects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="min-h-[300px]">
            {activeProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeProjects.map(p => <ProjectCard key={p._id} project={p} />)}
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent value="completed" className="min-h-[300px]">
            {completedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedProjects.map(p => <ProjectCard key={p._id} project={p} />)}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">No completed projects yet.</div>
            )}
          </TabsContent>

          <TabsContent value="draft" className="min-h-[300px]">
            {draftProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftProjects.map(p => <ProjectCard key={p._id} project={p} />)}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">No draft projects.</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

const EmptyState = () => (
  <div className="text-center py-24 bg-muted/10 rounded-3xl border border-dashed border-muted-foreground/20 flex flex-col items-center">
    <div className="bg-muted/30 w-20 h-20 rounded-full flex items-center justify-center mb-6">
      <Layers className="w-10 h-10 text-muted-foreground/40" />
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-2">No active projects</h3>
    <p className="text-muted-foreground max-w-md mx-auto mb-8">
      You haven't posted any projects yet. Start by creating a project to find talented freelancers.
    </p>
    <Button asChild className="rounded-full" size="lg">
      <Link to="/student/projects/new">Post a Project</Link>
    </Button>
  </div>
);
