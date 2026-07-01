import { redirect } from 'next/navigation';

// Supervisors use the shared shell (filtered tabs). Legacy route → shell.
export default function SupervisorPage() {
  redirect('/admin');
}
