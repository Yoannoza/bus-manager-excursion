
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AdminLayout } from "@/components/AdminLayout";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import {
  UserCog,
  UserPlus,
  Trash2,
  Edit,
  User,
  Bus
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Type for controller user
type Controller = {
  id: string;
  name: string;
  email: string;
  busId: number;
  createdAt: string;
  lastLogin?: string;
};

export default function AdminControllers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [newControllerDialog, setNewControllerDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedController, setSelectedController] = useState<Controller | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busId, setBusId] = useState<string>("");
  
  // Edit form states
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBusId, setEditBusId] = useState<string>("");
  
  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  // Load mock controllers (in a real app, this would fetch from API)
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call with some delay
    const timer = setTimeout(() => {
      const mockControllers: Controller[] = [
        {
          id: "3",
          name: "Controller 1",
          email: "controller1@example.com",
          busId: 1,
          createdAt: "2023-05-15T10:30:00Z",
          lastLogin: "2023-06-01T08:15:22Z"
        },
        {
          id: "4",
          name: "Controller 2",
          email: "controller2@example.com",
          busId: 2,
          createdAt: "2023-05-15T11:45:00Z",
          lastLogin: "2023-06-02T14:30:10Z"
        },
        {
          id: "5",
          name: "Controller 3",
          email: "controller3@example.com",
          busId: 3,
          createdAt: "2023-05-16T09:20:00Z",
          lastLogin: "2023-06-01T16:05:45Z"
        },
        {
          id: "6",
          name: "Controller 4",
          email: "controller4@example.com",
          busId: 4,
          createdAt: "2023-05-16T14:10:00Z",
          lastLogin: "2023-06-03T09:22:30Z"
        }
      ];
      
      setControllers(mockControllers);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle creating a new controller
  const handleCreateController = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !email || !password || !busId) {
      toast.error("All fields are required");
      return;
    }
    
    // Check if email is already in use
    if (controllers.some(c => c.email === email)) {
      toast.error("Email is already in use");
      return;
    }
    
    // Create new controller
    const newController: Controller = {
      id: `${controllers.length + 1}`,
      name,
      email,
      busId: parseInt(busId),
      createdAt: new Date().toISOString()
    };
    
    // Add to list
    setControllers([...controllers, newController]);
    
    // Reset form
    setName("");
    setEmail("");
    setPassword("");
    setBusId("");
    
    // Close dialog
    setNewControllerDialog(false);
    
    toast.success("Controller created successfully");
  };
  
  // Handle editing a controller
  const handleEditController = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedController) return;
    
    // Validate form
    if (!editName || !editEmail || !editBusId) {
      toast.error("All fields are required");
      return;
    }
    
    // Check if email is already in use by another controller
    if (editEmail !== selectedController.email && 
        controllers.some(c => c.email === editEmail)) {
      toast.error("Email is already in use");
      return;
    }
    
    // Update controller
    const updatedControllers = controllers.map(c => {
      if (c.id === selectedController.id) {
        return {
          ...c,
          name: editName,
          email: editEmail,
          busId: parseInt(editBusId)
        };
      }
      return c;
    });
    
    setControllers(updatedControllers);
    
    // Close dialog
    setEditDialogOpen(false);
    
    toast.success("Controller updated successfully");
  };
  
  // Handle deleting a controller
  const handleDeleteController = (id: string) => {
    // Filter out the controller
    const updatedControllers = controllers.filter(c => c.id !== id);
    setControllers(updatedControllers);
    
    toast.success("Controller deleted successfully");
  };
  
  // Open edit dialog
  const openEditDialog = (controller: Controller) => {
    setSelectedController(controller);
    setEditName(controller.name);
    setEditEmail(controller.email);
    setEditBusId(controller.busId.toString());
    setEditDialogOpen(true);
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };
  
  return (
    <PageTransition>
      <AdminLayout title="Controllers Management">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-medium">Controllers Management</h1>
              <p className="text-muted-foreground">
                Add, edit, and manage bus controllers
              </p>
            </div>
            
            <Dialog open={newControllerDialog} onOpenChange={setNewControllerDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Controller
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Controller</DialogTitle>
                  <DialogDescription>
                    Create a new bus controller account
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateController}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="bus">Assigned Bus</Label>
                      <Select
                        value={busId}
                        onValueChange={setBusId}
                      >
                        <SelectTrigger id="bus">
                          <SelectValue placeholder="Select a bus" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Bus 1</SelectItem>
                          <SelectItem value="2">Bus 2</SelectItem>
                          <SelectItem value="3">Bus 3</SelectItem>
                          <SelectItem value="4">Bus 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit">Create Controller</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-pulse-subtle">Loading controllers...</div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid gap-4 sm:grid-cols-2"
            >
              {controllers.map((controller) => (
                <Card key={controller.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      {controller.name}
                    </CardTitle>
                    <CardDescription>{controller.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-muted-foreground" />
                        <span>Bus {controller.busId}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created: {formatDate(controller.createdAt)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last login: {formatDate(controller.lastLogin)}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(controller)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Controller</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {controller.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteController(controller.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </motion.div>
          )}
        </div>
        
        {/* Edit Controller Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Controller</DialogTitle>
              <DialogDescription>
                Update controller information
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleEditController}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-bus">Assigned Bus</Label>
                  <Select
                    value={editBusId}
                    onValueChange={setEditBusId}
                  >
                    <SelectTrigger id="edit-bus">
                      <SelectValue placeholder="Select a bus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Bus 1</SelectItem>
                      <SelectItem value="2">Bus 2</SelectItem>
                      <SelectItem value="3">Bus 3</SelectItem>
                      <SelectItem value="4">Bus 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </PageTransition>
  );
}
