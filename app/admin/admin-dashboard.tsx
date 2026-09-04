'use client';

import { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Eye, LogOut, Plus, RotateCcw, Settings2, Trash2, UsersRound, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Member = { id: number; name: string; paymentId: number | null; receiptType: string | null; submittedAt: string | null };
type Dashboard = { amount: number; cycleLabel: string; paidCount: number; unpaidCount: number; members: Member[] };

export default function AdminDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [deleteMember, setDeleteMember] = useState<Member | null>(null);
  const [newCycleOpen, setNewCycleOpen] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/dashboard');
    if (response.status === 401) { window.location.href = '/admin/login'; return; }
    if (!response.ok) { setError('تعذر تحميل لوحة المسؤول.'); return; }
    const result = await response.json() as Dashboard;
    setData(result);
    setAmount(String(result.amount));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function mutate(url: string, method: string, body?: object) {
    setBusy(true);
    setError('');
    const response = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
    const result = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) setError(result.error || 'تعذر تنفيذ العملية.');
    else await load();
    setBusy(false);
    return response.ok;
  }

  async function addMember(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await mutate('/api/admin/members', 'POST', { name })) { setName(''); setAddOpen(false); }
  }

  async function saveAmount(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    await mutate('/api/admin/settings', 'PATCH', { amount: Number(amount) });
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  if (!data) return <main className="flex min-h-screen items-center justify-center p-6"><p className="text-base font-bold text-muted-foreground">جاري تحميل البيانات...</p></main>;

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div><p className="text-sm font-bold text-primary">لوحة المسؤول</p><h1 className="text-2xl font-black">قطّة {data.cycleLabel}</h1></div>
          <Button variant="outline" className="h-11 rounded-xl" onClick={logout}><LogOut />خروج</Button>
        </header>

        {error && <Alert variant="destructive" className="mb-5"><AlertDescription>{error}</AlertDescription></Alert>}

        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="المبلغ" value={`${data.amount} ر.س`} tone="neutral" />
          <Stat label="الأعضاء" value={String(data.members.length)} tone="neutral" />
          <Stat label="حوّلوا" value={String(data.paidCount)} tone="success" />
          <Stat label="لم يحولوا" value={String(data.unpaidCount)} tone="danger" />
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <Card className="rounded-3xl py-5">
            <CardHeader className="flex-row items-center justify-between px-5">
              <CardTitle className="flex items-center gap-2 text-lg font-extrabold"><UsersRound className="size-5 text-primary" />حالة الأعضاء</CardTitle>
              <Button className="h-10 rounded-xl" onClick={() => setAddOpen(true)}><Plus />إضافة عضو</Button>
            </CardHeader>
            <CardContent className="space-y-2 px-3 sm:px-5">
              {data.members.map((member) => (
                <div key={member.id} className="flex min-h-16 items-center gap-3 rounded-2xl border bg-background/45 px-3 py-2">
                  {member.paymentId ? <CheckCircle2 className="size-6 shrink-0 text-emerald-600" /> : <XCircle className="size-6 shrink-0 text-red-500" />}
                  <div className="min-w-0 flex-1"><p className="truncate text-base font-bold">{member.name}</p><p className={`text-sm font-semibold ${member.paymentId ? 'text-emerald-700' : 'text-red-600'}`}>{member.paymentId ? 'تم التحويل' : 'لم يحول'}</p></div>
                  {member.paymentId && <Button variant="outline" size="sm" className="h-9 rounded-xl" onClick={() => window.open(`/api/admin/receipts/${member.paymentId}`, '_blank')}><Eye />عرض</Button>}
                  <Button aria-label={`حذف ${member.name}`} variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => setDeleteMember(member)}><Trash2 /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <aside className="space-y-4">
            <Card className="rounded-3xl py-5">
              <CardHeader className="px-5"><CardTitle className="flex items-center gap-2 text-lg font-extrabold"><Settings2 className="size-5 text-primary" />إعدادات القطّة</CardTitle></CardHeader>
              <CardContent className="space-y-5 px-5">
                <form className="space-y-3" onSubmit={saveAmount}>
                  <Label htmlFor="amount" className="text-base font-bold">المبلغ لكل شخص</Label>
                  <div className="flex gap-2"><Input id="amount" type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} className="h-11 rounded-xl" /><Button type="submit" disabled={busy} className="h-11 rounded-xl">حفظ</Button></div>
                </form>
                <div className="border-t pt-5">
                  <Button variant="outline" disabled={busy} className="h-12 w-full rounded-xl border-primary/30 font-bold text-primary" onClick={() => setNewCycleOpen(true)}><RotateCcw />بدء قطّة جديدة</Button>
                </div>
              </CardContent>
            </Card>
            <Link href="/" className="flex min-h-12 items-center justify-center rounded-2xl border bg-card text-sm font-bold text-muted-foreground hover:text-primary">فتح صفحة التحويل</Link>
          </aside>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent dir="rtl" className="rounded-2xl">
          <form onSubmit={addMember}>
            <DialogHeader><DialogTitle className="text-xl font-extrabold">إضافة عضو</DialogTitle><DialogDescription className="text-base">اكتب اسم العضو ثم اضغط حفظ.</DialogDescription></DialogHeader>
            <div className="py-5"><Label htmlFor="name" className="sr-only">اسم العضو</Label><Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="اسم العضو" className="h-12 rounded-xl text-base" /></div>
            <DialogFooter><Button type="submit" disabled={busy || !name.trim()} className="h-11">حفظ</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteMember)} onOpenChange={(open) => !open && setDeleteMember(null)}>
        <AlertDialogContent dir="rtl"><AlertDialogHeader className="text-right sm:text-right"><AlertDialogTitle>حذف العضو</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف {deleteMember?.name}؟</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { if (deleteMember) void mutate(`/api/admin/members/${deleteMember.id}`, 'DELETE').then(() => setDeleteMember(null)); }}>حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={newCycleOpen} onOpenChange={setNewCycleOpen}>
        <AlertDialogContent dir="rtl"><AlertDialogHeader className="text-right sm:text-right"><AlertDialogTitle>بدء قطّة جديدة</AlertDialogTitle><AlertDialogDescription>سيتم تصفير حالات التحويل للجميع، وستبقى الأسماء والمبلغ محفوظين.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => void mutate('/api/admin/new-cycle', 'POST').then(() => setNewCycleOpen(false))}>ابدأ القطّة الجديدة</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'neutral' | 'success' | 'danger' }) {
  const color = tone === 'success' ? 'text-emerald-700' : tone === 'danger' ? 'text-red-600' : 'text-foreground';
  return <Card className="gap-1 rounded-2xl px-4 py-4"><span className="text-sm font-semibold text-muted-foreground">{label}</span><strong className={`text-2xl font-black ${color}`}>{value}</strong></Card>;
}
