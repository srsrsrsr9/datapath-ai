import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function EmailVerification() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  // Check verification token from URL
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  // Verify email token if present
  const verifyEmailMutation = useMutation({
    mutationFn: async (token: string) => {
      await apiRequest("GET", `/api/auth/verify-email?token=${token}`);
    },
    onSuccess: () => {
      toast({
        title: "Email Verified!",
        description: "Your email has been successfully verified. Redirecting...",
      });
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired verification token.",
        variant: "destructive",
      });
    },
  });

  // Send verification email
  const sendVerificationMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/send-verification");
    },
    onSuccess: () => {
      toast({
        title: "Verification Email Sent",
        description: "Please check your email for the verification link.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email.",
        variant: "destructive",
      });
    },
  });

  // Handle token verification on mount
  useEffect(() => {
    if (token && !isVerifying) {
      setIsVerifying(true);
      verifyEmailMutation.mutate(token);
    }
  }, [token]);

  // Redirect if already verified
  useEffect(() => {
    if (user && user.isEmailVerified) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "Please sign in to verify your email.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, user, toast]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.isEmailVerified) {
    return null; // Will redirect
  }

  // If verifying token
  if (token && isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            {verifyEmailMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Verifying Your Email
                </h2>
                <p className="text-slate-600">
                  Please wait while we verify your email address...
                </p>
              </>
            ) : verifyEmailMutation.isSuccess ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Email Verified!
                </h2>
                <p className="text-slate-600">
                  Your email has been successfully verified. Redirecting to your dashboard...
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Verification Failed
                </h2>
                <p className="text-slate-600 mb-6">
                  The verification link is invalid or has expired. Please request a new verification email.
                </p>
                <Button 
                  onClick={() => sendVerificationMutation.mutate()}
                  disabled={sendVerificationMutation.isPending}
                  className="w-full"
                >
                  {sendVerificationMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send New Verification Email'
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default verification page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <Mail className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-slate-600 mb-6">
            We've sent a verification link to <strong>{user.email}</strong>. 
            Please click the link in your email to verify your account and access your roadmap.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={() => sendVerificationMutation.mutate()}
              disabled={sendVerificationMutation.isPending}
              variant="outline"
              className="w-full"
            >
              {sendVerificationMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </Button>
            
            <div className="text-sm text-slate-500">
              <p>Didn't receive the email? Check your spam folder or click resend.</p>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = "/api/logout"}
              className="w-full text-slate-500"
            >
              Sign out and try different email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
