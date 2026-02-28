import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">ShieldDesk</h1>
          <p className="text-slate-300">Start Your Security Journey</p>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">
          <SignUp
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent shadow-none',
              },
            }}
            redirectUrl="/onboarding"
          />
        </div>
      </div>
    </div>
  );
}
