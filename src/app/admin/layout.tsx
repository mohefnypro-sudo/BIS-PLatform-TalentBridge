import { Navbar } from "@/components/layout/navbar";
import { ar } from "@/lib/i18n";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
