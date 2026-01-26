import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EmailSentScreenProps {
  email: string;
  onBackToSignIn: () => void;
}

const EmailSentScreen = ({ email, onBackToSignIn }: EmailSentScreenProps) => {
  return (
    <>
      <Helmet>
        <title>Verify Your Email - Rooh Al Andalus</title>
        <meta name="description" content="Please verify your email to complete registration" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          {/* Animated Envelope SVG */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <svg
              viewBox="0 0 120 100"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Envelope Back */}
              <path
                d="M10 25 L60 55 L110 25 L110 85 C110 90 105 95 100 95 L20 95 C15 95 10 90 10 85 Z"
                fill="hsl(35 25% 95%)"
                stroke="hsl(35 60% 50%)"
                strokeWidth="2"
              />
              
              {/* Envelope Flap */}
              <path
                d="M10 25 L60 60 L110 25 L100 15 C95 10 85 10 60 10 C35 10 25 10 20 15 Z"
                fill="hsl(40 70% 60%)"
                stroke="hsl(35 60% 50%)"
                strokeWidth="2"
                className="animate-pulse"
              />
              
              {/* Letter peeking out */}
              <rect
                x="25"
                y="35"
                width="70"
                height="50"
                rx="4"
                fill="white"
                stroke="hsl(35 25% 85%)"
                strokeWidth="1"
              />
              
              {/* Letter lines */}
              <line x1="35" y1="50" x2="85" y2="50" stroke="hsl(35 60% 50%)" strokeWidth="2" strokeLinecap="round" />
              <line x1="35" y1="60" x2="75" y2="60" stroke="hsl(35 25% 85%)" strokeWidth="2" strokeLinecap="round" />
              <line x1="35" y1="70" x2="65" y2="70" stroke="hsl(35 25% 85%)" strokeWidth="2" strokeLinecap="round" />
              
              {/* Decorative sparkles */}
              <circle cx="100" cy="15" r="3" fill="hsl(35 60% 50%)" className="animate-ping" style={{ animationDuration: "2s" }} />
              <circle cx="20" cy="20" r="2" fill="hsl(40 70% 60%)" className="animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
              <circle cx="105" cy="50" r="2.5" fill="hsl(35 60% 50%)" className="animate-ping" style={{ animationDuration: "3s", animationDelay: "1s" }} />
            </svg>
            
            {/* Animated glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-full blur-xl animate-pulse" />
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-4">
            Check Your Email
          </h1>
          
          <p className="font-body text-muted-foreground text-lg mb-4">
            We've sent a verification link to:
          </p>
          
          <p className="font-body text-primary font-semibold text-xl mb-6 break-all">
            {email}
          </p>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-12 h-0.5 bg-primary/30" />
            <span className="text-primary text-sm">✦</span>
            <span className="w-12 h-0.5 bg-primary/30" />
          </div>
          
          <p className="font-body text-muted-foreground mb-8">
            Click the link in the email to verify your account and complete your registration.
            If you don't see the email, check your spam folder.
          </p>
          
          <div className="space-y-4">
            <Button
              variant="gold"
              size="lg"
              className="w-full"
              onClick={onBackToSignIn}
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

          {/* Bottom decorative element */}
          <div className="mt-12 flex items-center justify-center gap-2">
            <span className="w-8 h-0.5 bg-primary/20" />
            <div className="w-2 h-2 rounded-full bg-primary/40" />
            <span className="w-8 h-0.5 bg-primary/20" />
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailSentScreen;
