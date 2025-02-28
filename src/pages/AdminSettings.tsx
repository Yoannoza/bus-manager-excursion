
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AdminLayout } from "@/components/AdminLayout";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Settings, Link2, Save, Check, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function AdminSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Settings state
  const [googleSheetUrl, setGoogleSheetUrl] = useState(
    "https://docs.google.com/spreadsheets/d/1YhAPWSm-94SGt3YwWPFF8NfP9EqIUvIn6O_oUVeLCIk/edit?usp=sharing"
  );
  const [newGoogleSheetUrl, setNewGoogleSheetUrl] = useState(
    "https://docs.google.com/spreadsheets/d/1YhAPWSm-94SGt3YwWPFF8NfP9EqIUvIn6O_oUVeLCIk/edit?usp=sharing"
  );
  const [isUrlChanged, setIsUrlChanged] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState("30");
  const [notifyControllers, setNotifyControllers] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  // Handle Google Sheet URL change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setNewGoogleSheetUrl(url);
    setIsUrlChanged(url !== googleSheetUrl);
  };
  
  // Handle saving settings
  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call with delay
    setTimeout(() => {
      // Update the Google Sheet URL if changed
      if (isUrlChanged) {
        setGoogleSheetUrl(newGoogleSheetUrl);
        setIsUrlChanged(false);
        toast.success("Google Sheet URL updated successfully");
      }
      
      toast.success("Settings saved successfully");
      setIsSaving(false);
    }, 1000);
  };
  
  // Handle confirming Google Sheet URL change
  const handleConfirmUrlChange = () => {
    // Close the dialog
    setConfirmDialogOpen(false);
    
    // Show loading state
    setIsSaving(true);
    
    // Simulate API call with delay
    setTimeout(() => {
      // Update the URL
      setGoogleSheetUrl(newGoogleSheetUrl);
      setIsUrlChanged(false);
      
      // Show success message
      toast.success("Google Sheet URL updated successfully", {
        description: "All controllers will need to reconnect to access the new data.",
      });
      
      setIsSaving(false);
    }, 1500);
  };
  
  // Extract sheet ID from the URL
  const getSheetId = (url: string) => {
    try {
      // Regular expression to extract sheet ID from Google Sheets URL
      const regex = /\/d\/([a-zA-Z0-9-_]+)/;
      const match = url.match(regex);
      return match ? match[1] : "Invalid URL";
    } catch (error) {
      return "Invalid URL";
    }
  };
  
  return (
    <PageTransition>
      <AdminLayout title="Settings">
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-medium">System Settings</h1>
            <p className="text-muted-foreground">
              Configure your application settings
            </p>
          </div>
          
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-muted-foreground" />
                    Google Sheets Integration
                  </CardTitle>
                  <CardDescription>
                    Configure the Google Sheets connection for participant data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="current-sheet">Current Google Sheet</Label>
                      <div className="flex items-center">
                        <Input
                          id="current-sheet"
                          value={googleSheetUrl}
                          readOnly
                          className="bg-muted"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                          onClick={() => {
                            navigator.clipboard.writeText(googleSheetUrl);
                            toast.success("URL copied to clipboard");
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sheet ID: {getSheetId(googleSheetUrl)}
                      </p>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="new-sheet">New Google Sheet URL</Label>
                      <Input
                        id="new-sheet"
                        value={newGoogleSheetUrl}
                        onChange={handleUrlChange}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                      />
                      <p className="text-sm text-muted-foreground">
                        Changing the Google Sheet URL will require all controllers to reconnect.
                      </p>
                    </div>
                    
                    {isUrlChanged && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-3 rounded-md flex items-start gap-2 border border-amber-200 dark:border-amber-900">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">
                          Changing the Google Sheet URL is a critical operation. All controllers will be signed out and will need to reconnect to access the new data.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                {isUrlChanged && (
                  <CardFooter>
                    <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          Update Google Sheet URL
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Change Google Sheet URL</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to change the Google Sheet URL? This will log out all controllers and they will need to reconnect to access the new data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleConfirmUrlChange}
                          >
                            Confirm Change
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    Synchronization Settings
                  </CardTitle>
                  <CardDescription>
                    Configure how the system synchronizes with Google Sheets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-sync">Automatic Synchronization</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically sync data from Google Sheets
                        </p>
                      </div>
                      <Switch
                        id="auto-sync"
                        checked={autoSync}
                        onCheckedChange={setAutoSync}
                      />
                    </div>
                    
                    {autoSync && (
                      <div className="grid gap-2">
                        <Label htmlFor="sync-interval">Sync Interval (minutes)</Label>
                        <Input
                          id="sync-interval"
                          type="number"
                          value={syncInterval}
                          onChange={(e) => setSyncInterval(e.target.value)}
                          min="5"
                          max="60"
                        />
                        <p className="text-sm text-muted-foreground">
                          How often the system should sync with Google Sheets (5-60 minutes)
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="notify-controllers">Notify Controllers</Label>
                        <p className="text-sm text-muted-foreground">
                          Send notifications to controllers when data is synced
                        </p>
                      </div>
                      <Switch
                        id="notify-controllers"
                        checked={notifyControllers}
                        onCheckedChange={setNotifyControllers}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <Settings className="h-4 w-4" />
                        </motion.div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </AdminLayout>
    </PageTransition>
  );
}
