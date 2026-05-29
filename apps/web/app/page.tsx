import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';

const HOME_BY_ROLE: Record<string, string> = {
  ADMIN: '/admin',
  SUPERVISOR: '/supervisor',
  PARTNER: '/partner',
};

export default async function Home() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  redirect(HOME_BY_ROLE[user.role] ?? '/login');
}
