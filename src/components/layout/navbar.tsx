"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Compass,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Rocket,
  Sun,
  User,
  X,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/layout/notification-bell";
import { useTheme } from "next-themes";
import { cn, initials } from "@/lib/utils";
import { ar } from "@/lib/i18n";

const NAV_LINKS = [
  { href: "/projects", label: ar.nav.projects, icon: Rocket },
  { href: "/mentors", label: ar.nav.mentors, icon: Compass },
  { href: "/jobs", label: ar.nav.careers, icon: GraduationCap },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user;

  function handleSignOut() {
    signOut({ callbackUrl: "/" });
  }

  const nav = NAV_LINKS.map((link) => {
    const active = pathname === link.href || pathname.startsWith(link.href + "/");
    return (
      <Link
        key={link.href}
        href={link.href}
        className={cn(
          "relative text-sm font-medium transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {active && (
          <motion.span
            layoutId="nav-underline"
            className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
          />
        )}
        {link.label}
      </Link>
    );
  });

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <div className="hidden items-center gap-6 md:flex">{nav}</div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-1 ring-border/60 transition-shadow hover:ring-primary/50 focus:outline-none">
                    <Avatar className="h-9 w-9">
                      {user.image ? <AvatarImage src={user.image} alt={user.name ?? ""} /> : null}
                      <AvatarFallback>{initials(user.name ?? "U")}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="text-sm font-semibold">{user.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <LayoutDashboard className="text-muted-foreground" /> {ar.nav.dashboard}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard?tab=portfolio")}>
                    <User className="text-muted-foreground" /> {ar.nav.myPortfolio}
                  </DropdownMenuItem>
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                      <LayoutDashboard className="text-muted-foreground" /> {ar.nav.adminPanel}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut /> {ar.nav.signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{ar.nav.signIn}</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/register">{ar.nav.getStarted}</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/50 bg-background md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <link.icon className="h-4 w-4 text-muted-foreground" />
                  {link.label}
                </Link>
              ))}
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                  {ar.nav.dashboard}
                </Link>
              ) : (
                <Button asChild className="mt-2">
                  <Link href="/register">{ar.nav.getStarted}</Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo size="sm" />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {ar.footer.description}
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold">{ar.footer.platform}</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link className="hover:text-foreground" href="/projects">{ar.footer.projects}</Link></li>
              <li><Link className="hover:text-foreground" href="/mentors">{ar.footer.mentorship}</Link></li>
              <li><Link className="hover:text-foreground" href="/jobs">{ar.footer.careers}</Link></li>
              <li><Link className="hover:text-foreground" href="/dashboard">{ar.nav.dashboard}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold">{ar.footer.forStudents}</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link className="hover:text-foreground" href="/register">{ar.footer.buildPortfolio}</Link></li>
              <li><Link className="hover:text-foreground" href="/mentors">{ar.footer.bookMentor}</Link></li>
              <li><Link className="hover:text-foreground" href="/jobs">{ar.footer.applyRoles}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold">{ar.footer.forRecruiters}</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link className="hover:text-foreground" href="/register?role=RECRUITER">{ar.footer.postRole}</Link></li>
              <li><Link className="hover:text-foreground" href="/projects">{ar.footer.discoverTalent}</Link></li>
              <li><Link className="hover:text-foreground" href="/register?role=MENTOR">{ar.footer.becomeMentor}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} TalentBridge. مبني للجامعات.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Bell className="h-3.5 w-3.5" /> {ar.footer.notifications}</span>
            <span className="flex items-center gap-1.5"><Compass className="h-3.5 w-3.5" /> {ar.footer.mentorship}</span>
            <span className="flex items-center gap-1.5"><Rocket className="h-3.5 w-3.5" /> {ar.footer.careers}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
