import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

import {
  LayoutDashboard,
  Search,
  FileText,
  DollarSign,

  Download,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { orderAPI, Order } from "../../../api/orders";
import { authAPI } from "../../../api/auth";
import { format, parseISO, eachMonthOfInterval, subMonths, isSameMonth } from "date-fns";
import { toast } from "sonner";

import { freelancerNavItems as navItems } from "../../../config/navigation";

export function FreelancerEarnings() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Withdrawal Logic State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState(() => {
    return parseFloat(localStorage.getItem("freelancer_withdrawn") || "0");
  });

  const [bankDetails, setBankDetails] = useState(() => {
    const saved = localStorage.getItem("freelancer_bank_details");
    return saved ? JSON.parse(saved) : {
      bankName: "Chase Bank",
      accountNumber: "•••• •••• •••• 1234",
      routingNumber: "••••9876"
    };
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userData, ordersData] = await Promise.all([
        authAPI.getMe(),
        orderAPI.getMyOrders()
      ]);
      // Filter orders where the user is the seller
      const sellerOrders = ordersData.filter((o: Order) => o.seller._id === userData._id);
      setOrders(sellerOrders);
    } catch (err: any) {
      console.error("Failed to fetch earnings data:", err);
      setError("Failed to load earnings data. Please try again.");
      toast.error("Failed to load earnings data.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate Stats
  const completedOrders = orders.filter(o => o.status === 'completed');
  const activeOrders = orders.filter(o => o.status === 'active');

  const totalEarnings = completedOrders.reduce((sum, o) => sum + o.price, 0);
  const pendingPayments = activeOrders.reduce((sum, o) => sum + o.price, 0);
  const availableBalance = Math.max(0, totalEarnings - withdrawnAmount);

  const handleWithdraw = () => {
    if (availableBalance <= 0) {
      toast.error("You have no available balance to withdraw.");
      return;
    }
    const newWithdrawn = withdrawnAmount + availableBalance;
    setWithdrawnAmount(newWithdrawn);
    localStorage.setItem("freelancer_withdrawn", newWithdrawn.toString());
    setIsWithdrawModalOpen(false);
    toast.success(`Successfully withdrew $${availableBalance.toLocaleString()} to Chase Bank!`);
  };

  // Generate Monthly Data for the last 6 months
  const generateMonthlyData = () => {
    const today = new Date();
    const sixMonthsAgo = subMonths(today, 5);
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: today });

    return months.map(month => {
      const monthEarnings = completedOrders
        .filter(o => isSameMonth(parseISO(o.createdAt), month))
        .reduce((sum, o) => sum + o.price, 0);

      return {
        month: format(month, "MMM yyyy"),
        earnings: monthEarnings,
        date: month
      };
    });
  };

  const monthlyData = generateMonthlyData();

  // Calculate percentage increase
  const currentMonthEarnings = monthlyData[monthlyData.length - 1].earnings;
  const lastMonthEarnings = monthlyData[monthlyData.length - 2]?.earnings || 0;
  const percentageChange = lastMonthEarnings === 0
    ? (currentMonthEarnings > 0 ? 100 : 0)
    : ((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100;

  // Export Logic
  const handleExport = (format: 'csv' | 'pdf' | 'xlsx') => {
    try {
      if (format === 'csv') {
        let csvContent = "Month,Earnings\n";

        if (monthlyData.length > 0) {
          monthlyData.forEach(row => {
            csvContent += `${row.month},${row.earnings}\n`;
          });
        } else {
          csvContent += "No data available,0\n";
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `earnings_report_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV Export downloaded successfully!");
      } else {
        // Fallback for PDF and XLSX (Simulated basic empty/stub files)
        const content = monthlyData.length > 0
          ? `Simulated ${format.toUpperCase()} Export.\n\nTotal Earnings: $${totalEarnings}\nAvailable Balance: $${availableBalance}`
          : `Empty ${format.toUpperCase()} Document. No data available.`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `earnings_report_${new Date().getTime()}.${format}`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${format.toUpperCase()} Export downloaded successfully!`);
      }
    } catch (err) {
      console.error("Export failed", err);
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} userType="freelancer" theme="emerald">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={navItems} userType="freelancer" theme="emerald">
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} userType="freelancer" theme="emerald">
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Earnings</h1>
            <p className="text-muted-foreground">Track your income and transaction history</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchData}>
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Export As</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  PDF Document (.pdf)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  CSV File (.csv)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                  Excel Spreadsheet (.xlsx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Earnings - Custom Target Design */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-[#059669] text-white h-40 group">
            {/* Right side lighter overlay to create the two-tone effect */}
            <div className="absolute right-0 top-0 h-full w-[28%] bg-white/10"></div>

            <div className="p-5 relative z-10 flex h-full">
              {/* Left Content */}
              <div className="flex-1 flex flex-col justify-between pr-4 h-full">
                <div>
                  <h3 className="text-emerald-100 font-medium text-xs uppercase tracking-wider">Total Earnings</h3>
                  <div className="text-3xl font-bold mt-2 text-white tracking-tight">${totalEarnings.toLocaleString()}</div>
                </div>

                <div className="space-y-2 mt-auto">
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-emerald-100 font-medium">Monthly Goal</span>
                  </div>

                  {/* Custom thin progress bar background */}
                  <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/90 rounded-full"
                      style={{ width: `${Math.min((currentMonthEarnings / 2000) * 100, 100)}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-emerald-100/80 font-medium mt-1">
                    ${currentMonthEarnings.toLocaleString()} / $2,000 this month
                  </p>
                </div>
              </div>

              {/* Right Floater - Positioned to overlap the two-tone line */}
              <div className="absolute right-[10%] top-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[20px] flex flex-col items-center justify-center shadow-sm ring-1 ring-white/20">
                  <DollarSign className="w-6 h-6 text-white mb-0.5" strokeWidth={2.5} />
                  <span className="text-[10px] font-bold text-white">
                    {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Available Balance - Teal */}
          <Card className="relative overflow-hidden border-b-4 border-b-teal-500 shadow-sm hover:shadow-md transition-all duration-300 group bg-card h-40">
            <div className="p-5 relative z-10 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Available Balance</h3>
                <div className="text-3xl font-bold mt-2 text-foreground">${availableBalance.toLocaleString()}</div>
              </div>
              <div>
                <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-8 text-xs px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-sm transition-all hover:shadow-md active:scale-95">
                      Withdraw Funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <div className="flex justify-between items-center pr-6">
                        <DialogTitle>Bank Details</DialogTitle>
                        {!isEditingBank && (
                          <Button variant="ghost" size="sm" onClick={() => setIsEditingBank(true)} className="h-6 px-2 text-xs text-teal-600 hover:text-teal-700">
                            Edit
                          </Button>
                        )}
                      </div>
                      <DialogDescription>
                        {isEditingBank ? "Update your linked bank account information." : "Your funds will be withdrawn to your linked bank account."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 rounded-xl bg-muted/30 p-4 border border-border/50">
                      {isEditingBank ? (
                        <>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bank Name</p>
                            <Input
                              value={bankDetails.bankName}
                              onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Number</p>
                            <Input
                              value={bankDetails.accountNumber}
                              onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Routing Number</p>
                            <Input
                              value={bankDetails.routingNumber}
                              onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
                              className="h-8 text-sm"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bank Name</p>
                            <p className="text-base font-semibold text-foreground">{bankDetails.bankName}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Number</p>
                            <p className="text-base font-semibold text-foreground">{bankDetails.accountNumber}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Routing Number</p>
                            <p className="text-base font-semibold text-foreground">{bankDetails.routingNumber}</p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      {isEditingBank ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setIsEditingBank(false)}>
                            Cancel
                          </Button>
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => {
                            localStorage.setItem("freelancer_bank_details", JSON.stringify(bankDetails));
                            setIsEditingBank(false);
                            toast.success("Bank details updated!");
                          }}>
                            Save Details
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setIsWithdrawModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white rounded-full" onClick={handleWithdraw} disabled={availableBalance <= 0}>
                            Confirm Withdrawal ${availableBalance.toLocaleString()}
                          </Button>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-full w-24 bg-teal-50/50 dark:bg-teal-900/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
              <div className="bg-white dark:bg-teal-950 p-3 rounded-2xl shadow-sm text-teal-600 dark:text-teal-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </Card>

          {/* Pending Payments - Amber */}
          <Card className="relative overflow-hidden border-b-4 border-b-amber-500 shadow-sm hover:shadow-md transition-all duration-300 group bg-card h-40">
            <div className="p-5 relative z-10 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Pending Payments</h3>
                <div className="text-3xl font-bold mt-2 text-foreground">${pendingPayments.toLocaleString()}</div>
              </div>
              <div className="mt-auto">
                <div className="inline-block px-2.5 py-1 bg-amber-50 dark:bg-amber-900/40 text-xs rounded-full text-amber-800 dark:text-amber-300 font-medium border border-amber-200/50">
                  In Transit
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-full w-24 bg-amber-50/50 dark:bg-amber-900/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
              <div className="bg-white dark:bg-amber-950 p-3 rounded-2xl shadow-sm text-amber-600 dark:text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Earnings Chart */}
        <Card className="p-6 border-0 shadow-lg bg-white/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Earnings Overview</h2>
              <p className="text-sm text-muted-foreground">Monthly breakdown of your income</p>
            </div>
          </div>

          <div className="space-y-6">
            {monthlyData.map((data, index) => {
              const maxEarnings = Math.max(...monthlyData.map(d => d.earnings), 1); // Avoid div by zero
              const percentage = (data.earnings / maxEarnings) * 100;

              return (
                <div key={index} className="space-y-2 group">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600 group-hover:text-emerald-600 transition-colors">{data.month}</span>
                    <span className="font-bold text-gray-900">${data.earnings.toLocaleString()}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="p-2 bg-white rounded-full shadow-sm">
                <ArrowUpRight className={`w-5 h-5 ${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <span>
                Your earnings {percentageChange >= 0 ? 'increased' : 'decreased'} by <strong className={percentageChange >= 0 ? "text-green-600" : "text-red-600"}>{Math.abs(percentageChange).toFixed(1)}%</strong> compared to last month.
              </span>
            </div>
          </div>
        </Card>

        {/* Transaction History */}
        <Card className="p-0 border shadow-lg overflow-hidden bg-white/80 backdrop-blur-xl">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
            <p className="text-sm text-muted-foreground">Recent orders and payments</p>
          </div>

          <div className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No transactions yet</h3>
                <p className="text-gray-500 mt-1">When you complete orders, they will appear here.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-gray-50/80 transition-colors group"
                >
                  <div className="flex-1 mb-3 sm:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {order.gig?.title || "Untitled Project"}
                      </h3>
                      {order.status === "completed" ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 px-2.5 py-0.5 text-xs font-semibold shadow-sm">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      ) : order.status === "cancelled" ? (
                        <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 px-2.5 py-0.5 text-xs font-semibold shadow-sm">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Cancelled
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 px-2.5 py-0.5 text-xs font-semibold shadow-sm">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        Client: <span className="font-medium text-gray-700">{order.buyer?.name || "Unknown User"}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        Full Payment
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600 tracking-tight">
                        +${order.price.toLocaleString()}
                      </div>
                    </div>
                    {order.status === "completed" && (
                      <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <Download className="w-4 h-4 mr-2" />
                        Invoice
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
