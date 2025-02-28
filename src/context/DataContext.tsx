
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

// Mock buses data
const MOCK_BUSES: Bus[] = [
  { id: 1, name: "Bus 1", capacity: 50, participants: [] },
  { id: 2, name: "Bus 2", capacity: 50, participants: [] },
  { id: 3, name: "Bus 3", capacity: 50, participants: [] },
  { id: 4, name: "Bus 4", capacity: 50, participants: [] },
];

// Google Sheets ID
const SHEET_ID = "1YhAPWSm-94SGt3YwWPFF8NfP9EqIUvIn6O_oUVeLCIk";

// Fetch participants from Google Sheets
const fetchParticipantsFromSheets = async (): Promise<Participant[]> => {
  try {
    // Use the Google Sheets API to fetch data
    // This URL fetches the sheet as CSV
    const response = await fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch data from Google Sheets");
    }
    
    const csvData = await response.text();
    // Parse CSV data
    const rows = csvData.split("\n");
    
    // Skip the header row (first row)
    const participants: Participant[] = [];
    
    // Start from index 1 to skip header
    for (let i = 1; i < rows.length; i++) {
      // Parse the CSV row (handle commas in quoted strings)
      const row = parseCSVRow(rows[i]);
      
      if (row.length >= 3) {
        // Column mapping from Google Sheets
        const ticketId = row[0]?.replace(/"/g, "") || `T${1000 + i}`;
        const firstName = row[1]?.replace(/"/g, "") || "";
        const lastName = row[2]?.replace(/"/g, "") || "";
        const busIdStr = row[3]?.replace(/"/g, "") || "";
        const assignedAt = row[4]?.replace(/"/g, "") || null;
        const assignedBy = row[5]?.replace(/"/g, "") || null;
        
        // Parse busId as number or null
        let busId: number | null = null;
        if (busIdStr && !isNaN(parseInt(busIdStr))) {
          busId = parseInt(busIdStr);
        }
        
        participants.push({
          id: `p${1000 + i}`,
          firstName,
          lastName,
          ticketId,
          busId,
          assignedAt,
          assignedBy
        });
      }
    }
    
    return participants;
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    // Fallback to mock data on error
    toast.error("Impossible de charger les données depuis Google Sheets. Utilisation des données de démonstration.");
    return generateMockParticipants(200);
  }
};

// Helper function to parse CSV rows properly (handling quoted values with commas)
const parseCSVRow = (row: string): string[] => {
  const result: string[] = [];
  let inQuotes = false;
  let currentValue = "";
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    
    if (char === ',' && !inQuotes) {
      result.push(currentValue);
      currentValue = "";
      continue;
    }
    
    currentValue += char;
  }
  
  // Don't forget to add the last value
  if (currentValue) {
    result.push(currentValue);
  }
  
  return result;
};

// Generate mock participants (fallback if Google Sheets fails)
const generateMockParticipants = (count: number): Participant[] => {
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

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize with data from Google Sheets
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch participants from Google Sheets
        const participants = await fetchParticipantsFromSheets();
        
        // Initialize buses
        const busesCopy = [...MOCK_BUSES].map(bus => ({
          ...bus,
          participants: []
        }));
        
        // Assign participants to buses
        participants.forEach(participant => {
          if (participant.busId) {
            const bus = busesCopy.find(b => b.id === participant.busId);
            if (bus) {
              bus.participants.push(participant);
            }
          }
        });
        
        setBuses(busesCopy);
        setAllParticipants(participants);
        
        toast.success("Données chargées avec succès depuis Google Sheets");
      } catch (err) {
        setError("Échec du chargement des données");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Refresh data from Google Sheets
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch participants from Google Sheets
      const participants = await fetchParticipantsFromSheets();
      
      // Initialize buses
      const busesCopy = [...MOCK_BUSES].map(bus => ({
        ...bus,
        participants: []
      }));
      
      // Assign participants to buses
      participants.forEach(participant => {
        if (participant.busId) {
          const bus = busesCopy.find(b => b.id === participant.busId);
          if (bus) {
            bus.participants.push(participant);
          }
        }
      });
      
      setBuses(busesCopy);
      setAllParticipants(participants);
      
      toast.success("Données actualisées avec succès");
    } catch (err) {
      setError("Échec de l'actualisation des données");
      toast.error("Échec de l'actualisation des données");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Assign a participant to a bus
  const assignParticipant = async (participantId: string, busId: number) => {
    setIsLoading(true);
    
    try {
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
      
      toast.success("Participant assigné avec succès");
      
      // In a real app, this would update the Google Sheet via API
      console.log("API call would update Google Sheets with new bus assignment");
    } catch (err) {
      toast.error("Échec de l'assignation du participant");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a participant from a bus
  const removeParticipant = async (participantId: string, busId: number) => {
    setIsLoading(true);
    
    try {
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
      
      toast.success("Participant retiré du bus");
      
      // In a real app, this would update the Google Sheet via API
      console.log("API call would update Google Sheets to remove bus assignment");
    } catch (err) {
      toast.error("Échec du retrait du participant");
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
