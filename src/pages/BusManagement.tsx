
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ControllerLayout } from "@/components/ControllerLayout";
import { PageTransition } from "@/components/PageTransition";
import { BusParticipantsList } from "@/components/BusParticipantsList";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";

export default function BusManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getAvailableBusCapacity } = useData();
  
  // Redirect if not logged in or not a controller
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);
  
  const busCapacities = getAvailableBusCapacity();
  const currentBus = busCapacities.find(bus => bus.id === user.busId);
  
  return (
    <PageTransition>
      <ControllerLayout title={`Bus ${user?.busId} Management`}>
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
          {currentBus && (
            <div className="bg-card border shadow-sm rounded-lg p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-medium">Bus {currentBus.id}</h1>
                  <p className="text-muted-foreground">
                    {currentBus.used}/{currentBus.capacity} seats filled ({currentBus.capacity - currentBus.used} available)
                  </p>
                </div>
                
                <Button onClick={() => navigate("/search")}>
                  <Search className="mr-2 h-4 w-4" />
                  Search Participants
                </Button>
              </div>
            </div>
          )}
          
          <BusParticipantsList />
        </div>
      </ControllerLayout>
    </PageTransition>
  );
}
