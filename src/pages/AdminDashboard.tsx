
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AdminLayout } from "@/components/AdminLayout";
import { PageTransition } from "@/components/PageTransition";
import { BusCapacityDisplay } from "@/components/BusCapacityDisplay";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCw, Users, Bus, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    buses, 
    allParticipants, 
    refreshData, 
    isLoading, 
    getAvailableBusCapacity 
  } = useData();
  
  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "admin") {
      navigate("/dashboard");
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
  
  // Count participants with and without bus
  const participantsWithBus = allParticipants.filter(p => p.busId !== null).length;
  const participantsWithoutBus = allParticipants.length - participantsWithBus;
  
  return (
    <PageTransition>
      <AdminLayout title="Admin Dashboard">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-medium">Admin Dashboard</h1>
            <Button 
              variant="outline" 
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Sync Data
            </Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Participants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-muted-foreground mr-2" />
                    <span className="text-3xl font-bold">{allParticipants.length}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Assigned to Buses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Bus className="h-5 w-5 text-muted-foreground mr-2" />
                    <span className="text-3xl font-bold">{participantsWithBus}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Unassigned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <UserPlus className="h-5 w-5 text-muted-foreground mr-2" />
                    <span className="text-3xl font-bold">{participantsWithoutBus}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Buses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Bus className="h-5 w-5 text-muted-foreground mr-2" />
                    <span className="text-3xl font-bold">{buses.length}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Bus Capacity</CardTitle>
                <CardDescription>
                  Overview of all bus capacities and assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {busCapacities.map(bus => (
                    <BusCapacityDisplay
                      key={bus.id}
                      busId={bus.id}
                      name={`Bus ${bus.id}`}
                      used={bus.used}
                      capacity={bus.capacity}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <div className="h-6"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="text-sm text-muted-foreground text-center mt-10"
          >
            <p>
              This is a demo admin dashboard. In a real app, you would be able to manage controllers, 
              edit participants, and configure the Google Sheets integration from here.
            </p>
          </motion.div>
        </div>
      </AdminLayout>
    </PageTransition>
  );
}
