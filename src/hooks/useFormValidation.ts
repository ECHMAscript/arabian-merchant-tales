import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ValidationState {
  username: { error?: string; isChecking: boolean; isValid: boolean };
  email: { error?: string; isChecking: boolean; isValid: boolean };
  password: { error?: string; isValid: boolean };
  confirmPassword: { error?: string; isValid: boolean };
}

const initialValidationState: ValidationState = {
  username: { isChecking: false, isValid: false },
  email: { isChecking: false, isValid: false },
  password: { isValid: false },
  confirmPassword: { isValid: false },
};

export const useFormValidation = () => {
  const [validation, setValidation] = useState<ValidationState>(initialValidationState);
  const debounceTimers = useRef<{ username?: NodeJS.Timeout; email?: NodeJS.Timeout }>({});

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimers.current.username) clearTimeout(debounceTimers.current.username);
      if (debounceTimers.current.email) clearTimeout(debounceTimers.current.email);
    };
  }, []);

  // Username validation rules
  const validateUsernameFormat = (username: string): string | undefined => {
    if (!username.trim()) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return undefined;
  };

  // Email validation rules
  const validateEmailFormat = (email: string): string | undefined => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    if (email.length > 255) return "Email must be less than 255 characters";
    return undefined;
  };

  // Password validation rules
  const validatePasswordFormat = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    return undefined;
  };

  // Confirm password validation
  const validateConfirmPasswordFormat = (password: string, confirmPassword: string): string | undefined => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return undefined;
  };

  // Check if username is taken (debounced)
  const checkUsernameAvailability = useCallback(async (username: string) => {
    // Clear existing timer
    if (debounceTimers.current.username) {
      clearTimeout(debounceTimers.current.username);
    }

    // First validate format
    const formatError = validateUsernameFormat(username);
    if (formatError) {
      setValidation(prev => ({
        ...prev,
        username: { error: formatError, isChecking: false, isValid: false },
      }));
      return;
    }

    // Set checking state
    setValidation(prev => ({
      ...prev,
      username: { isChecking: true, isValid: false },
    }));

    // Debounce the API call
    debounceTimers.current.username = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", username)
          .maybeSingle();

        if (error) {
          console.error("Error checking username:", error);
          setValidation(prev => ({
            ...prev,
            username: { error: undefined, isChecking: false, isValid: true },
          }));
          return;
        }

        if (data) {
          setValidation(prev => ({
            ...prev,
            username: { error: "This username is already taken", isChecking: false, isValid: false },
          }));
        } else {
          setValidation(prev => ({
            ...prev,
            username: { error: undefined, isChecking: false, isValid: true },
          }));
        }
      } catch (err) {
        console.error("Error checking username:", err);
        setValidation(prev => ({
          ...prev,
          username: { error: undefined, isChecking: false, isValid: true },
        }));
      }
    }, 500);
  }, []);

  // Validate email format (we can't check if email exists until signup)
  const validateEmail = useCallback((email: string) => {
    // Clear existing timer
    if (debounceTimers.current.email) {
      clearTimeout(debounceTimers.current.email);
    }

    const formatError = validateEmailFormat(email);
    
    // Debounce for smooth UX
    debounceTimers.current.email = setTimeout(() => {
      if (formatError) {
        setValidation(prev => ({
          ...prev,
          email: { error: formatError, isChecking: false, isValid: false },
        }));
      } else {
        setValidation(prev => ({
          ...prev,
          email: { error: undefined, isChecking: false, isValid: true },
        }));
      }
    }, 300);
  }, []);

  // Validate password
  const validatePassword = useCallback((password: string) => {
    const error = validatePasswordFormat(password);
    setValidation(prev => ({
      ...prev,
      password: { error, isValid: !error },
    }));
  }, []);

  // Validate confirm password
  const validateConfirmPassword = useCallback((password: string, confirmPassword: string) => {
    const error = validateConfirmPasswordFormat(password, confirmPassword);
    setValidation(prev => ({
      ...prev,
      confirmPassword: { error, isValid: !error },
    }));
  }, []);

  // Reset validation state
  const resetValidation = useCallback(() => {
    setValidation(initialValidationState);
  }, []);

  // Set email error (for signup errors from Supabase)
  const setEmailError = useCallback((error: string) => {
    setValidation(prev => ({
      ...prev,
      email: { error, isChecking: false, isValid: false },
    }));
  }, []);

  return {
    validation,
    checkUsernameAvailability,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    resetValidation,
    setEmailError,
    validateUsernameFormat,
    validateEmailFormat,
    validatePasswordFormat,
    validateConfirmPasswordFormat,
  };
};
