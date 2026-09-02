"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CalendarDays, Loader2, RefreshCw } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ar } from "@/lib/i18n";

export default function AdminRolloverPage() {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  async function runRollover() {
    if (!confirm("تتوجه كل الطلاب للسنة الدراسية التالية؟ هذا لا يمكن التراجع عنه.")) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/rollover", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "فشل الترحيل");
      setResult(data.advanced ?? 0);
      toast({ variant: "success", title: ar.admin.rolloverDone, description: `تم ترقية ${data.advanced ?? 0} طالب.` });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: (e as Error).message });
    } finally {
      setRunning(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <AdminNav />
      <h1 className="font-display text-2xl font-bold">{ar.admin.rolloverTitle}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{ar.admin.rolloverSubtitle}</p>

      <Card className="mt-6 max-w-2xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display font-bold">ترحيل نهاية السنة</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                يترقى كل طالب مستوى أكاديمي واحد — السنة الأولى → السنة الثانية → السنة الثالثة → السنة الرابعة → خريج. يتم تطبيق خدمة ترقية المرحلة (<span className="font-medium">GROWTH → PROFESSIONAL</span>) تلقائياً للطلاب الذين يدخلون سنتهم الثالثة.
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-3 text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>السنة الدراسية الحالية: <span className="font-medium">{new Date().getFullYear()}</span></span>
              </div>
              <Button className="mt-4" onClick={runRollover} disabled={running}>
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {running ? "جارٍ الترحيل..." : ar.admin.rolloverButton}
              </Button>
              {result !== null && (
                <p className="mt-3 text-sm font-medium text-emerald-600">✓ تم ترقية {result} طالب للمرحلة التالية.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
