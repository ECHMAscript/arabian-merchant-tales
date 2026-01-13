import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, MapPin, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCheckDuplicate } from "@/hooks/useCheckDuplicate";
interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();
  const { checkUsername, isChecking } = useCheckDuplicate();

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showAddressFields, setShowAddressFields] = useState(false);

  // Validation functions
  const validateUsername = (username: string): string | undefined => {
    if (!username.trim()) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    return undefined;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login validation
        const emailError = validateEmail(formData.email);
        const passwordError = formData.password ? undefined : "Password is required";

        if (emailError || passwordError) {
          setErrors({ email: emailError, password: passwordError });
          setIsLoading(false);
          return;
        }

        // Real Supabase login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        toast.success("Welcome back!");
        navigate("/");
      } else {
        // Signup validation
        const newErrors: ValidationErrors = {
          username: validateUsername(formData.username),
          email: validateEmail(formData.email),
          password: validatePassword(formData.password),
          confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
        };

        // Check if username is already taken
        if (!newErrors.username) {
          const usernameError = await checkUsername(formData.username);
          if (usernameError) {
            newErrors.username = usernameError;
          }
        }

        const hasErrors = Object.values(newErrors).some((error) => error !== undefined);

        if (hasErrors) {
          setErrors(newErrors);
          setIsLoading(false);
          return;
        }

        // Real Supabase signup
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              username: formData.username,
            },
          },
        });

        if (error) {
          // Check for duplicate email error
          if (error.message.includes("already registered") || error.message.includes("already exists")) {
            setErrors({ email: "This email is already registered" });
            setIsLoading(false);
            return;
          }
          throw error;
        }

        // Show email verification screen
        setRegisteredEmail(formData.email);
        setShowEmailVerification(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength === 0) return { strength: 0, label: "", color: "" };
    if (strength === 1) return { strength: 25, label: "Weak", color: "bg-destructive" };
    if (strength === 2) return { strength: 50, label: "Fair", color: "bg-secondary" };
    if (strength === 3) return { strength: 75, label: "Good", color: "bg-primary" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Email verification success screen
  if (showEmailVerification) {
    return (
      <>
        <Helmet>
          <title>Verify Your Email - Rooh Al Andalus</title>
          <meta name="description" content="Please verify your email to complete registration" />
        </Helmet>

        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Check Your Email
            </h1>
            <p className="font-body text-muted-foreground text-lg mb-6">
              We've sent a verification link to:
            </p>
            <p className="font-body text-primary font-semibold text-xl mb-8">
              {registeredEmail}
            </p>
            <p className="font-body text-muted-foreground mb-8">
              Click the link in the email to verify your account and complete your registration.
              If you don't see the email, check your spam folder.
            </p>
            <div className="space-y-4">
              <Button
                variant="gold"
                size="lg"
                className="w-full"
                onClick={() => {
                  setShowEmailVerification(false);
                  setIsLogin(true);
                }}
              >
                Go to Sign In
              </Button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-body">Back to Shop</span>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isLogin ? "Sign In" : "Create Account"} - Rooh Al Andalus</title>
        <meta name="description" content="Sign in or create an account at Rooh Al Andalus" />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Left Side - Decorative */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-foreground via-foreground to-primary/20 items-center justify-center p-12">
          <div className="absolute inset-0 pattern-arabesque opacity-10" />
          <div className="relative z-10 text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mx-auto mb-6">
              <span className="font-display text-primary-foreground text-3xl font-bold">ر</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-card mb-4">
              Rooh Al Andalus
            </h1>
            <p className="font-body text-card/80 text-lg">
              Discover the elegance of Arabian craftsmanship and timeless luxury
            </p>
            <div className="mt-8 flex items-center justify-center gap-2">
              <span className="w-12 h-0.5 bg-primary/50" />
              <span className="text-primary">✦</span>
              <span className="w-12 h-0.5 bg-primary/50" />
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16">
          <div className="max-w-md w-full mx-auto">
            {/* Back to Shop */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-body">Back to Shop</span>
            </Link>

            {/* Logo for mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mx-auto mb-4">
                <span className="font-display text-primary-foreground text-2xl font-bold">ر</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">Rooh Al Andalus</h1>
            </div>

            <div className="mb-8">
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="font-body text-muted-foreground">
                {isLogin
                  ? "Sign in to continue your journey"
                  : "Join us and explore authentic Arabian luxury"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <Label htmlFor="username" className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={errors.username ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <p className="text-destructive text-sm mt-1">{errors.username}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">{errors.password}</p>
                )}
                {!isLogin && formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{passwordStrength.label}</span>
                    </div>
                  </div>
                )}
              </div>

              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4" />
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Optional Address */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAddressFields(!showAddressFields)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="font-body text-sm">
                        {showAddressFields ? "Hide shipping address (optional)" : "Add shipping address (optional)"}
                      </span>
                    </button>

                    {showAddressFields && (
                      <div className="mt-4 space-y-4 animate-slide-up">
                        <div>
                          <Label htmlFor="address">Street Address</Label>
                          <Input
                            id="address"
                            name="address"
                            placeholder="123 Main Street"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="mt-1"
                            disabled={isLoading}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              name="city"
                              placeholder="Dubai"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="mt-1"
                              disabled={isLoading}
                            />
                          </div>
                          <div>
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              name="country"
                              placeholder="UAE"
                              value={formData.country}
                              onChange={handleInputChange}
                              className="mt-1"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                        <div className="w-1/2">
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            name="postalCode"
                            placeholder="12345"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            className="mt-1"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="font-body text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  }}
                  className="text-primary hover:underline font-medium"
                  disabled={isLoading}
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
