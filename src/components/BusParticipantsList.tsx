
import { useState, useEffect } from "react";
import { useData, Participant } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { ParticipantCard } from "@/components/ParticipantCard";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function BusParticipantsList() {
  const { user } = useAuth();
  const { getParticipantsByBusId, removeParticipant } = useData();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch participants for this bus
  useEffect(() => {
    if (user?.role === "controller" && user.busId) {
      setIsLoading(true);
      const busParticipants = getParticipantsByBusId(user.busId);
      setParticipants(busParticipants);
      setIsLoading(false);
    }
  }, [user, getParticipantsByBusId]);

  // Handle removing participant from bus
  const handleRemoveFromBus = async (participant: Participant) => {
    if (user?.role === "controller" && user.busId && participant.busId === user.busId) {
      await removeParticipant(participant.id, user.busId);
      // Update local state
      setParticipants(prev => prev.filter(p => p.id !== participant.id));
    }
  };

  // Handle export
  const handleExport = (format: "pdf" | "excel" | "csv") => {
    // In a real app, this would call an API to generate the export
    console.log(`Exporting in ${format} format`);
    
    // For demo purposes, just show a toast
    alert(`Export in ${format} format requested. This would be implemented in a real app.`);
  };

  // Sort participants by name
  const sortedParticipants = [...participants].sort((a, b) => 
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-medium">
            Participants in Bus {user?.busId}
          </h2>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("pdf")}>
              PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("excel")}>
              Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("csv")}>
              CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse-subtle">Loading participants...</div>
          </div>
        ) : sortedParticipants.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {sortedParticipants.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                onRemoveFromBus={handleRemoveFromBus}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-muted/30 rounded-lg border border-border"
          >
            <p className="text-muted-foreground mb-2">No participants in this bus yet</p>
            <p className="text-sm">Use the search function to add participants</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
