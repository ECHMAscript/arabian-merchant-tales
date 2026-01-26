import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already_verified">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setErrorMessage("No verification token provided");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-email", {
          body: { token },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.success) {
          if (data.alreadyVerified) {
            setStatus("already_verified");
          } else {
            setStatus("success");
          }
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Verification failed");
        }
      } catch (error: any) {
        console.error("Verification error:", error);
        setStatus("error");
        setErrorMessage(error.message || "Something went wrong");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <>
      <Helmet>
        <title>Email Verification - Rooh Al Andalus</title>
        <meta name="description" content="Verify your email address" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          {status === "loading" && (
            <>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Loader2 className="h-10 w-10 text-primary-foreground animate-spin" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Verifying Your Email
              </h1>
              <p className="font-body text-muted-foreground text-lg">
                Please wait while we verify your account...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Email Verified!
              </h1>
              <p className="font-body text-muted-foreground text-lg mb-8">
                Your account has been successfully verified. You can now sign in and explore our collection of authentic Arabian treasures.
              </p>
              <div className="space-y-4">
                <Link to="/auth">
                  <Button variant="gold" size="lg" className="w-full">
                    Sign In to Your Account
                  </Button>
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-body">Back to Shop</span>
                </Link>
              </div>
            </>
          )}

          {status === "already_verified" && (
            <>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Already Verified
              </h1>
              <p className="font-body text-muted-foreground text-lg mb-8">
                Your email has already been verified. You can sign in to your account.
              </p>
              <div className="space-y-4">
                <Link to="/auth">
                  <Button variant="gold" size="lg" className="w-full">
                    Sign In to Your Account
                  </Button>
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-body">Back to Shop</span>
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-destructive/80 to-destructive flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-10 w-10 text-white" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Verification Failed
              </h1>
              <p className="font-body text-muted-foreground text-lg mb-8">
                {errorMessage || "We couldn't verify your email. The link may have expired or is invalid."}
              </p>
              <div className="space-y-4">
                <Link to="/auth">
                  <Button variant="gold" size="lg" className="w-full">
                    Try Signing Up Again
                  </Button>
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-body">Back to Shop</span>
                </Link>
              </div>
            </>
          )}

          {/* Decorative Element */}
          <div className="mt-12 flex items-center justify-center gap-2">
            <span className="w-12 h-0.5 bg-primary/30" />
            <span className="text-primary text-sm">✦</span>
            <span className="w-12 h-0.5 bg-primary/30" />
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;
