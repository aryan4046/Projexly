import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/dashboard-layout";
import { authAPI } from "../../api/auth";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog";
import {
    MapPin,
    Globe,
    Edit2,
    Plus,
    Briefcase,
    GraduationCap,
    Award,
    Share2,
    Eye,
    Settings,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { studentNavItems, freelancerNavItems } from "../../config/navigation";

export function Profile() {
    const { id } = useParams();
    const [user, setUser] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Edit State
    const [headline, setHeadline] = useState("");
    const [location, setLocation] = useState("");
    const [about, setAbout] = useState("");

    const [skills, setSkills] = useState("");

    // New Item State
    const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
    const [newSkill, setNewSkill] = useState("");

    const [isEducationDialogOpen, setIsEducationDialogOpen] = useState(false);
    const [newEducation, setNewEducation] = useState({ school: "", degree: "", year: "" });

    const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
    const [newPortfolio, setNewPortfolio] = useState({ title: "", description: "", link: "" });

    const [isCertificationDialogOpen, setIsCertificationDialogOpen] = useState(false);
    const [newCertification, setNewCertification] = useState({ name: "", from: "", year: "" });

    // We will dynamically determine nav items inside the render function based on role.

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const meData = await authAPI.getMe();
            setCurrentUser(meData);

            let userData = meData;
            if (id && id !== meData._id) {
                userData = await authAPI.getUserById(id);
            }

            setUser(userData);
            setHeadline(userData.headline || "");
            setLocation(userData.location || "");
            setAbout(userData.about || "");
            setSkills(userData.skills ? userData.skills.join(", ") : "");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        try {
            const updatedUser = await authAPI.updateProfile({
                headline,
                location,
                about,
                skills: skills.split(",").map((s) => s.trim()).filter((s) => s),
                education: user.education,
                portfolio: user.portfolio,
            });
            setUser(updatedUser.user);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile");
        }
    };

    const handleAddSkill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSkill.trim()) return;

        const updatedSkills = [...(user.skills || []), newSkill.trim()];
        try {
            const updatedUser = await authAPI.updateProfile({ ...user, skills: updatedSkills });
            setUser(updatedUser.user);
            setSkills(updatedUser.user.skills.join(", "));
            setNewSkill("");
            setIsSkillDialogOpen(false);
        } catch (error) {
            console.error("Failed to add skill", error);
        }
    };

    const handleAddEducation = async (e: React.FormEvent) => {
        e.preventDefault();
        const updatedEducation = [...(user.education || []), newEducation];
        try {
            const updatedUser = await authAPI.updateProfile({ ...user, education: updatedEducation });
            setUser(updatedUser.user);
            setNewEducation({ school: "", degree: "", year: "" });
            setIsEducationDialogOpen(false);
        } catch (error) {
            console.error("Failed to add education", error);
        }
    };

    const handleAddPortfolio = async (e: React.FormEvent) => {
        e.preventDefault();
        // For now storing as string if backend expects string array, 
        // OR we need to update backend to accept objects for portfolio. 
        // The current backend model defines portfolio as [{ type: String }] (array of strings).
        // Let's assume for now we just store the link or title.
        // TO DO: Update backend to support object portfolio items if needed.
        // Checking User.js: portfolio: [{ type: String }]
        // So we can only store strings. Let's store "Title - Description" for now.
        const portfolioItem = `${newPortfolio.title} - ${newPortfolio.description}`;
        const updatedPortfolio = [...(user.portfolio || []), portfolioItem];

        try {
            const updatedUser = await authAPI.updateProfile({ ...user, portfolio: updatedPortfolio });
            setUser(updatedUser.user);
            setNewPortfolio({ title: "", description: "", link: "" });
            setIsPortfolioDialogOpen(false);
        } catch (error) {
            console.error("Failed to add portfolio", error);
        }
    };

    const handleAddCertification = async (e: React.FormEvent) => {
        e.preventDefault();
        const updatedCertification = [...(user.certification || []), newCertification];
        try {
            const updatedUser = await authAPI.updateProfile({ ...user, certification: updatedCertification });
            setUser(updatedUser.user);
            setNewCertification({ name: "", from: "", year: "" });
            setIsCertificationDialogOpen(false);
        } catch (error) {
            console.error("Failed to add certification", error);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Profile link copied to clipboard!");
    };

    const handlePreview = () => {
        window.open(window.location.href, '_blank');
    };


    if (loading) return (
        <DashboardLayout
            navItems={currentUser?.role === 'freelancer' ? freelancerNavItems : studentNavItems}
            userType={currentUser?.role || 'student'}
            theme={currentUser?.role === 'freelancer' ? 'emerald' : 'indigo'}
        >
            <div className="flex justify-center items-center h-full">Loading Profile...</div>
        </DashboardLayout>
    );

    if (!user) return (
        <DashboardLayout
            navItems={currentUser?.role === 'freelancer' ? freelancerNavItems : studentNavItems}
            userType={currentUser?.role || 'student'}
            theme={currentUser?.role === 'freelancer' ? 'emerald' : 'indigo'}
        >
            <div className="flex justify-center items-center h-full">User not found.</div>
        </DashboardLayout>
    );

    const isOwnProfile = currentUser && currentUser._id === user._id;

    const userRole = currentUser?.role || "student";
    const currentTheme = userRole === "freelancer" ? "emerald" : "indigo";
    const buttonColor = userRole === "freelancer" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white";
    const avatarColor = userRole === "freelancer" ? "bg-gradient-to-br from-emerald-600 to-teal-600" : "bg-gradient-to-br from-indigo-600 to-purple-600";
    const progressColor = userRole === "freelancer" ? "bg-emerald-600" : "bg-indigo-600";

    return (
        <DashboardLayout
            navItems={userRole === 'freelancer' ? freelancerNavItems : studentNavItems}
            userType={userRole}
            theme={currentTheme}
        >
            <div className="max-w-6xl mx-auto py-8 px-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="p-8 text-center relative shadow-sm hover:shadow-md transition-shadow">
                            {isOwnProfile && (
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Dialog open={isEditing} onOpenChange={setIsEditing}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Edit2 className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Edit Profile</DialogTitle>
                                                <DialogDescription>Update your profile details.</DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleUpdateProfile} className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Headline</label>
                                                    <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Student at..." />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Location</label>
                                                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="New York, USA" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">About</label>
                                                    <Textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4} placeholder="Tell us about yourself..." />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Skills (comma separated)</label>
                                                    <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js..." />
                                                </div>
                                                <Button type="submit" className={`w-full ${buttonColor}`}>Save Changes</Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                            <div className={`w-24 h-24 mx-auto ${avatarColor} rounded-full flex items-center justify-center mb-4`}>
                                <span className="text-3xl text-white font-semibold">
                                    {user.name.split(" ").map((n: string) => n[0]).join("")}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                            <p className="text-muted-foreground text-sm mb-2">{user.headline || "No headline added"}</p>

                            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {user.location || "Location not set"}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Globe className="w-4 h-4" />
                                    Speaks English
                                </div>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <Button onClick={handleShare} variant="outline" size="sm" className="gap-2">
                                    <Share2 className="w-4 h-4" /> Share
                                </Button>
                                <Button onClick={handlePreview} variant="outline" size="sm" className="gap-2">
                                    <Eye className="w-4 h-4" /> Preview
                                </Button>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="font-semibold mb-4">Profile Strength</h3>
                            <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                                <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: "70%" }}></div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-6">A strong profile helps you stand out.</p>

                            <div className="space-y-3">
                                {isOwnProfile && (
                                    <Button onClick={() => setIsPortfolioDialogOpen(true)} variant="outline" className="w-full justify-start text-left h-auto py-3">
                                        <Briefcase className="w-4 h-4 mr-2" /> Showcase portfolio
                                    </Button>
                                )}
                                {isOwnProfile && (
                                    <Dialog open={isCertificationDialogOpen} onOpenChange={setIsCertificationDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                                                <Award className="w-4 h-4 mr-2" /> List certifications
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add Certification</DialogTitle>
                                                <DialogDescription>Add your certifications.</DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleAddCertification} className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Certification Name</label>
                                                    <Input value={newCertification.name} onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })} placeholder="e.g. AWS Certified" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Issued By</label>
                                                    <Input value={newCertification.from} onChange={(e) => setNewCertification({ ...newCertification, from: e.target.value })} placeholder="e.g. Amazon" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Year</label>
                                                    <Input value={newCertification.year} onChange={(e) => setNewCertification({ ...newCertification, year: e.target.value })} placeholder="e.g. 2024" />
                                                </div>
                                                <Button type="submit" className={`w-full ${buttonColor}`}>Add Certification</Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold">Skills</h3>
                                {isOwnProfile && (
                                    <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm"><Plus className="w-4 h-4" /></Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add Skill</DialogTitle>
                                                <DialogDescription>Add a key skill to your profile.</DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleAddSkill} className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Skill</label>
                                                    <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="e.g. React" />
                                                </div>
                                                <Button type="submit" className={`w-full ${buttonColor}`}>Add Skill</Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {user.skills && user.skills.length > 0 ? (
                                    user.skills.map((skill: string, idx: number) => (
                                        <Badge key={idx} variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/80">
                                            {skill}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No skills added yet.</p>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">About</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                {user.about || "Add a bio to tell people about yourself."}
                            </p>
                        </Card>

                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg">Portfolio</h3>
                                {isOwnProfile && (
                                    <Dialog open={isPortfolioDialogOpen} onOpenChange={setIsPortfolioDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" /> Add Project</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add Project</DialogTitle>
                                                <DialogDescription>Showcase your best work.</DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleAddPortfolio} className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Project Title</label>
                                                    <Input value={newPortfolio.title} onChange={(e) => setNewPortfolio({ ...newPortfolio, title: e.target.value })} placeholder="e.g. E-commerce App" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Description</label>
                                                    <Textarea value={newPortfolio.description} onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })} placeholder="Describe the project..." />
                                                </div>
                                                <Button type="submit" className={`w-full ${buttonColor}`}>Add Project</Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                            <div className="bg-muted/30 rounded-lg p-8 text-center border-2 border-dashed border-border">
                                {user.portfolio && user.portfolio.length > 0 ? (
                                    <div className="space-y-4 text-left">
                                        {user.portfolio.map((item: string, idx: number) => (
                                            <div key={idx} className="bg-card p-4 rounded shadow-sm border border-border">
                                                <h5 className="font-bold">{item.split(" - ")[0]}</h5>
                                                <p className="text-sm text-muted-foreground">{item.split(" - ")[1] || ""}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                                            <Briefcase className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <h4 className="font-medium text-foreground">Showcase your work</h4>
                                        <p className="text-muted-foreground text-sm mt-1">Upload your best projects to impress clients.</p>
                                    </>
                                )}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg">Education</h3>
                                {isOwnProfile && (
                                    <Dialog open={isEducationDialogOpen} onOpenChange={setIsEducationDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" /> Add Education</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add Education</DialogTitle>
                                                <DialogDescription>Add your educational background.</DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleAddEducation} className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">School / University</label>
                                                    <Input value={newEducation.school} onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })} placeholder="e.g. MIT" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Degree</label>
                                                    <Input value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} placeholder="e.g. B.Tech Computer Science" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Year</label>
                                                    <Input value={newEducation.year} onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })} placeholder="e.g. 2024" />
                                                </div>
                                                <Button type="submit" className={`w-full ${buttonColor}`}>Add Education</Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                            {user.education && user.education.length > 0 ? (
                                <div className="space-y-4">
                                    {user.education.map((edu: any, idx: number) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                                                <GraduationCap className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground">{edu.school}</h4>
                                                <p className="text-muted-foreground">{edu.degree}</p>
                                                <p className="text-sm text-muted-foreground">{edu.year}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    Add your educational background.
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
