
import { useState } from "react";
import { CheckCircle2, AlertCircle, UserPlus, UserMinus } from "lucide-react";
import { 
  Card, 
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { Participant } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface ParticipantCardProps {
  participant: Participant;
  onAddToBus?: (participant: Participant) => void;
  onRemoveFromBus?: (participant: Participant) => void;
  showControls?: boolean;
  className?: string;
}

export function ParticipantCard({ 
  participant, 
  onAddToBus, 
  onRemoveFromBus,
  showControls = true,
  className
}: ParticipantCardProps) {
  const { user } = useAuth();
  const [isRemoving, setIsRemoving] = useState(false);
  
  const isAvailable = participant.busId === null;
  const isInCurrentBus = user?.role === 'controller' && participant.busId === user.busId;
  const isInOtherBus = participant.busId !== null && !isInCurrentBus;
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('default', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={cn(
          "overflow-hidden transition-all duration-200",
          isAvailable ? "border-emerald-200/40" : 
          isInCurrentBus ? "border-primary/30" : 
          "border-amber-200/40",
          className
        )}>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium text-lg">
                  {participant.firstName} {participant.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  ID: {participant.ticketId}
                </p>
              </div>
              <div className="flex items-start">
                {isAvailable && (
                  <div className="flex items-center text-emerald-500">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Available</span>
                  </div>
                )}
                {isInCurrentBus && (
                  <div className="flex items-center text-primary">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">In your bus</span>
                  </div>
                )}
                {isInOtherBus && (
                  <div className="flex items-center text-amber-500">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Bus {participant.busId}</span>
                  </div>
                )}
              </div>
            </div>
            
            {(isInCurrentBus || isInOtherBus) && participant.assignedAt && (
              <div className="mt-2 text-xs text-muted-foreground">
                Added on {formatDate(participant.assignedAt)}
                {participant.assignedBy && ` by ${participant.assignedBy}`}
              </div>
            )}
          </CardContent>
          
          {showControls && (
            <CardFooter className="px-4 py-3 bg-muted/30 flex justify-end">
              {isAvailable && onAddToBus && (
                <Button 
                  variant="default" 
                  size="sm"
                  className="gap-1"
                  onClick={() => onAddToBus(participant)}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add to Bus</span>
                </Button>
              )}
              
              {isInCurrentBus && onRemoveFromBus && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1 text-destructive hover:text-destructive"
                  onClick={() => setIsRemoving(true)}
                >
                  <UserMinus className="h-4 w-4" />
                  <span>Remove</span>
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      </motion.div>
      
      <AlertDialog open={isRemoving} onOpenChange={setIsRemoving}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {participant.firstName} {participant.lastName} from your bus?
              This action will be logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onRemoveFromBus?.(participant);
                setIsRemoving(false);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
