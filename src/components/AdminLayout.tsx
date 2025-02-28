
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  ChevronLeft, 
  LogOut, 
  Menu, 
  LayoutDashboard, 
  Users, 
  UserCog, 
  Settings, 
  RefreshCw 
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  className?: string;
}

export function AdminLayout({ 
  children, 
  title, 
  showBackButton = false,
  className
}: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Participants", href: "/admin/participants", icon: Users },
    { label: "Controllers", href: "/admin/controllers", icon: UserCog },
    { label: "Settings", href: "/admin/settings", icon: Settings },
    { label: "Synchronization", href: "/admin/sync", icon: RefreshCw },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border h-16 flex items-center px-4 sm:px-8">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
                className="flex lg:hidden"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : (
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <div className="flex flex-col gap-6 mt-6">
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-muted-foreground">
                        Admin Panel
                      </p>
                      <p className="text-lg font-medium">{user?.name}</p>
                    </div>
                    
                    <nav className="space-y-1">
                      {navItems.map((item) => (
                        <Button
                          key={item.href}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            navigate(item.href);
                            setSheetOpen(false);
                          }}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Button>
                      ))}
                    </nav>
                    
                    <div className="mt-auto">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <h1 className="text-lg font-medium">
              {title || "Admin Panel"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:inline-block">
              {user?.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Desktop navigation */}
      <div className="flex-1 flex">
        <aside className="hidden lg:block w-64 border-r border-border p-4">
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Admin Panel
              </p>
              <p className="text-lg font-medium">{user?.name}</p>
            </div>
            
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
            
            <div className="mt-auto pt-6">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className={cn("flex-1 overflow-y-auto", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
