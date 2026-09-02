import { Navbar, Footer } from "@/components/layout/navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] pt-16">{children}</main>
      <Footer />
    </>
  );
}
