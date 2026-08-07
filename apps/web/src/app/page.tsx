import { redirect } from 'next/navigation';

export default function Home() {
  // Root page redirects to login
  // Once authenticated, the login page redirects to /dashboard
  redirect('/login');
}
