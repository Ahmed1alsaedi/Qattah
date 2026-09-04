'use client';

import { SyntheticEvent, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, LockKeyhole } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    if (response.ok) window.location.href = '/admin';
    else {
      const result = await response.json() as { error?: string };
      setError(result.error || 'تعذر تسجيل الدخول.');
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div aria-hidden="true" className="brand-glow brand-glow-one" />
      <Card className="relative w-full max-w-sm rounded-3xl py-7 shadow-[0_20px_70px_-35px_rgba(16,65,62,0.7)]">
        <CardHeader className="items-center gap-3 px-7 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><LockKeyhole className="size-7" /></div>
          <CardTitle className="text-2xl font-extrabold">دخول المسؤول</CardTitle>
          <CardDescription className="text-base">أدخل الرقم السري لعرض التحويلات.</CardDescription>
        </CardHeader>
        <CardContent className="px-7">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-bold">الرقم السري</Label>
              <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-13 rounded-2xl px-4 text-lg" />
            </div>
            {error && <Alert variant="destructive"><AlertCircle /><AlertDescription>{error}</AlertDescription></Alert>}
            <Button type="submit" disabled={!password || loading} className="h-13 w-full rounded-2xl text-base font-extrabold">{loading ? 'جاري الدخول...' : 'دخول'}</Button>
          </form>
          <Link href="/" className="mt-5 flex min-h-11 items-center justify-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"><ArrowRight className="size-4" />العودة لصفحة التحويل</Link>
        </CardContent>
      </Card>
    </main>
  );
}
