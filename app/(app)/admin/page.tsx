import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminPageClient from './AdminPageClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  return <AdminPageClient />;
}
