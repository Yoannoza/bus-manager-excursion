
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ControllerLayout } from "@/components/ControllerLayout";
import { PageTransition } from "@/components/PageTransition";
import { SearchParticipants } from "@/components/SearchParticipants";
import { useData } from "@/context/DataContext";

export default function SearchPage() {
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
      <ControllerLayout title="Search Participants" showBackButton>
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
          {currentBus && (
            <div className="bg-card border shadow-sm rounded-lg p-4 sm:p-6 mb-6">
              <h1 className="text-2xl font-medium mb-1">Find Participants</h1>
              <p className="text-muted-foreground mb-4">
                Search by name or ticket ID to add participants to Bus {currentBus.id}
              </p>
              
              <SearchParticipants />
            </div>
          )}
        </div>
      </ControllerLayout>
    </PageTransition>
  );
}
