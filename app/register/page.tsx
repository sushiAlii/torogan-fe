"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { status, register, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setConfirmError(null);

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      return;
    }

    setPending(true);
    try {
      await register(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setPending(false);
    }
  }

  async function handleGoogleCredential(idToken: string) {
    setError(null);
    try {
      await signInWithGoogle(idToken);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in with Google",
      );
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Join to save listings and contact landlords directly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmError && (
                  <p className="text-sm text-destructive">{confirmError}</p>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Creating account…" : "Create account"}
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">
                or continue with
              </span>
              <Separator className="flex-1" />
            </div>

            <GoogleSignInButton
              onCredential={handleGoogleCredential}
              text="signup_with"
            />

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
