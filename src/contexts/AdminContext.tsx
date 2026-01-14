import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminContextType {
  isAdmin: boolean;
  hasAdminRole: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  loading: boolean;
  toggleAdminMode: () => void;
  signOut: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [hasAdminRole, setHasAdminRole] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminModeEnabled, setAdminModeEnabled] = useState(false);

  useEffect(() => {
    // Set up auth state listener BEFORE getting initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        setUserId(user?.id ?? null);
        setIsAuthenticated(!!user);
        
        if (user) {
          // Check admin role from database using setTimeout to avoid deadlock
          setTimeout(async () => {
            const { data } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", user.id)
              .eq("role", "admin")
              .maybeSingle();
            
            setHasAdminRole(!!data);
            setLoading(false);
          }, 0);
        } else {
          setHasAdminRole(false);
          setAdminModeEnabled(false);
          setLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      setUserId(user?.id ?? null);
      setIsAuthenticated(!!user);
      
      if (user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        setHasAdminRole(!!data);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleAdminMode = () => {
    // Only allow toggling if user has admin role
    if (hasAdminRole) {
      setAdminModeEnabled((prev) => !prev);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setHasAdminRole(false);
    setAdminModeEnabled(false);
    setIsAuthenticated(false);
    setUserId(null);
  };

  return (
    <AdminContext.Provider value={{ 
      isAdmin: hasAdminRole && adminModeEnabled,
      hasAdminRole,
      isAuthenticated,
      userId,
      loading,
      toggleAdminMode,
      signOut,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
