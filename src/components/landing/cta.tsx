"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AuroraBackground } from "@/components/motion/aurora-background";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/navbar";
import { ar } from "@/lib/i18n";

export function CTA() {
  return (
    <>
      <section className="relative overflow-hidden py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-10 text-center shadow-2xl shadow-indigo-600/30 sm:p-16">
              <AuroraBackground variant="light" />
              <div className="relative">
                <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {ar.cta.title}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
                  {ar.cta.subtitle}
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Button asChild size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
                    <Link href="/register">
                      {ar.cta.cta1} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                    <Link href="/jobs">{ar.cta.cta2}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <Footer />
    </>
  );
}
