import { auth, clerkClient } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const { userId } = auth();

  if (!userId) {
    redirect('/auth/sign-in');
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      orgId: user.publicMetadata?.orgId as string,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    redirect('/auth/sign-in');
  }
}

export async function requireAuth() {
  const { userId } = auth();
  if (!userId) {
    redirect('/auth/sign-in');
  }
  return userId;
}

export function isAdmin(user: any): boolean {
  return user?.publicMetadata?.role === 'admin';
}

export function isManager(user: any): boolean {
  return ['admin', 'manager'].includes(user?.publicMetadata?.role);
}
