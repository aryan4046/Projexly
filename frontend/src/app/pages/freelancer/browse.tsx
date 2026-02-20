import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  LayoutDashboard,
  Search as SearchIcon,
  FileText,
  DollarSign,
  Clock,
  FolderKanban,
  ArrowRight
} from "lucide-react";
import { projectAPI } from "../../../api/projects";
import { toast } from "sonner";

import { freelancerNavItems as navItems } from "../../../config/navigation";

export function FreelancerBrowse() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectAPI.getOpenProjects();
      setProjects(data);
    } catch (error) {
      toast.error("Failed to load projects");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout navItems={navItems} userType="freelancer" theme="emerald">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Projects</h1>
        <p className="text-gray-600">Find projects that match your skills</p>
      </div>

      {/* Search and Filter */}
      <Card className="p-6 mb-8 border-0 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search projects by title or skills..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
            <SearchIcon className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </Card>

      {/* Projects List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No projects found matching your criteria.
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project._id} className="p-6 border-0 shadow-md hover:shadow-lg transition-all group">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <FolderKanban className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        <Link to={`/freelancer/projects/${project._id}`}>
                          {project.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-3 line-clamp-2">{project.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {(project.skills || []).map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="bg-emerald-50 text-emerald-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-medium">
                            ${project.budget.toLocaleString()}
                          </span>
                        </div>
                        {project.deadline && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>{project.proposalsCount || 0} proposals</span>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-gray-500">
                        Posted on {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col gap-2 justify-center">
                  <Button
                    onClick={() => navigate(`/freelancer/projects/${project._id}`)}
                    className="flex-1 lg:flex-none bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 whitespace-nowrap"
                  >
                    View Details <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}