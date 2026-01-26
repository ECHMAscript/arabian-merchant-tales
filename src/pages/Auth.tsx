import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, MapPin, ArrowLeft, Loader2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFormValidation } from "@/hooks/useFormValidation";
import EmailSentScreen from "@/components/EmailSentScreen";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();
  
  const {
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
  } = useFormValidation();

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

  const [showAddressFields, setShowAddressFields] = useState(false);

  // Real-time validation as user types
  useEffect(() => {
    if (!isLogin && formData.username) {
      checkUsernameAvailability(formData.username);
    }
  }, [formData.username, isLogin, checkUsernameAvailability]);

  useEffect(() => {
    if (formData.email) {
      validateEmail(formData.email);
    }
  }, [formData.email, validateEmail]);

  useEffect(() => {
    if (!isLogin && formData.password) {
      validatePassword(formData.password);
    }
  }, [formData.password, isLogin, validatePassword]);

  useEffect(() => {
    if (!isLogin && formData.confirmPassword) {
      validateConfirmPassword(formData.password, formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword, isLogin, validateConfirmPassword]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login validation
        const emailError = validateEmailFormat(formData.email);
        const passwordError = formData.password ? undefined : "Password is required";

        if (emailError || passwordError) {
          if (emailError) setEmailError(emailError);
          setIsLoading(false);
          return;
        }

        // Real Supabase login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes("Email not confirmed")) {
            toast.error("Please verify your email before signing in. Check your inbox for the verification link.");
          } else {
            throw error;
          }
          setIsLoading(false);
          return;
        }

        toast.success("Welcome back!");
        navigate("/");
      } else {
        // Signup validation - check all fields
        const usernameError = validateUsernameFormat(formData.username);
        const emailError = validateEmailFormat(formData.email);
        const passwordError = validatePasswordFormat(formData.password);
        const confirmError = validateConfirmPasswordFormat(formData.password, formData.confirmPassword);

        // Also check if username is still being validated or has an error
        if (validation.username.isChecking) {
          toast.error("Please wait while we check username availability");
          setIsLoading(false);
          return;
        }

        if (usernameError || emailError || passwordError || confirmError || validation.username.error) {
          // Trigger validation display
          if (usernameError) checkUsernameAvailability(formData.username);
          if (emailError) validateEmail(formData.email);
          if (passwordError) validatePassword(formData.password);
          if (confirmError) validateConfirmPassword(formData.password, formData.confirmPassword);
          setIsLoading(false);
          return;
        }

        // Create user in Supabase Auth (without auto-confirm)
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
            setEmailError("This email is already registered");
            setIsLoading(false);
            return;
          }
          throw error;
        }

        // User created - now send our custom verification email
        if (data.user) {
          try {
            const { error: emailError } = await supabase.functions.invoke("send-verification-email", {
              body: {
                email: formData.email,
                userId: data.user.id,
                username: formData.username,
              },
            });

            if (emailError) {
              console.error("Error sending verification email:", emailError);
              // Still show the verification screen even if email fails
              // User can try again or contact support
            }
          } catch (emailErr) {
            console.error("Failed to send verification email:", emailErr);
          }
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

  // Validation indicator component
  const ValidationIndicator = ({ isChecking, isValid, error }: { isChecking?: boolean; isValid: boolean; error?: string }) => {
    if (isChecking) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (error) {
      return <X className="h-4 w-4 text-destructive" />;
    }
    if (isValid) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  // Email verification success screen
  if (showEmailVerification) {
    return (
      <EmailSentScreen
        email={registeredEmail}
        onBackToSignIn={() => {
          setShowEmailVerification(false);
          setIsLogin(true);
          resetValidation();
          setFormData({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            address: "",
            city: "",
            country: "",
            postalCode: "",
          });
        }}
      />
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
                  <div className="relative">
                    <Input
                      id="username"
                      name="username"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`pr-10 ${validation.username.error ? "border-destructive focus-visible:ring-destructive" : validation.username.isValid ? "border-green-500 focus-visible:ring-green-500" : ""}`}
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <ValidationIndicator
                        isChecking={validation.username.isChecking}
                        isValid={validation.username.isValid}
                        error={validation.username.error}
                      />
                    </div>
                  </div>
                  {validation.username.error && (
                    <p className="text-destructive text-sm mt-1">{validation.username.error}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pr-10 ${validation.email.error ? "border-destructive focus-visible:ring-destructive" : validation.email.isValid ? "border-green-500 focus-visible:ring-green-500" : ""}`}
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <ValidationIndicator
                      isValid={validation.email.isValid}
                      error={validation.email.error}
                    />
                  </div>
                </div>
                {validation.email.error && (
                  <p className="text-destructive text-sm mt-1">{validation.email.error}</p>
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
                    className={`pr-16 ${!isLogin && validation.password.error ? "border-destructive focus-visible:ring-destructive" : !isLogin && validation.password.isValid ? "border-green-500 focus-visible:ring-green-500" : ""}`}
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {!isLogin && formData.password && (
                      <ValidationIndicator
                        isValid={validation.password.isValid}
                        error={validation.password.error}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {!isLogin && validation.password.error && (
                  <p className="text-destructive text-sm mt-1">{validation.password.error}</p>
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
                        className={`pr-16 ${validation.confirmPassword.error ? "border-destructive focus-visible:ring-destructive" : validation.confirmPassword.isValid ? "border-green-500 focus-visible:ring-green-500" : ""}`}
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {formData.confirmPassword && (
                          <ValidationIndicator
                            isValid={validation.confirmPassword.isValid}
                            error={validation.confirmPassword.error}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    {validation.confirmPassword.error && (
                      <p className="text-destructive text-sm mt-1">{validation.confirmPassword.error}</p>
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
                    resetValidation();
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
