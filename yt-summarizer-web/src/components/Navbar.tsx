"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full border-b bg-background sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-semibold">
            YT Summarizer
          </Link>
          <div className="hidden md:flex gap-4 items-center">
            {user && (
              <>
                <Link href="/dashboard" className="hover:underline">
                  Dashboard
                </Link>
                <Link href="/summary" className="hover:underline">
                  New Summary
                </Link>
              </>
            )}
            {user ? (
              <button
                onClick={logout}
                className="flex items-center gap-1 hover:underline"
              >
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <Link href="/login" className="hover:underline">
                Login
              </Link>
            )}
          </div>
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            <Menu />
          </button>
        </div>
        {open && (
          <div className="md:hidden flex flex-col gap-2 py-2">
            {user && (
              <>
                <Link href="/dashboard" className="hover:underline" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/summary" className="hover:underline" onClick={() => setOpen(false)}>
                  New Summary
                </Link>
              </>
            )}
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="flex items-center gap-1 hover:underline"
              >
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <Link href="/login" className="hover:underline" onClick={() => setOpen(false)}>
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}