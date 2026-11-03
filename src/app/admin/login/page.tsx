"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import logo from "@/assets/logo.svg";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Demo login helper is only shown in local development, never in production builds.
const SHOW_DEMO = process.env.NODE_ENV === "development";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  function fillDemoCreds() {
    if (!SHOW_DEMO) return;
    setEmail("admin@rotex.com");
    setPassword("changeme123");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(255,154,0,0.14) 0%, rgba(239,62,35,0.07) 35%, transparent 70%)",
        }}
      />

      <Card size="sm" className="relative w-full max-w-95 p-8 shadow-2xl">
        <CardHeader className="mb-2 flex flex-col items-center gap-4 px-0 text-center">
          <Image src={logo} alt="Rotex" className="h-8 w-auto brightness-0 invert" priority />
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">Admin Sign In</h1>
            <p className="text-sm text-muted-foreground">Manage products, industries &amp; content</p>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@rotex.com"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="h-10 w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            {SHOW_DEMO && (
              <>
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <Button type="button" variant="outline" onClick={fillDemoCreds} className="h-10 w-full">
                  Use demo credentials
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
