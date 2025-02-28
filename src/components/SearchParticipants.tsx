
import { useState, useRef, useEffect } from "react";
import { useData, Participant } from "@/context/DataContext";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ParticipantCard } from "@/components/ParticipantCard";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export function SearchParticipants() {
  const { user } = useAuth();
  const { searchParticipants, assignParticipant } = useData();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Participant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle search
  const handleSearch = () => {
    if (query.trim().length > 0) {
      setIsSearching(true);
      // Simulate a slight delay for better UX
      setTimeout(() => {
        setResults(searchParticipants(query));
        setIsSearching(false);
      }, 300);
    } else {
      setResults([]);
    }
  };

  // Search when Enter is pressed
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle adding participant to bus
  const handleAddToBus = async (participant: Participant) => {
    if (user?.role === "controller" && user.busId) {
      await assignParticipant(participant.id, user.busId);
      // Update results to reflect the change
      setResults(prev => 
        prev.map(p => p.id === participant.id 
          ? { ...p, busId: user.busId, assignedAt: new Date().toISOString(), assignedBy: user.name } 
          : p
        )
      );
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto w-full">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search by name or ticket ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 h-12"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <Button 
        onClick={handleSearch} 
        disabled={isSearching || query.trim().length === 0}
        className="w-full"
      >
        {isSearching ? "Searching..." : "Search"}
      </Button>
      
      <AnimatePresence mode="wait">
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 mt-6"
          >
            <h3 className="text-sm font-medium text-muted-foreground">
              {results.length} {results.length === 1 ? "result" : "results"} found
            </h3>
            
            {results.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                onAddToBus={handleAddToBus}
              />
            ))}
          </motion.div>
        )}
        
        {query.trim().length > 0 && results.length === 0 && !isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <p className="text-muted-foreground">No participants found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
