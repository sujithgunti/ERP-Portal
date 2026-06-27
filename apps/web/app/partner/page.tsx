import { redirect } from 'next/navigation';

// Partners use the shared shell (filtered tabs). Legacy route → shell.
export default function PartnerPage() {
  redirect('/admin');
}
