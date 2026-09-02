import type { Metadata } from "next";
import { Inter, Space_Grotesk, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-ar",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "TalentBridge — منصة المواهب الجامعية",
    template: "%s · TalentBridge",
  },
  description:
    "المنصة الموحدة التي تربط الطلاب ومشاريع التخرج والأكاديميين وشركات التوظيف — المحافظ والتدريب والوظائف في مكان واحد.",
  keywords: ["جامعة", "مشاريع تخرج", "إرشاد", "وظائف", "تدريب", "محفظة"],
  openGraph: {
    title: "TalentBridge",
    description: "منصة المواهب الجامعية ومشاريع التخرج وتطوير الملفات الشخصية",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={cn(inter.variable, spaceGrotesk.variable, notoArabic.variable, "font-sans font-[var(--font-ar)]")}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
