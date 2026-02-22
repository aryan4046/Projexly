import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "./utils";

interface TimeAgoProps {
  date: string | Date | number;
  className?: string;
  addSuffix?: boolean;
  refreshInterval?: number; // in milliseconds, default 60000 (1 minute)
}

/**
 * A component that displays a relative time string and updates periodically.
 * Uses date-fns under the hood.
 */
export function TimeAgo({ 
  date, 
  className, 
  addSuffix = true, 
  refreshInterval = 60000 
}: TimeAgoProps) {
  const [relativeTime, setRelativeTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      try {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        if (isNaN(new Date(dateObj).getTime())) {
            setRelativeTime("Invalid date");
            return;
        }
        setRelativeTime(formatDistanceToNow(dateObj, { addSuffix }));
      } catch (error) {
        console.error("Error formatting date:", error);
        setRelativeTime("Invalid date");
      }
    };

    updateTime();

    if (refreshInterval > 0) {
      const interval = setInterval(updateTime, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [date, addSuffix, refreshInterval]);

  return (
    <span className={cn("inline-block", className)} title={new Date(date).toLocaleString()}>
      {relativeTime}
    </span>
  );
}
