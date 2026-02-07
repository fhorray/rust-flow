"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Terminal, Github } from "lucide-react";
import { toast } from "sonner";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard", // Redirect to dashboard after login
      });
    } catch (error) {
      toast.error("Failed to connect to GitHub");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      <div className="absolute w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />

      <Card className="w-full max-w-md bg-black/40 border-white/10 backdrop-blur-xl">
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded bg-primary flex items-center justify-center mb-4">
            <Terminal className="w-5 h-5 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Access Terminal</CardTitle>
          <CardDescription className="text-xs font-mono uppercase tracking-widest">
            Authenticate via GitHub to access your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full font-black uppercase tracking-widest h-12"
            variant="outline"
            onClick={handleGitHubSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Github className="mr-2 h-4 w-4" />
            )}
            Sign in with GitHub
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-[10px] text-muted-foreground text-center max-w-xs mx-auto leading-relaxed">
            By connecting, you agree to our Terms of Service. Progy uses GitHub for identity verification only.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
