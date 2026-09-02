import type { Metadata } from "next";
import { AuroraBackground } from "@/components/motion/aurora-background";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <AuroraBackground className="fixed" />
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <Logo />
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-12">
        {children}
      </main>
    </div>
  );
}
