"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  type: "DESTINATION" | "HOTEL" | "PACKAGE" | "EXPERIENCE";
  itemId: string;
  className?: string;
  initialIsSaved?: boolean;
}

export function WishlistButton({
  type,
  itemId,
  className,
  initialIsSaved = false,
}: WishlistButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, itemId }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please sign in to manage your wishlist.");
          return;
        }
        throw new Error("Failed to update wishlist.");
      }

      const result = await res.json();
      const newIsSaved = result.data?.isSaved ?? false;
      setIsSaved(newIsSaved);

      if (newIsSaved) {
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={isLoading}
      aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/40 disabled:opacity-50",
        className
      )}
    >
      <Heart className={cn("h-4 w-4 transition-all", isSaved && "fill-red-500 text-red-500")} />
    </button>
  );
}
