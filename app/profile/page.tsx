"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConnectError } from "@connectrpc/connect";
import { Check, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { useGetMe } from "@/hooks/users/useGetMe";
import { useUpdateMe } from "@/hooks/users/useUpdateMe";

export default function ProfilePage() {
  const router = useRouter();
  const { status, user, updateUser } = useAuth();

  const { data: me, isLoading: loading } = useGetMe({
    enabled: status === "authenticated",
  });
  const updateMe = useUpdateMe();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [prevMe, setPrevMe] = useState(me);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seed the editable fields once `me` loads, without an effect (which would
  // cost an extra render): adjust state during render per React's guidance
  // at https://react.dev/learn/you-might-not-need-an-effect.
  if (me !== prevMe) {
    setPrevMe(me);
    if (me) {
      setName(me.name);
      setPhone(me.phone);
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/sign-in");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen">
        <SiteHeader />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    try {
      const updated = await updateMe.mutateAsync({ name, phone });
      updateUser(updated);
      setSaved(true);
    } catch (err) {
      setError(ConnectError.from(err).message);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Avatar size="lg">
            <AvatarImage src={user?.avatarUrl} alt={user?.email} />
            <AvatarFallback>
              {(name || user?.email || "").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Your profile
            </h1>
            <p className="mt-1 text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              className="size-6 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Contact details</CardTitle>
                <CardDescription>
                  Shown to renters once they sign in to view a listing you own.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </p>
                )}

                {saved && (
                  <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-foreground">
                    <Check className="size-4 text-primary" aria-hidden="true" />
                    Profile updated
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email ?? ""}
                    disabled
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+63 000 000 0000"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={updateMe.isPending}>
                    {updateMe.isPending ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </main>
    </div>
  );
}
