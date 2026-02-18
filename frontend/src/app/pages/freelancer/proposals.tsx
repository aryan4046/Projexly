import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Progress } from "../../components/ui/progress";
import {
  FileText,
  DollarSign,
  Clock,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Search,
  CheckCircle2,
  Hourglass
} from "lucide-react";
import { proposalAPI, Proposal } from "../../../api/proposals";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../../components/ui/input";

// --- Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusInfo = (s: string) => {
    switch (s?.toLowerCase()) {
      case "open": return { color: "bg-emerald-500/10 text-emerald-600 border-emerald-200", label: "Open" };
      case "active": return { color: "bg-blue-500/10 text-blue-600 border-blue-200", label: "Active" };
      case "completed": return { color: "bg-purple-500/10 text-purple-600 border-purple-200", label: "Completed" };
      default: return { color: "bg-amber-500/10 text-amber-600 border-amber-200", label: s || "Unknown" };
    }
  };

  const info = getStatusInfo(status);

  return (
    <Badge variant="outline" className={`capitalize font-medium px-2.5 py-0.5 ${info.color}`}>
      {info.label}
    </Badge>
  );
};

const ProposalItem = ({ proposal, onWithdraw }: { proposal: Proposal; onWithdraw: (id: string) => void }) => {
  // Defensive Check
  if (!proposal.project) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Card className="p-6 border-red-200 bg-red-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <div>
              <span className="font-semibold block">Project Unavailable</span>
              <span className="text-sm text-red-500">This project may have been deleted.</span>
            </div>
          </div>
          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-100" onClick={() => onWithdraw(proposal._id)}>
            Remove
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group relative overflow-hidden border bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-emerald-500/20">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link to={`/projects/${proposal.project._id}`} className="text-lg font-bold hover:text-primary transition-colors line-clamp-1">
                  {proposal.project.title}
                </Link>
                <StatusBadge status={proposal.project.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {format(new Date(proposal.createdAt), "MMM d, yyyy")}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-primary">
                  <DollarSign className="w-3.5 h-3.5" />
                  Bid: ${proposal.bidAmount?.toLocaleString()}
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="group-hover:bg-muted/50">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.open(`/projects/${proposal.project._id}`, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" /> View Project
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => onWithdraw(proposal._id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Withdraw
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Message Preview */}
          <div className="relative bg-muted/30 p-4 rounded-xl mb-4 text-sm text-muted-foreground italic border border-border/50">
            <p className="line-clamp-2">"{proposal.message}"</p>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-2 border-t border-dashed">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-muted-foreground font-bold">Project Budget</span>
              <span className="font-semibold text-sm">${proposal.project.budget?.toLocaleString()}</span>
            </div>

            {/* Status Indicator specific to proposal (not project) - Mocking a 'status' field if it existed, mostly it's pending */}
            {/* Status Indicator specific to proposal (not project) */}
            {proposal.status === 'pending' && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-200/50">
                <Hourglass className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Pending Review</span>
              </div>
            )}
            {proposal.status === 'accepted' && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-200/50">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Accepted</span>
              </div>
            )}
            {proposal.status === 'rejected' && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 border border-red-200/50">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Rejected</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// --- Stats Component ---

// --- Stats Component Removed (Inlined) ---

// --- Main Page ---

export function FreelancerProposals() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await proposalAPI.getMyProposals();

      if (Array.isArray(data)) {
        setProposals(data);
      } else {
        setProposals([]);
        setError("Invalid data received.");
      }
    } catch (err) {
      setError("Failed to load proposals.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id: string) => {
    if (!confirm("Are you sure you want to withdraw?")) return;
    try {
      await proposalAPI.withdraw(id);
      setProposals(prev => prev.filter(p => p._id !== id));
      toast.success("Proposal withdrawn.");
    } catch (error) {
      toast.error("Failed to withdraw.");
    }
  };

  // derived state
  const filteredProposals = proposals.filter(p => {
    const matchesSearch = p.project?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    // Mock filtering by status since specific proposal status tracking might be basic in backend
    const matchesFilter = filter === "all" ? true : filter === "pending";
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout navItems={[
      { label: "Dashboard", path: "/freelancer/dashboard", icon: <ArrowLeft className="w-5 h-5" /> }, // Keeping generic for now
    ]} userType="freelancer" theme="emerald">
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">My Proposals</h1>
            <p className="text-muted-foreground">Track and manage your project applications</p>
          </div>
          <Button onClick={fetchProposals} variant="outline" size="sm" className="gap-2">
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Proposals - Emerald Gradient with "Monthly Goal" Effect */}
          {/* Total Proposals - Emerald Gradient Split Card with Progress */}
          <Card className="relative overflow-hidden border-b-4 border-b-emerald-500 shadow-sm hover:shadow-md transition-all duration-300 group bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
            <div className="p-6 relative z-10 flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-emerald-50 text-sm font-medium">Total Proposals</h3>
                <div className="text-3xl font-bold mt-2 text-white">{proposals.length}</div>

                {/* Progress Bar Effect */}
                <div className="mt-4 space-y-2 pr-4">
                  <div className="flex justify-between text-xs text-emerald-100">
                    <span>Success Rate</span>
                    <span>{proposals.length > 0 ? Math.round((proposals.filter(p => p.status === 'accepted').length / proposals.length) * 100) : 0}%</span>
                  </div>
                  <Progress
                    value={proposals.length > 0 ? (proposals.filter(p => p.status === 'accepted').length / proposals.length) * 100 : 0}
                    className="h-1.5 bg-emerald-900/30"
                  // indicatorClassName="bg-white" 
                  />
                </div>
              </div>
            </div>

            {/* Right Side Box - Translucent for Gradient Background */}
            <div className="absolute right-0 top-0 h-full w-24 bg-white/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
              <div className="bg-white/20 p-3 rounded-2xl shadow-sm text-white backdrop-blur-sm">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </Card>

          {/* Pending Review - Amber */}
          <Card className="relative overflow-hidden border-b-4 border-b-amber-500 shadow-sm hover:shadow-md transition-all duration-300 group bg-card">
            <div className="p-6 relative z-10 flex justify-between items-start">
              <div>
                <h3 className="text-muted-foreground text-sm font-medium">Pending Review</h3>
                <div className="text-3xl font-bold mt-2 text-foreground">{proposals.filter(p => p.status === 'pending').length}</div>
                <div className="mt-2 inline-block px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-xs rounded-full text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Awaiting Action
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-full w-24 bg-amber-50/50 dark:bg-amber-900/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
              <div className="bg-white dark:bg-amber-950 p-3 rounded-2xl shadow-sm text-amber-600 dark:text-amber-400">
                <Hourglass className="w-6 h-6" />
              </div>
            </div>
          </Card>

          {/* Accepted - Teal */}
          <Card className="relative overflow-hidden border-b-4 border-b-teal-500 shadow-sm hover:shadow-md transition-all duration-300 group bg-card">
            <div className="p-6 relative z-10 flex justify-between items-start">
              <div>
                <h3 className="text-muted-foreground text-sm font-medium">Accepted</h3>
                <div className="text-3xl font-bold mt-2 text-foreground">{proposals.filter(p => p.status === 'accepted').length}</div>
                <div className="mt-2 inline-block px-2.5 py-1 bg-teal-100 dark:bg-teal-900/30 text-xs rounded-full text-teal-700 dark:text-teal-400 font-medium">
                  Active Projects
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-full w-24 bg-teal-50/50 dark:bg-teal-900/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
              <div className="bg-white dark:bg-teal-950 p-3 rounded-2xl shadow-sm text-teal-600 dark:text-teal-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters & Content */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-md p-2 rounded-xl border border-border/50">
            <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setFilter}>
              <TabsList className="bg-white/60 p-1 rounded-full border border-white/40 backdrop-blur-xl shadow-lg grid grid-cols-2 sm:inline-flex sm:w-auto h-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/30 to-teal-50/30 opacity-50" />
                <TabsTrigger
                  value="all"
                  className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 relative z-10"
                >
                  All Proposals
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 relative z-10"
                >
                  Pending
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 rounded-xl bg-muted/20 animate-pulse border border-border/40" />
              ))}
            </div>
          ) : error ? (
            <div className="p-10 text-center border bg-red-50/50 rounded-xl">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
              <p className="text-red-700 font-medium">{error}</p>
              <Button onClick={fetchProposals} variant="link" className="text-red-600">Try Again</Button>
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No proposals found</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {searchQuery ? "Try adjusting your search terms." : "You haven't applied to any projects yet."}
              </p>
              {!searchQuery && (
                <Button asChild className="rounded-full shadow-lg hover:shadow-xl transition-all">
                  <Link to="/freelancer/browse">Browse Projects</Link>
                </Button>
              )}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProposals.map(proposal => (
                  <ProposalItem
                    key={proposal._id}
                    proposal={proposal}
                    onWithdraw={handleWithdraw}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
