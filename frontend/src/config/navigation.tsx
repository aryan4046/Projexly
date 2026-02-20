import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    TrendingUp,
    DollarSign,
    Briefcase
} from "lucide-react";

export const studentNavItems = [
    { label: "Dashboard", path: "/student/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Find Services", path: "/gigs", icon: <DollarSign className="w-5 h-5" /> },
    { label: "My Orders", path: "/orders", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "My Projects", path: "/student/projects", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "Proposals", path: "/student/proposals", icon: <FileText className="w-5 h-5" /> },
];

export const freelancerNavItems = [
    { label: "Dashboard", path: "/freelancer/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Browse Projects", path: "/freelancer/browse", icon: <Briefcase className="w-5 h-5" /> },
    { label: "Proposals", path: "/freelancer/proposals", icon: <FileText className="w-5 h-5" /> },
    { label: "My Gigs", path: "/freelancer/gigs", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "Earnings", path: "/freelancer/earnings", icon: <DollarSign className="w-5 h-5" /> },
];
