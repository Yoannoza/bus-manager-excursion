
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function NotFound() {
  const { user } = useAuth();

  const homeUrl = user 
    ? user.role === "admin" 
      ? "/admin" 
      : "/dashboard"
    : "/login";

  return (
    <PageTransition>
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-6 px-4">
          <h1 className="text-6xl font-bold">404</h1>
          <h2 className="text-2xl">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Button asChild>
            <Link to={homeUrl}>
              <Home className="mr-2 h-4 w-4" />
              Go Back Home
            </Link>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
