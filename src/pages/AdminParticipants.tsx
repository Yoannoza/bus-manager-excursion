
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData, Participant } from "@/context/DataContext";
import { AdminLayout } from "@/components/AdminLayout";
import { PageTransition } from "@/components/PageTransition";
import { ParticipantCard } from "@/components/ParticipantCard";
import { motion } from "framer-motion";
import { FilterX, FileCheck, Filter, Bus, Search, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AdminParticipants() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { allParticipants, buses, refreshData, isLoading } = useData();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [busFilter, setBusFilter] = useState<string>("all");
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [viewMode, setViewMode] = useState<"all" | "assigned" | "unassigned">("all");
  
  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  // Filter participants based on search query, bus filter, and view mode
  useEffect(() => {
    let result = [...allParticipants];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.firstName.toLowerCase().includes(query) ||
          p.lastName.toLowerCase().includes(query) ||
          p.ticketId.toLowerCase().includes(query) ||
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(query)
      );
    }
    
    // Apply bus filter
    if (busFilter !== "all") {
      const busId = parseInt(busFilter);
      result = result.filter(p => p.busId === busId);
    }
    
    // Apply view mode
    if (viewMode === "assigned") {
      result = result.filter(p => p.busId !== null);
    } else if (viewMode === "unassigned") {
      result = result.filter(p => p.busId === null);
    }
    
    setFilteredParticipants(result);
  }, [allParticipants, searchQuery, busFilter, viewMode]);
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setBusFilter("all");
    setViewMode("all");
  };
  
  // If loading or no user, show loading
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading participants data...</div>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <AdminLayout title="Participants Management">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-medium">Participants Management</h1>
              <p className="text-muted-foreground">
                Manage and view all participants across buses
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Filter participants by various criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ticket ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="w-full sm:w-48">
                  <Select 
                    value={busFilter} 
                    onValueChange={setBusFilter}
                  >
                    <SelectTrigger>
                      <Bus className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by bus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Buses</SelectItem>
                      {buses.map((bus) => (
                        <SelectItem key={bus.id} value={bus.id.toString()}>
                          Bus {bus.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={clearFilters}
                  className="h-10 w-10"
                  title="Clear filters"
                >
                  <FilterX className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-4">
                <Tabs 
                  value={viewMode} 
                  onValueChange={(value) => setViewMode(value as "all" | "assigned" | "unassigned")}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="assigned">Assigned</TabsTrigger>
                    <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium">
                Results {filteredParticipants.length > 0 && `(${filteredParticipants.length})`}
              </h2>
            </div>
            
            {filteredParticipants.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {filteredParticipants.map((participant) => (
                  <ParticipantCard
                    key={participant.id}
                    participant={participant}
                    showControls={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/30 rounded-lg border">
                <Filter className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No participants found</p>
                <p className="text-sm text-muted-foreground/70 mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                >
                  <FilterX className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </AdminLayout>
    </PageTransition>
  );
}
