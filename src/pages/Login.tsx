
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Login() {
  const { login, loginWithMagicLink, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");

  const handleLoginForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      
      // Redirect based on role (in a real app this would be more sophisticated)
      // For demo purposes we'll use simple checks
      if (email.includes("admin")) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      // Error is already handled in the login function
    }
  };

  const handleMagicLinkForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!magicEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    
    try {
      await loginWithMagicLink(magicEmail);
      
      // Redirect based on role (simplified for demo)
      if (magicEmail.includes("admin")) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      // Error is already handled in the loginWithMagicLink function
    }
  };

  return (
    <PageTransition>
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold tracking-tight">Bus Manager</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to access your dashboard
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="bg-card rounded-xl shadow-sm border p-6">
              <Tabs defaultValue="credentials" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="credentials">Password</TabsTrigger>
                  <TabsTrigger value="magic">Magic Link</TabsTrigger>
                </TabsList>
                
                <TabsContent value="credentials">
                  <form onSubmit={handleLoginForm} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="password">Password</Label>
                        <a
                          href="#"
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            toast.info("For demo purposes, use admin@example.com / admin123 or controller@example.com / controller123");
                          }}
                        >
                          Forgot password?
                        </a>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                    
                    <div className="text-center text-sm text-muted-foreground mt-4">
                      <p>
                        Demo credentials:
                      </p>
                      <p className="font-mono text-xs mt-1">
                        admin@example.com / admin123
                      </p>
                      <p className="font-mono text-xs">
                        controller@example.com / controller123
                      </p>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="magic">
                  <form onSubmit={handleMagicLinkForm} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="magic-email">Email</Label>
                      <Input
                        id="magic-email"
                        type="email"
                        placeholder="your@email.com"
                        value={magicEmail}
                        onChange={(e) => setMagicEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Sending link..." : "Send Magic Link"}
                    </Button>
                    
                    <div className="text-center text-sm text-muted-foreground mt-4">
                      <p>
                        For demo, use any of these emails:
                      </p>
                      <p className="font-mono text-xs mt-1">
                        admin@example.com
                      </p>
                      <p className="font-mono text-xs">
                        controller@example.com
                      </p>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            This is a demonstration app. In a real deployment, this would connect to your Google Sheets.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
