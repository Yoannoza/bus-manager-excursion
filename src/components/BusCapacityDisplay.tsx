
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BusCapacityDisplayProps {
  busId: number;
  name: string;
  used: number;
  capacity: number;
  isCurrentBus?: boolean;
  className?: string;
}

export function BusCapacityDisplay({ 
  busId, 
  name, 
  used, 
  capacity, 
  isCurrentBus = false,
  className
}: BusCapacityDisplayProps) {
  const percentFilled = (used / capacity) * 100;
  const isFull = used >= capacity;
  
  // Determine color based on capacity
  const getStatusColor = () => {
    if (percentFilled >= 95) return "bg-red-500";
    if (percentFilled >= 75) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div 
      className={cn(
        "p-3 rounded-lg border", 
        isCurrentBus ? "bg-secondary/80 border-primary/20" : "bg-background border-border",
        className
      )}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <h3 className="font-medium">
            {name}
            {isCurrentBus && <span className="ml-1 text-sm text-muted-foreground">(yours)</span>}
          </h3>
        </div>
        <span className={cn(
          "text-sm font-medium",
          isFull ? "text-red-500" : "text-muted-foreground"
        )}>
          {used}/{capacity}
          {isFull && " (full)"}
        </span>
      </div>
      
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div 
          className={cn("h-full rounded-full", getStatusColor())}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentFilled, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
