"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.success("Welcome back!");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-24 lg:px-12 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="mb-10 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
              <MapPin className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-bold text-charcoal-950 dark:text-white">
              ZyroTrip
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-charcoal-950 dark:text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-charcoal-500 dark:text-stone-400">
              Sign in to continue your travel journey.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
                    ? "border-red-400 focus:border-red-500"
                    : "border-stone-200 focus:border-amber-500 dark:border-white/10"
                )}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-charcoal-700 dark:text-stone-300"
                >
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  className={cn(
                    "w-full rounded-xl border bg-white px-4 py-3 pr-12 text-sm text-charcoal-950 outline-none transition-colors placeholder:text-charcoal-400 dark:bg-charcoal-900 dark:text-white dark:placeholder:text-stone-500",
                    errors.password
                      ? "border-red-400 focus:border-red-500"
                      : "border-stone-200 focus:border-amber-500 dark:border-white/10"
                  )}
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-stone-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                id="rememberMe"
                type="checkbox"
                {...register("rememberMe")}
                className="h-4 w-4 rounded border-stone-300 accent-amber-500"
              />
              <label htmlFor="rememberMe" className="text-sm text-charcoal-600 dark:text-stone-400">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-charcoal-950 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-charcoal-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-charcoal-950 dark:hover:bg-stone-100"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-stone-200 dark:bg-white/10" />
            <span className="text-xs text-charcoal-400 dark:text-stone-500">or</span>
            <div className="h-px flex-1 bg-stone-200 dark:bg-white/10" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-charcoal-500 dark:text-stone-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-charcoal-950 underline underline-offset-4 hover:text-amber-600 dark:text-white dark:hover:text-amber-400"
            >
              Create one for free
            </Link>
          </p>
        </div>
      </div>

      {/* Right — Image */}
      <div className="relative hidden flex-1 lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/50 to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-xs">
          <p className="font-display text-2xl font-semibold italic text-white">
            "Travel is the only thing you can buy that makes you richer."
          </p>
          <p className="mt-3 text-sm text-white/70">— Anonymous</p>
        </div>
      </div>
    </div>
  );
}
