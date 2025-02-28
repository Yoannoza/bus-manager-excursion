
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { ControllerLayout } from "@/components/ControllerLayout";
import { PageTransition } from "@/components/PageTransition";
import { BusCapacityDisplay } from "@/components/BusCapacityDisplay";
import { Button } from "@/components/ui/button";
import { Search, Bus, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getAvailableBusCapacity, refreshData, isLoading } = useData();
  
  // Redirect if not logged in or not a controller
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);
  
  // If loading or no user, show loading
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading dashboard...</div>
      </div>
    );
  }
  
  const busCapacities = getAvailableBusCapacity();
  const currentBus = busCapacities.find(bus => bus.id === user.busId);
  
  return (
    <PageTransition>
      <ControllerLayout title="Dashboard">
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
          <div className="space-y-8">
            {/* Current bus status */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-card p-6 rounded-lg border shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bus className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-xl font-medium">Your Bus Status</h2>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8"
                  onClick={refreshData}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              {currentBus && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Bus Number</p>
                      <p className="text-2xl font-semibold">{currentBus.id}</p>
                    </div>
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Seats Filled</p>
                      <p className="text-2xl font-semibold">{currentBus.used}</p>
                    </div>
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Capacity</p>
                      <p className="text-2xl font-semibold">{currentBus.capacity}</p>
                    </div>
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Seats Left</p>
                      <p className="text-2xl font-semibold">{currentBus.capacity - currentBus.used}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => navigate("/bus")}
                    >
                      <Bus className="mr-2 h-4 w-4" />
                      View My Bus
                    </Button>
                    <Button 
                      className="flex-1"
                      variant="outline"
                      onClick={() => navigate("/search")}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Search Participants
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
            
            {/* Bus capacity overview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h2 className="text-xl font-medium mb-4">All Buses Status</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {busCapacities.map(bus => (
                  <BusCapacityDisplay
                    key={bus.id}
                    busId={bus.id}
                    name={`Bus ${bus.id}`}
                    used={bus.used}
                    capacity={bus.capacity}
                    isCurrentBus={bus.id === user.busId}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </ControllerLayout>
    </PageTransition>
  );
}
