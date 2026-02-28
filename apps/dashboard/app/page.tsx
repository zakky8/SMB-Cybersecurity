import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs';

export default function Home() {
  const { userId } = auth();
  
  if (userId) {
    redirect('/dashboard');
  }
  
  redirect('/auth/sign-in');
}
