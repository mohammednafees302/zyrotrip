"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })} className={className}>
      {children}
    </button>
  );
}
