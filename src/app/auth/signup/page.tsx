import { SignupForm } from '@/components/auth/signup-form';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <SignupForm />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"
            >
              <LogIn className="h-4 w-4" />
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
