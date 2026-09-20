"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z.string().optional(),
  preferredCurrency: z.string(),
  preferredLanguage: z.string(),
  newsletterOptIn: z.boolean()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      preferredCurrency: user.preferredCurrency || "USD",
      preferredLanguage: user.preferredLanguage || "en",
      newsletterOptIn: user.newsletterOptIn || false,
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      
      if (res.ok && json.success) {
        toast.success("Profile updated successfully");
        router.refresh();
      } else {
        toast.error(json.message || "Failed to update profile");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-charcoal-700 dark:text-stone-300">First Name</label>
          <input 
            {...register("firstName")}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-charcoal-700 dark:text-stone-300">Last Name</label>
          <input 
            {...register("lastName")}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-charcoal-700 dark:text-stone-300">Email Address</label>
          <input 
            value={user.email}
            disabled
            className="w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-500 cursor-not-allowed dark:border-white/10 dark:bg-white/5"
          />
          <p className="mt-1 text-xs text-stone-400">Contact support to change your email</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-charcoal-700 dark:text-stone-300">Phone Number</label>
          <input 
            {...register("phone")}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-charcoal-700 dark:text-stone-300">Preferred Currency</label>
          <select 
            {...register("preferredCurrency")}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="AUD">AUD ($)</option>
            <option value="CAD">CAD ($)</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-charcoal-700 dark:text-stone-300">Preferred Language</label>
          <select 
            {...register("preferredLanguage")}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>

      <div className="pt-4">
        <label className="flex items-center gap-3">
          <input 
            type="checkbox"
            {...register("newsletterOptIn")}
            className="h-5 w-5 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm font-medium text-charcoal-700 dark:text-stone-300">
            Receive travel inspiration and exclusive offers via email
          </span>
        </label>
      </div>

      <div className="flex justify-end pt-6 border-t border-stone-100 dark:border-white/10">
        <button 
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-charcoal-950 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-charcoal-800 disabled:opacity-70 dark:bg-white dark:text-charcoal-950 dark:hover:bg-stone-200"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}
