'use client';

import { SyntheticEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, FileUp, ShieldCheck, WalletCards } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Member = { id: number; name: string };

export default function Home() {
  const [member, setMember] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [amount, setAmount] = useState(170);
  const [cycleLabel, setCycleLabel] = useState('سبتمبر 2026');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/site')
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<{ amount: number; cycleLabel: string; members: Member[] }>;
      })
      .then((data) => {
        setAmount(data.amount);
        setCycleLabel(data.cycleLabel);
        setMembers(data.members);
      })
      .catch(() => setMessage({ type: 'error', text: 'تعذر تحميل البيانات. حدّث الصفحة وحاول مرة أخرى.' }))
      .finally(() => setLoading(false));
  }, []);

  async function submitPayment(replace = false) {
    if (!member || !receipt) return;
    setSubmitting(true);
    setMessage(null);
    const form = new FormData();
    form.set('memberId', member);
    form.set('receipt', receipt);
    form.set('replace', String(replace));
    try {
      const response = await fetch('/api/payments', { method: 'POST', body: form });
      const result = await response.json() as { success?: boolean; duplicate?: boolean; error?: string };
      if (response.status === 409 && result.duplicate) {
        setDuplicateOpen(true);
        return;
      }
      if (!response.ok) throw new Error(result.error || 'تعذر حفظ التحويل.');
      setMessage({ type: 'success', text: 'تم استلام تحويلك بنجاح ✅' });
      setMember(null);
      setReceipt(null);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'تعذر حفظ التحويل.' });
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitPayment();
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 sm:py-10">
      <div aria-hidden="true" className="brand-glow brand-glow-one" />
      <div aria-hidden="true" className="brand-glow brand-glow-two" />

      <div className="relative mx-auto w-full max-w-lg">
        <header className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <WalletCards className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight">قطّة الاستراحة</p>
              <p className="text-sm text-muted-foreground">{cycleLabel}</p>
            </div>
          </div>
          <Link href="/admin" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition hover:bg-white/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30">
            <ShieldCheck className="size-4" aria-hidden="true" />
            المسؤول
          </Link>
        </header>

        <section className="mb-5 rounded-3xl bg-primary px-6 py-7 text-primary-foreground shadow-[0_24px_70px_-28px_rgba(16,65,62,0.8)]">
          <p className="mb-2 text-sm font-semibold text-white/70">المبلغ المطلوب لكل شخص</p>
          <div className="flex items-end gap-2">
            <strong className="text-5xl font-black leading-none tracking-tight">{amount}</strong>
            <span className="pb-1 text-xl font-bold text-white/85">ريال</span>
          </div>
        </section>

        <Card className="rounded-3xl bg-card/95 py-6 shadow-[0_18px_60px_-32px_rgba(16,65,62,0.45)] backdrop-blur">
          <CardHeader className="gap-2 px-6">
            <CardTitle className="text-xl font-extrabold">سجّل تحويلك</CardTitle>
            <CardDescription className="text-base leading-7">اختر اسمك وارفع صورة الإيصال، وبعدها اضغط تم التحويل.</CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2.5">
              <Label className="text-base font-bold" htmlFor="member-select">اسمك</Label>
              <Select value={member} onValueChange={setMember}>
                <SelectTrigger id="member-select" className="h-14 w-full rounded-2xl px-4 text-base" aria-label="اختر اسمك">
                  <SelectValue placeholder="اختر اسمك من القائمة" />
                </SelectTrigger>
                <SelectContent align="start" className="max-h-72 rounded-2xl">
                  {members.map((item) => <SelectItem key={item.id} value={String(item.id)} className="min-h-11 text-base">{item.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <Label className="text-base font-bold" htmlFor="receipt">إيصال التحويل</Label>
              <label htmlFor="receipt" className="group flex min-h-28 cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-border bg-secondary/55 p-4 transition hover:border-primary/50 hover:bg-secondary focus-within:ring-4 focus-within:ring-ring/25">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-card text-primary shadow-sm"><FileUp className="size-6" aria-hidden="true" /></span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-bold">{receipt ? receipt.name : 'اضغط لاختيار الإيصال'}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">صورة JPG أو PNG أو ملف PDF</span>
                </span>
                <Input id="receipt" type="file" accept="image/jpeg,image/png,application/pdf" className="sr-only" onChange={(event) => setReceipt(event.target.files?.[0] ?? null)} />
              </label>
            </div>

            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : ''}>
                {message.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
                <AlertTitle>{message.type === 'success' ? 'تم التسجيل' : 'حدث خطأ'}</AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading || submitting || !member || !receipt} className="h-14 w-full rounded-2xl text-lg font-extrabold shadow-lg shadow-primary/20">
              <CheckCircle2 className="size-5" aria-hidden="true" />
              {submitting ? 'جاري الحفظ...' : 'تم التحويل'}
            </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-5 text-center text-sm leading-6 text-muted-foreground">بيانات التحويل تظهر للمسؤول فقط.</p>
      </div>

      <AlertDialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <AlertDialogContent dir="rtl" className="rounded-2xl">
          <AlertDialogHeader className="text-right sm:text-right">
            <AlertDialogTitle className="text-lg font-extrabold">سبق تسجيل تحويل باسمك</AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-7">هل تريد استبدال الإيصال السابق بالإيصال الجديد؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">إلغاء</AlertDialogCancel>
            <AlertDialogAction className="h-11" onClick={() => void submitPayment(true)}>تحديث الإيصال</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
