import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
      <div className="min-h-screen flex flex-col bg-[#000] text-white">
        <header className="h-16 flex items-center px-4 border-b border-neutral-800">
          AutoReels.AI
        </header>
        <main className="flex-1 w-full max-w-3xl mx-auto px-4">{children}</main>
        <footer className="h-14 flex items-center justify-center border-t border-neutral-800 text-xs">
          © 2025 AutoReels Inc.
        </footer>
      </div>
    );
  }
  