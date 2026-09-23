"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, MapPin, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms of service",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const passwordStrength = (password: string): { level: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-400" };
  if (score === 2) return { level: 2, label: "Fair", color: "bg-amber-400" };
  if (score === 3) return { level: 3, label: "Good", color: "bg-green-400" };
  return { level: 4, label: "Strong", color: "bg-green-500" };
};

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agreeToTerms: false },
  });

  const strength = password ? passwordStrength(password) : null;

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        }),
      });

      const json = await res.json() as { success: boolean; message?: string };

      if (!res.ok || !json.success) {
        toast.error(json.message ?? "Registration failed. Please try again.");
        return;
      }

      toast.success("Account created! Please check your email to verify.");
      router.push("/auth/login");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Image */}
      <div className="relative hidden flex-1 lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-charcoal-950/40 to-transparent" />
        <div className="absolute top-12 left-12">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
              <MapPin className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-bold text-white">ZyroTrip</span>
          </Link>
        </div>
        <div className="absolute bottom-12 left-12 max-w-xs">
          <div className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
            <div>
              <p className="font-medium text-white">Join 500,000+ travelers</p>
              <p className="mt-1 text-sm text-white/70">
                Create your free account and start planning extraordinary journeys.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-24 lg:px-12 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
                <MapPin className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-xl font-bold text-charcoal-950 dark:text-white">
                ZyroTrip
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-charcoal-950 dark:text-white">
              Create your account
            </h1>
            <p className="mt-2 text-charcoal-500 dark:text-stone-400">
              Start planning extraordinary journeys for free.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1.5 block text-sm font-medium text-charcoal-700 dark:text-stone-300"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  {...register("firstName")}
                  className={cn(
                    "w-full rounded-xl border bg-white px-4 py-3 text-sm text-charcoal-950 outline-none transition-colors placeholder:text-charcoal-400 dark:bg-charcoal-900 dark:text-white",
                    errors.firstName
                      ? "border-red-400"
                      : "border-stone-200 focus:border-amber-500 dark:border-white/10"
                  )}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1.5 block text-sm font-medium text-charcoal-700 dark:text-stone-300"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  {...register("lastName")}
                  className={cn(
                    "w-full rounded-xl border bg-white px-4 py-3 text-sm text-charcoal-950 outline-none transition-colors placeholder:text-charcoal-400 dark:bg-charcoal-900 dark:text-white",
                    errors.lastName
                      ? "border-red-400"
                      : "border-stone-200 focus:border-amber-500 dark:border-white/10"
                  )}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-charcoal-700 dark:text-stone-300"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className={cn(
                  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-charcoal-950 outline-none transition-colors placeholder:text-charcoal-400 dark:bg-charcoal-900 dark:text-white dark:placeholder:text-stone-500",
                  errors.email
                    ? "border-red-400"
                    : "border-stone-200 focus:border-amber-500 dark:border-white/10"
                )}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-charcoal-700 dark:text-stone-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("password", {
                    onChange: (e) => setPassword((e.target as HTMLInputElement).value),
                  })}
                  className={cn(
                    "w-full rounded-xl border bg-white px-4 py-3 pr-12 text-sm text-charcoal-950 outline-none transition-colors placeholder:text-charcoal-400 dark:bg-charcoal-900 dark:text-white dark:placeholder:text-stone-500",
                    errors.password
                      ? "border-red-400"
                      : "border-stone-200 focus:border-amber-500 dark:border-white/10"
                  )}
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Strength indicator */}
              {strength && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all",
                          i < strength.level ? strength.color : "bg-stone-200 dark:bg-white/10"
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-charcoal-400">
                    Password strength: <span className="font-medium">{strength.label}</span>
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-charcoal-700 dark:text-stone-300"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={cn(
                  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-charcoal-950 outline-none transition-colors placeholder:text-charcoal-400 dark:bg-charcoal-900 dark:text-white dark:placeholder:text-stone-500",
                  errors.confirmPassword
                    ? "border-red-400"
                    : "border-stone-200 focus:border-amber-500 dark:border-white/10"
                )}
                placeholder="Repeat your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                id="agreeToTerms"
                type="checkbox"
                {...register("agreeToTerms")}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 accent-amber-500"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-charcoal-600 dark:text-stone-400">
                I agree to the{" "}
                <Link href="/terms" className="text-amber-600 underline hover:text-amber-700 dark:text-amber-400">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-amber-600 underline hover:text-amber-700 dark:text-amber-400">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-xs text-red-500">{errors.agreeToTerms.message}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-charcoal-950 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-charcoal-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-950 focus-visible:ring-offset-2 active:bg-charcoal-900 active:text-white active:scale-[0.98] disabled:opacity-60 dark:bg-white dark:!text-[#141310] dark:hover:bg-stone-100 dark:hover:!text-[#141310] dark:focus-visible:!ring-white dark:active:bg-stone-200"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-charcoal-500 dark:text-stone-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-charcoal-950 underline underline-offset-4 hover:text-amber-600 dark:text-white"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
