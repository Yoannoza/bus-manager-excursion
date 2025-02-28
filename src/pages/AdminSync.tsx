
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { AdminLayout } from "@/components/AdminLayout";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import { 
  RefreshCw, 
  ArrowDown, 
  ArrowUp, 
  CheckCircle2, 
  Clock, 
  XCircle 
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// Type for sync history
type SyncHistoryItem = {
  id: string;
  timestamp: string;
  status: "success" | "error" | "pending";
  changes: {
    added: number;
    updated: number;
    removed: number;
  };
  duration: number;
  error?: string;
};

export default function AdminSync() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshData } = useData();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>([]);
  
  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  // Load mock sync history (in a real app, this would fetch from API)
  useEffect(() => {
    // Generate mock sync history
    const now = new Date();
    const mockHistory: SyncHistoryItem[] = [
      {
        id: "sync-4",
        timestamp: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
        status: "success",
        changes: {
          added: 5,
          updated: 3,
          removed: 0
        },
        duration: 2.3
      },
      {
        id: "sync-3",
        timestamp: new Date(now.getTime() - 86400000).toISOString(), // 1 day ago
        status: "error",
        changes: {
          added: 0,
          updated: 0,
          removed: 0
        },
        duration: 1.5,
        error: "Failed to parse Google Sheet data: Invalid format in column C"
      },
      {
        id: "sync-2",
        timestamp: new Date(now.getTime() - 86400000 * 2).toISOString(), // 2 days ago
        status: "success",
        changes: {
          added: 12,
          updated: 8,
          removed: 2
        },
        duration: 3.7
      },
      {
        id: "sync-1",
        timestamp: new Date(now.getTime() - 86400000 * 3).toISOString(), // 3 days ago
        status: "success",
        changes: {
          added: 45,
          updated: 0,
          removed: 0
        },
        duration: 5.2
      }
    ];
    
    setSyncHistory(mockHistory);
    setLastSyncTime(mockHistory[0].timestamp);
  }, []);
  
  // Handle manual sync
  const handleSync = () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncProgress(0);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    
    // Call the actual refresh data function
    refreshData()
      .then(() => {
        // Sync completed successfully
        clearInterval(interval);
        setSyncProgress(100);
        
        // Update last sync time
        const now = new Date().toISOString();
        setLastSyncTime(now);
        
        // Add to sync history
        const newSyncItem: SyncHistoryItem = {
          id: `sync-${syncHistory.length + 1}`,
          timestamp: now,
          status: "success",
          changes: {
            added: Math.floor(Math.random() * 5),
            updated: Math.floor(Math.random() * 10),
            removed: 0
          },
          duration: Math.random() * 3 + 1
        };
        
        setSyncHistory([newSyncItem, ...syncHistory]);
        
        toast.success("Synchronization completed successfully", {
          description: `Added: ${newSyncItem.changes.added}, Updated: ${newSyncItem.changes.updated}, Removed: ${newSyncItem.changes.removed}`,
        });
      })
      .catch(error => {
        // Sync failed
        clearInterval(interval);
        setSyncProgress(100);
        
        // Add to sync history
        const now = new Date().toISOString();
        const newSyncItem: SyncHistoryItem = {
          id: `sync-${syncHistory.length + 1}`,
          timestamp: now,
          status: "error",
          changes: {
            added: 0,
            updated: 0,
            removed: 0
          },
          duration: Math.random() * 2 + 0.5,
          error: "Failed to connect to Google Sheets API"
        };
        
        setSyncHistory([newSyncItem, ...syncHistory]);
        
        toast.error("Synchronization failed", {
          description: newSyncItem.error,
        });
      })
      .finally(() => {
        // Wait a bit before resetting the syncing state
        setTimeout(() => {
          setIsSyncing(false);
        }, 500);
      });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("default", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  };
  
  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  };
  
  return (
    <PageTransition>
      <AdminLayout title="Data Synchronization">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-medium">Data Synchronization</h1>
              <p className="text-muted-foreground">
                Manage Google Sheets data synchronization
              </p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Manual Synchronization</CardTitle>
                  <CardDescription>
                    Force a synchronization with Google Sheets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Last synchronized:
                      </div>
                      <div className="font-medium">
                        {lastSyncTime ? formatTimeAgo(lastSyncTime) : "Never"}
                      </div>
                    </div>
                    
                    {isSyncing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Sync in progress...</span>
                          <span>{syncProgress}%</span>
                        </div>
                        <Progress value={syncProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="w-full"
                  >
                    {isSyncing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </motion.div>
                        Synchronizing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Synchronize Now
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Sync Statistics</CardTitle>
                  <CardDescription>
                    Summary of synchronization activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1 text-center">
                      <p className="text-2xl font-bold text-emerald-500">
                        {syncHistory.filter(s => s.status === "success").length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Successful
                      </p>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-2xl font-bold text-amber-500">
                        {syncHistory.filter(s => s.status === "pending").length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pending
                      </p>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-2xl font-bold text-destructive">
                        {syncHistory.filter(s => s.status === "error").length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Failed
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1 text-center">
                      <p className="text-2xl font-bold">
                        {syncHistory.reduce((sum, item) => sum + item.changes.added, 0)}
                      </p>
                      <div className="flex justify-center items-center gap-1 text-sm text-muted-foreground">
                        <ArrowDown className="h-3 w-3 text-emerald-500" />
                        <span>Added</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-2xl font-bold">
                        {syncHistory.reduce((sum, item) => sum + item.changes.updated, 0)}
                      </p>
                      <div className="flex justify-center items-center gap-1 text-sm text-muted-foreground">
                        <RefreshCw className="h-3 w-3 text-blue-500" />
                        <span>Updated</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-2xl font-bold">
                        {syncHistory.reduce((sum, item) => sum + item.changes.removed, 0)}
                      </p>
                      <div className="flex justify-center items-center gap-1 text-sm text-muted-foreground">
                        <ArrowUp className="h-3 w-3 text-amber-500" />
                        <span>Removed</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Synchronization History</CardTitle>
                <CardDescription>
                  Recent synchronization operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {syncHistory.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No synchronization history yet
                    </div>
                  ) : (
                    syncHistory.map((item) => (
                      <div 
                        key={item.id}
                        className="border rounded-lg p-4 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {item.status === "success" && (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            )}
                            {item.status === "error" && (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            {item.status === "pending" && (
                              <Clock className="h-5 w-5 text-amber-500" />
                            )}
                            <span className="font-medium">
                              {item.status === "success" && "Successful sync"}
                              {item.status === "error" && "Failed sync"}
                              {item.status === "pending" && "Pending sync"}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(item.timestamp)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Added:</span>{" "}
                            <span className={item.changes.added > 0 ? "text-emerald-500 font-medium" : ""}>
                              {item.changes.added}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Updated:</span>{" "}
                            <span className={item.changes.updated > 0 ? "text-blue-500 font-medium" : ""}>
                              {item.changes.updated}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Removed:</span>{" "}
                            <span className={item.changes.removed > 0 ? "text-amber-500 font-medium" : ""}>
                              {item.changes.removed}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Duration: {item.duration.toFixed(1)}s
                        </div>
                        
                        {item.error && (
                          <div className="mt-2 text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                            {item.error}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AdminLayout>
    </PageTransition>
  );
}
