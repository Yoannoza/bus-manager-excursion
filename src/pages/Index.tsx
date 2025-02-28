
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Auto-redirect based on auth status
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold tracking-tight mb-3">Bus Manager</h1>
              <p className="text-muted-foreground mb-8">
                A streamlined bus management platform for event controllers
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button
                size="lg"
                className="w-full mb-4"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Demo application - use admin@example.com / admin123 or<br />
                controller@example.com / controller123 to log in
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
