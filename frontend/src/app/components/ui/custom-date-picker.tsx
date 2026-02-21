import { useRef, InputHTMLAttributes } from "react";
import { Calendar } from "lucide-react";
import { cn } from "./utils"; // Assuming you have a cn utility, if not I'll use template literals

interface CustomDatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    theme?: "indigo" | "emerald";
}

export function CustomDatePicker({
    label,
    theme = "indigo",
    className,
    ...props
}: CustomDatePickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (inputRef.current) {
            // Logic to open native picker
            try {
                (inputRef.current as any).showPicker();
            } catch (e) {
                inputRef.current.focus();
            }
        }
    };

    return (
        <div className="space-y-2 w-full">
            {label && (
                <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 mb-1.5 ml-1">
                    <Calendar className={cn("w-4 h-4", theme === 'emerald' ? 'text-emerald-500' : 'text-orange-500')} />
                    {label}
                </label>
            )}
            <div
                onClick={handleClick}
                className={cn(
                    "relative group cursor-pointer transition-all duration-200",
                    "rounded-xl border border-border bg-background/50 hover:bg-muted/50",
                    "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary",
                    className
                )}
            >
                <input
                    ref={inputRef}
                    type="date"
                    className={cn(
                        "w-full h-11 px-4 bg-transparent outline-none text-sm text-foreground",
                        "cursor-pointer appearance-none",
                        // This is for the native text to align properly
                        "selection:bg-primary/20",
                        // Padding right to make space for our custom unique look if needed
                    )}
                    {...props}
                />

                {/* Unique Floating Icon/Indicator if wanted, but user asked to hide icon to set automatically */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        theme === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500'
                    )} />
                </div>
            </div>
        </div>
    );
}
