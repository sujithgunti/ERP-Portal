import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function Home() {
  const session = await auth();
  if (!session) redirect('/login');

  switch (session.user.role) {
    case 'ADMIN':
      redirect('/admin');
    case 'SUPERVISOR':
      redirect('/supervisor');
    case 'PARTNER':
      redirect('/partner');
    default:
      redirect('/login');
  }
}
