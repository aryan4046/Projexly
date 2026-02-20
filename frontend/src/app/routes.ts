import { createBrowserRouter } from "react-router-dom";
import { Landing } from "./pages/landing";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { StudentDashboard } from "./pages/student/dashboard";
import { StudentProjects } from "./pages/student/projects";
import { CreateProject } from "./pages/student/create-project";
import { StudentProjectDetails } from "./pages/student/project-details";
import { StudentProposals } from "./pages/student/proposals";
import { FreelancerDashboard } from "./pages/freelancer/dashboard";
import { FreelancerBrowse } from "./pages/freelancer/browse";
import { FreelancerProposals } from "./pages/freelancer/proposals";
import { FreelancerEarnings } from "./pages/freelancer/earnings";
import { Profile } from "./pages/profile";
import { Settings } from "./pages/settings";
import { OAuthCallback } from "./pages/oauth-callback";

// New Pages
import { CreateGig } from "./pages/freelancer/create-gig";
import { MyGigs } from "./pages/freelancer/my-gigs";
import { BrowseGigs } from "./pages/student/browse-gigs";
import { GigDetails } from "./pages/gig-details";
import { Orders } from "./pages/orders";
import { Messages } from "./pages/messages";
import { FreelancerProjectDetails } from "./pages/freelancer/project-details";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/profile/:id",
    Component: Profile,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/auth/oauth-callback",
    Component: OAuthCallback,
  },
  {
    path: "/student/dashboard",
    Component: StudentDashboard,
  },
  {
    path: "/student/projects",
    Component: StudentProjects,
  },
  {
    path: "/student/projects/new",
    Component: CreateProject,
  },
  {
    path: "/student/projects/edit/:id",
    Component: CreateProject,
  },
  {
    path: "/projects/:id",
    Component: StudentProjectDetails,
  },
  {
    path: "/student/proposals",
    Component: StudentProposals,
  },
  // New Student Route
  {
    path: "/gigs", // Marketplace
    Component: BrowseGigs,
  },
  {
    path: "/freelancer/dashboard",
    Component: FreelancerDashboard,
  },
  {
    path: "/freelancer/browse",
    Component: FreelancerBrowse,
  },
  {
    path: "/freelancer/proposals",
    Component: FreelancerProposals,
  },
  {
    path: "/freelancer/earnings",
    Component: FreelancerEarnings,
  },
  // New Freelancer Routes
  {
    path: "/freelancer/create-gig",
    Component: CreateGig,
  },
  {
    path: "/freelancer/edit-gig/:id",
    Component: CreateGig,
  },
  {
    path: "/freelancer/gigs",
    Component: MyGigs,
  },
  {
    path: "/freelancer/projects/:id",
    Component: FreelancerProjectDetails,
  },
  // Shared Routes
  {
    path: "/gigs/:id",
    Component: GigDetails,
  },
  {
    path: "/orders",
    Component: Orders,
  },
  {
    path: "/messages",
    Component: Messages,
  },
  {
    path: "/settings",
    Component: Settings,
  },
]);
