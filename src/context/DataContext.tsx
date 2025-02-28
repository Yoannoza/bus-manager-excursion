
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

// Types
export type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  ticketId: string;
  busId: number | null;
  assignedAt: string | null;
  assignedBy: string | null;
};

export type Bus = {
  id: number;
  name: string;
  capacity: number;
  participants: Participant[];
};

type DataContextType = {
  buses: Bus[];
  allParticipants: Participant[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  assignParticipant: (participantId: string, busId: number) => Promise<void>;
  removeParticipant: (participantId: string, busId: number) => Promise<void>;
  searchParticipants: (query: string) => Participant[];
  getBusById: (busId: number) => Bus | undefined;
  getParticipantsByBusId: (busId: number) => Participant[];
  getAvailableBusCapacity: () => { id: number; name: string; used: number; capacity: number }[];
  getParticipantById: (id: string) => Participant | undefined;
};

// Mock data for demonstration
const MOCK_BUSES: Bus[] = [
  { id: 1, name: "Bus 1", capacity: 50, participants: [] },
  { id: 2, name: "Bus 2", capacity: 50, participants: [] },
  { id: 3, name: "Bus 3", capacity: 50, participants: [] },
  { id: 4, name: "Bus 4", capacity: 50, participants: [] },
];

// Generate random participants
const generateParticipants = (count: number): Participant[] => {
  const firstNames = ["Mohammed", "Fatima", "Ahmed", "Aisha", "Omar", "Mariam", "Ali", "Layla", "Hassan", "Zainab", "Youssef", "Nour", "Ibrahim", "Sara", "Karim"];
  const lastNames = ["Al-Farsi", "El-Masri", "Al-Rashid", "Bouazizi", "Khalil", "Bennani", "Al-Ahmed", "Hakimi", "Zidane", "Mansour", "Haddad", "Ibrahim", "Kaddour", "El-Amrani"];

  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const id = `p${i + 1000}`;
    const ticketId = `T${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Random bus assignment (some will be null/unassigned)
    const assignBus = Math.random() > 0.3;
    const busId = assignBus ? Math.floor(Math.random() * 4) + 1 : null;
    const assignedAt = busId ? new Date(Date.now() - Math.random() * 604800000).toISOString() : null; // Random time in the last week
    const assignedBy = busId ? ["Ahmed", "Mohamed", "Sara", "Admin User"][Math.floor(Math.random() * 4)] : null;
    
    return {
      id,
      firstName,
      lastName,
      ticketId,
      busId,
      assignedAt,
      assignedBy
    };
  });
};

// Create a list of participants
const MOCK_PARTICIPANTS = generateParticipants(200);

// Assign participants to buses
MOCK_PARTICIPANTS.forEach(participant => {
  if (participant.busId) {
    const bus = MOCK_BUSES.find(b => b.id === participant.busId);
    if (bus) {
      bus.participants.push(participant);
    }
  }
});

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize with mock data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setBuses([...MOCK_BUSES]);
        setAllParticipants([...MOCK_PARTICIPANTS]);
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Refresh data from the source (simulated)
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would fetch from Google Sheets
      toast.success("Data refreshed successfully");
    } catch (err) {
      setError("Failed to refresh data");
      toast.error("Failed to refresh data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Assign a participant to a bus
  const assignParticipant = async (participantId: string, busId: number) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update participant's bus assignment
      setAllParticipants(prev => 
        prev.map(p => {
          if (p.id === participantId) {
            return {
              ...p,
              busId,
              assignedAt: new Date().toISOString(),
              assignedBy: "Current User" // In real app, use the current user's name
            };
          }
          return p;
        })
      );
      
      // Update buses state
      setBuses(prev => {
        const newBuses = [...prev];
        
        // Remove participant from previous bus if any
        newBuses.forEach(bus => {
          bus.participants = bus.participants.filter(p => p.id !== participantId);
        });
        
        // Add participant to new bus
        const participant = allParticipants.find(p => p.id === participantId);
        if (participant) {
          const updatedParticipant = {
            ...participant,
            busId,
            assignedAt: new Date().toISOString(),
            assignedBy: "Current User" // In real app, use the current user's name
          };
          
          const targetBus = newBuses.find(b => b.id === busId);
          if (targetBus) {
            targetBus.participants.push(updatedParticipant);
          }
        }
        
        return newBuses;
      });
      
      toast.success("Participant assigned successfully");
    } catch (err) {
      toast.error("Failed to assign participant");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a participant from a bus
  const removeParticipant = async (participantId: string, busId: number) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update participant's bus assignment
      setAllParticipants(prev => 
        prev.map(p => {
          if (p.id === participantId) {
            return {
              ...p,
              busId: null,
              assignedAt: null,
              assignedBy: null
            };
          }
          return p;
        })
      );
      
      // Update buses state
      setBuses(prev => {
        const newBuses = [...prev];
        
        // Remove participant from the bus
        const targetBus = newBuses.find(b => b.id === busId);
        if (targetBus) {
          targetBus.participants = targetBus.participants.filter(p => p.id !== participantId);
        }
        
        return newBuses;
      });
      
      toast.success("Participant removed from bus");
    } catch (err) {
      toast.error("Failed to remove participant");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Search participants by name, id, or ticket id
  const searchParticipants = (query: string): Participant[] => {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return allParticipants.filter(p => 
      p.firstName.toLowerCase().includes(normalizedQuery) ||
      p.lastName.toLowerCase().includes(normalizedQuery) ||
      p.ticketId.toLowerCase().includes(normalizedQuery) ||
      `${p.firstName.toLowerCase()} ${p.lastName.toLowerCase()}`.includes(normalizedQuery)
    );
  };

  // Get a bus by its ID
  const getBusById = (busId: number): Bus | undefined => {
    return buses.find(b => b.id === busId);
  };

  // Get all participants in a specific bus
  const getParticipantsByBusId = (busId: number): Participant[] => {
    return allParticipants.filter(p => p.busId === busId);
  };

  // Get available capacity for all buses
  const getAvailableBusCapacity = () => {
    return buses.map(bus => ({
      id: bus.id,
      name: bus.name,
      used: bus.participants.length,
      capacity: bus.capacity
    }));
  };

  // Get a participant by ID
  const getParticipantById = (id: string): Participant | undefined => {
    return allParticipants.find(p => p.id === id);
  };

  return (
    <DataContext.Provider
      value={{
        buses,
        allParticipants,
        isLoading,
        error,
        refreshData,
        assignParticipant,
        removeParticipant,
        searchParticipants,
        getBusById,
        getParticipantsByBusId,
        getAvailableBusCapacity,
        getParticipantById,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
