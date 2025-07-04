import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import { LoginForm } from './_components/login-form';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default async function LoginPage() {
  const session = await auth();

  // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
  if (session?.user) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Connexion à votre compte
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choisissez votre méthode de connexion préférée
          </p>
        </div>

        <LoginForm />

        {/* Lien d'inscription */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Vous n'avez pas encore de compte ?{' '}
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"
            >
              <UserPlus className="h-4 w-4" />
              Créer un compte
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>
            En vous connectant, vous acceptez nos{' '}
            <a href="#" className="font-medium text-blue-600 hover:underline">
              conditions d'utilisation
            </a>{' '}
            et notre{' '}
            <a href="#" className="font-medium text-blue-600 hover:underline">
              politique de confidentialité
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
