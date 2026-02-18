import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CreditCard, Lock, ShieldCheck, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (paymentMethodId: string) => Promise<void>;
    amount: number;
    projectTitle: string;
}

export function PaymentModal({ isOpen, onClose, onConfirm, amount, projectTitle }: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");

    // Card State
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");

    // UPI State
    const [upiId, setUpiId] = useState("");

    const handlePayment = async () => {
        // Reset previous errors? (Toast handles this via multiple calls)

        if (paymentMethod === "card") {
            // Basic Card Validation
            if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
                toast.error("Invalid Card Number (must be 16 digits)");
                return;
            }
            if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
                toast.error("Invalid Expiry Date (MM/YY)");
                return;
            }
            if (!/^\d{3,4}$/.test(cvc)) {
                toast.error("Invalid CVC");
                return;
            }
        } else {
            // UPI Validation
            if (!/^[\w.-]+@[\w.-]+$/.test(upiId)) {
                toast.error("Invalid UPI ID format (e.g., user@bank)");
                return;
            }
        }

        setLoading(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Call the actual confirm handler (which calls the API)
            await onConfirm("mock_pm_" + Math.random().toString(36).substring(7));

            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Secure Checkout</DialogTitle>
                    <DialogDescription>
                        Complete your payment to hire the freelancer for <span className="font-semibold text-foreground">"{projectTitle}"</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="bg-muted/30 p-4 rounded-lg border flex justify-between items-center">
                        <span className="text-sm font-medium">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">${amount.toLocaleString()}</span>
                    </div>

                    <div className="space-y-4">
                        <Tabs defaultValue="card" onValueChange={(v) => setPaymentMethod(v as "card" | "upi")} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="card">Card Payment</TabsTrigger>
                                <TabsTrigger value="upi">UPI / GPay / Paytm</TabsTrigger>
                            </TabsList>

                            <TabsContent value="card" className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cardNumber">Card Number</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="cardNumber"
                                            placeholder="0000 0000 0000 0000"
                                            className="pl-9"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry">Expiry Date</Label>
                                        <Input
                                            id="expiry"
                                            placeholder="MM/YY"
                                            value={expiry}
                                            onChange={(e) => setExpiry(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvc">CVC</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="cvc"
                                                placeholder="123"
                                                className="pl-9"
                                                type="password"
                                                maxLength={3}
                                                value={cvc}
                                                onChange={(e) => setCvc(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="upi" className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="upiId">UPI ID / VPA</Label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="upiId"
                                            placeholder="username@okaxis / number@paytm"
                                            className="pl-9"
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Support for Google Pay, PhonePe, Paytm, and BHIM UPI.
                                    </p>
                                </div>

                                <div className="flex gap-2 justify-center py-2">
                                    <button onClick={() => setUpiId("user@okaxis")} className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer">GPay</button>
                                    <button onClick={() => setUpiId("user@ybl")} className="text-xs font-medium bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer">PhonePe</button>
                                    <button onClick={() => setUpiId("user@paytm")} className="text-xs font-medium bg-cyan-50 text-cyan-700 px-3 py-1.5 rounded border border-cyan-100 hover:bg-cyan-100 transition-colors cursor-pointer">Paytm</button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center bg-green-50/50 p-2 rounded text-green-700 border border-green-100">
                        <ShieldCheck className="w-3 h-3" />
                        Your payment is secured with 256-bit encryption.
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handlePayment} disabled={loading} className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            `Pay $${amount.toLocaleString()}`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
