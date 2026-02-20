import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { DashboardLayout } from "../components/dashboard-layout";
import { authAPI } from "../../api/auth";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import {
    Briefcase,
    User,
    Bell,
    Globe,
    Moon,
    LogOut,
    Shield,
    Settings as SettingsIcon,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { studentNavItems, freelancerNavItems } from "../../config/navigation";


export function Settings() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("general");

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    // Notification State
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [projectUpdates, setProjectUpdates] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);

    const { theme, setTheme } = useTheme();

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const userData = await authAPI.getMe();
            setUser(userData);
            setName(userData.name);
            setEmail(userData.email);
            if (userData.notifications) {
                setEmailNotifications(userData.notifications.email);
                setProjectUpdates(userData.notifications.projectUpdates);
                setMarketingEmails(userData.notifications.marketing);
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAccount = async () => {
        try {
            const updatedUser = await authAPI.updateProfile({
                name,
            });
            setUser(updatedUser.user);
            alert("Account information updated!");
        } catch (error) {
            console.error("Failed to update account", error);
            alert("Failed to update account.");
        }
    };

    const handleUpdateNotifications = async (type: string, value: boolean) => {
        // Optimistic update
        if (type === 'email') setEmailNotifications(value);
        if (type === 'projectUpdates') setProjectUpdates(value);
        if (type === 'marketing') setMarketingEmails(value);

        try {
            const notifications = {
                email: type === 'email' ? value : emailNotifications,
                projectUpdates: type === 'projectUpdates' ? value : projectUpdates,
                marketing: type === 'marketing' ? value : marketingEmails,
            };

            await authAPI.updateProfile({ notifications });
        } catch (error) {
            console.error("Failed to update notifications", error);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await authAPI.deleteAccount();
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        } catch (error) {
            console.error("Failed to delete account", error);
            alert("Failed to delete account.");
        }
    };
    const userRole = user?.role || "student";
    const currentTheme = userRole === "freelancer" ? "emerald" : "indigo";
    const buttonColor = userRole === "freelancer" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700";
    const switchColor = userRole === "freelancer" ? "data-[state=checked]:!bg-emerald-600" : "data-[state=checked]:!bg-indigo-600";

    const currentNavItems = userRole === "freelancer" ? freelancerNavItems : studentNavItems;

    if (loading) return (
        <DashboardLayout navItems={currentNavItems} userType={userRole} theme={currentTheme}>
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout navItems={currentNavItems} userType={userRole} theme={currentTheme}>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground mt-2">Manage your account preferences and settings.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Settings Sidebar */}
                    <div className="md:col-span-1 space-y-1">
                        <Button
                            variant={activeTab === "general" ? "secondary" : "ghost"}
                            className="w-full justify-start font-medium"
                            onClick={() => setActiveTab("general")}
                        >
                            <User className="w-4 h-4 mr-2" /> General
                        </Button>
                        <Button
                            variant={activeTab === "notifications" ? "secondary" : "ghost"}
                            className="w-full justify-start font-medium"
                            onClick={() => setActiveTab("notifications")}
                        >
                            <Bell className="w-4 h-4 mr-2" /> Notifications
                        </Button>
                        <Button
                            variant={activeTab === "appearance" ? "secondary" : "ghost"}
                            className="w-full justify-start font-medium"
                            onClick={() => setActiveTab("appearance")}
                        >
                            <Moon className="w-4 h-4 mr-2" /> Appearance
                        </Button>
                        <Button
                            variant={activeTab === "security" ? "secondary" : "ghost"}
                            className="w-full justify-start font-medium"
                            onClick={() => setActiveTab("security")}
                        >
                            <Shield className="w-4 h-4 mr-2" /> Security
                        </Button>
                        <Button
                            variant={activeTab === "language" ? "secondary" : "ghost"}
                            className="w-full justify-start font-medium"
                            onClick={() => setActiveTab("language")}
                        >
                            <Globe className="w-4 h-4 mr-2" /> Language
                        </Button>
                    </div>

                    {/* Main Settings Content */}
                    <div className="md:col-span-3 space-y-6">
                        {/* Account General Section */}
                        {activeTab === "general" && (
                            <Card className="p-6 animate-in fade-in-50 duration-500">
                                <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name</label>
                                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <Input value={email} disabled className="bg-muted" />
                                        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                                    </div>
                                    <div className="pt-4">
                                        <Button onClick={handleUpdateAccount} className={`${buttonColor} text-white`}>Update Profile</Button>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Notifications Section */}
                        {activeTab === "notifications" && (
                            <Card className="p-6 animate-in fade-in-50 duration-500">
                                <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <label className="text-base font-medium">Email Notifications</label>
                                            <p className="text-sm text-muted-foreground">Receive emails about your account activity.</p>
                                        </div>
                                        <Switch
                                            checked={emailNotifications}
                                            onCheckedChange={(val) => handleUpdateNotifications('email', val)}
                                            className={switchColor}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <label className="text-base font-medium">Project Updates</label>
                                            <p className="text-sm text-muted-foreground">Get notified when a project status changes.</p>
                                        </div>
                                        <Switch
                                            checked={projectUpdates}
                                            onCheckedChange={(val) => handleUpdateNotifications('projectUpdates', val)}
                                            className={switchColor}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <label className="text-base font-medium">Marketing Emails</label>
                                            <p className="text-sm text-muted-foreground">Receive news and special offers.</p>
                                        </div>
                                        <Switch
                                            checked={marketingEmails}
                                            onCheckedChange={(val) => handleUpdateNotifications('marketing', val)}
                                            className={switchColor}
                                        />
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Appearance Section */}
                        {activeTab === "appearance" && (
                            <Card className="p-6 animate-in fade-in-50 duration-500">
                                <h2 className="text-xl font-semibold mb-4">Appearance</h2>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Moon className="w-4 h-4" />
                                            <label className="text-base font-medium">Dark Mode</label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Switch between light and dark themes.</p>
                                    </div>
                                    <Switch
                                        checked={theme === 'dark'}
                                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                        className={switchColor}
                                    />
                                </div>
                            </Card>
                        )}

                        {/* Security Section */}
                        {activeTab === "security" && (
                            <Card className="p-6 border-destructive/20 animate-in fade-in-50 duration-500">
                                <h2 className="text-xl font-semibold mb-4 text-destructive flex items-center gap-2">
                                    <Shield className="w-5 h-5" /> Danger Zone
                                </h2>
                                <p className="text-muted-foreground mb-4 text-sm">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
                                            <LogOut className="w-4 h-4 mr-2" /> Delete Account
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your account
                                                and remove your data from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                                                Delete Account
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </Card>
                        )}

                        {/* Language Section (New) */}
                        {activeTab === "language" && (
                            <Card className="p-6 animate-in fade-in-50 duration-500">
                                <h2 className="text-xl font-semibold mb-4">Language</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Preferred Language</label>
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                        </select>
                                        <p className="text-xs text-muted-foreground">Select the language you'd like to use throughout the application.</p>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
