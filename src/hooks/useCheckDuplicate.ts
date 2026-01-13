import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCheckDuplicate = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkUsername = async (username: string): Promise<string | undefined> => {
    if (!username.trim()) return undefined;
    
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle();

      if (error) {
        console.error("Error checking username:", error);
        return undefined;
      }

      if (data) {
        return "This username is already taken";
      }
      return undefined;
    } finally {
      setIsChecking(false);
    }
  };

  const checkEmail = async (email: string): Promise<string | undefined> => {
    if (!email.trim()) return undefined;
    
    // We can't directly query auth.users, so we'll check during signup
    // The Supabase auth.signUp will return an error if email exists
    return undefined;
  };

  return { checkUsername, checkEmail, isChecking };
};
