
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";

const UserMenu = () => {
  const { user, logout } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b mb-2">
      <div className="flex items-center gap-2 flex-1">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
          <User className="h-4 w-4" />
        </div>
        <div className="text-sm overflow-hidden">
          <p className="font-medium truncate">{user.username}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={logout}
        title="Log out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default UserMenu;
