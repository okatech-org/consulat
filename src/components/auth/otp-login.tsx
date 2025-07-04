'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Loader2 } from 'lucide-react';

// Étendre le type de retour de signIn pour inclure code
interface SignInResult {
  error?: string;
  code?: string;
  ok?: boolean;
  status?: number;
  url?: string | null;
}

// Note: La détection automatique est remplacée par un sélecteur manuel pour une meilleure UX

export function OtpLogin() {
  const router = useRouter();
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'identifier' | 'code'>('identifier');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = api.auth.sendVerificationCode.useMutation({
    onSuccess: () => {
      setStep('code');
      setError('');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const resendCode = api.auth.resendCode.useMutation({
    onSuccess: () => {
      setError('');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation selon le type sélectionné
    if (method === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        setError("Format d'email invalide");
        setLoading(false);
        return;
      }
    } else {
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(identifier)) {
        setError(
          'Format de téléphone invalide. Utilisez le format international (+33...)',
        );
        setLoading(false);
        return;
      }
    }

    try {
      await sendCode.mutateAsync({ identifier });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Utiliser le provider OTP unifié
      const result = (await signIn('otp', {
        identifier,
        code,
        action: 'verify',
        redirect: false,
      })) as SignInResult;

      if (result?.error) {
        // Mapper les codes d'erreur spécifiques vers des messages clairs
        let errorMessage = result.error;

        // Le code spécifique est dans result.code, pas result.error
        const specificCode = result.code;

        switch (specificCode) {
          case 'no_code_pending':
            errorMessage = "Aucun code en attente. Demandez d'abord un nouveau code.";
            // Ramener à l'étape précédente
            setStep('identifier');
            setCode('');
            break;
          case 'code_expired':
            errorMessage = 'Le code a expiré. Demandez un nouveau code.';
            // Ramener à l'étape précédente
            setStep('identifier');
            setCode('');
            break;
          case 'code_already_used':
            errorMessage = 'Ce code a déjà été utilisé. Demandez un nouveau code.';
            // Ramener à l'étape précédente
            setStep('identifier');
            setCode('');
            break;
          case 'invalid_code':
            errorMessage = 'Code invalide. Vérifiez et réessayez.';
            // Rester sur l'étape de saisie du code mais vider le champ
            setCode('');
            break;
          case 'too_many_attempts':
            errorMessage = 'Trop de tentatives. Demandez un nouveau code.';
            // Ramener à l'étape précédente
            setStep('identifier');
            setCode('');
            break;
          case 'invalid_identifier':
            errorMessage = "Format d'identifiant invalide.";
            setStep('identifier');
            setCode('');
            break;
          case 'Configuration':
          case 'CredentialsSignin':
          case undefined:
          case null:
            // Erreurs génériques ou absence de code spécifique
            errorMessage = 'Erreur de connexion. Veuillez réessayer.';
            break;
          default:
            // Code spécifique non reconnu - garder le message original ou un message générique
            errorMessage = `Erreur : ${specificCode}`;
            break;
        }

        setError(errorMessage);
      } else if (result?.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError('Erreur de connexion. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Erreur lors de la vérification:', err);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    const type = method === 'email' ? 'EMAIL' : 'SMS';
    await resendCode.mutateAsync({ identifier, type });
  };

  const formatPhoneNumber = (value: string) => {
    // Retirer tous les caractères non numériques sauf le +
    let cleaned = value.replace(/[^\d+]/g, '');
    // S'assurer que le numéro commence par +
    if (cleaned && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    return cleaned;
  };

  // Réinitialiser l'identifiant quand on change de méthode
  const handleMethodChange = (newMethod: 'email' | 'phone') => {
    setMethod(newMethod);
    setIdentifier('');
    setError('');
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md">
      <div className="mb-6 flex items-center justify-center">
        {method === 'email' ? (
          <Mail className="h-12 w-12 text-blue-600" />
        ) : (
          <Phone className="h-12 w-12 text-blue-600" />
        )}
      </div>

      <h2 className="mb-6 text-center text-2xl font-bold">
        {step === 'identifier' ? 'Connexion' : 'Vérification'}
      </h2>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {step === 'identifier' ? (
        <form onSubmit={handleSendCode}>
          {/* Sélecteur de méthode */}
          <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => handleMethodChange('email')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                method === 'email'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => handleMethodChange('phone')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                method === 'phone'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Phone className="h-4 w-4" />
              Téléphone
            </button>
          </div>

          <div className="mb-4">
            <label
              htmlFor="identifier"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              {method === 'email' ? 'Adresse email' : 'Numéro de téléphone'}
            </label>
            <input
              type={method === 'email' ? 'email' : 'tel'}
              id="identifier"
              value={identifier}
              onChange={(e) =>
                setIdentifier(
                  method === 'phone' ? formatPhoneNumber(e.target.value) : e.target.value,
                )
              }
              placeholder={method === 'email' ? 'votre@email.com' : '+33612345678'}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              disabled={loading}
              autoComplete={method === 'email' ? 'email' : 'tel'}
              inputMode={method === 'email' ? 'email' : 'tel'}
            />
            <p className="mt-1 text-sm text-gray-600">
              {method === 'email'
                ? 'Entrez votre adresse email'
                : 'Format international requis (ex: +33 pour la France)'}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || sendCode.isPending || !identifier}
            className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading || sendCode.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              `Recevoir le code ${method === 'email' ? 'par email' : 'par SMS'}`
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <div className="mb-2 text-center text-sm text-gray-600">
            Un code a été envoyé{' '}
            {method === 'email' ? `à ${identifier}` : `par SMS au ${identifier}`}
          </div>

          <div className="mb-4">
            <label
              htmlFor="code"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Code de vérification
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-center text-lg tracking-wider focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              disabled={loading}
              maxLength={6}
              autoComplete="one-time-code"
            />
            <p className="mt-1 text-sm text-gray-600">
              Entrez le code à 6 chiffres reçu{' '}
              {method === 'email' ? 'par email' : 'par SMS'}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mb-3 flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              'Vérifier'
            )}
          </button>

          <div className="flex justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep('identifier');
                setCode('');
                setError('');
              }}
              className="text-blue-600 hover:underline"
            >
              Changer d'identifiant
            </button>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCode.isPending}
              className="text-blue-600 hover:underline disabled:opacity-50"
            >
              {resendCode.isPending ? 'Envoi...' : 'Renvoyer le code'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
