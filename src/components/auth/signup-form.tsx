'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Loader2, User, Flag, ArrowLeft } from 'lucide-react';
import { getPhoneCodeFromCountryCode } from '@/lib/phone-countries';

// Étendre le type de retour de signIn pour inclure code
interface SignInResult {
  error?: string;
  code?: string;
  ok?: boolean;
  status?: number;
  url?: string | null;
}

interface Country {
  id: string;
  name: string;
  code: string;
  flag?: string | null;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  phoneCode: string;
  verificationMethod: 'email' | 'sms';
}

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'verification'>('form');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');

  // Données du formulaire
  const [signupData, setSignupData] = useState<SignupData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '',
    phoneCode: '',
    verificationMethod: 'sms',
  });

  // Récupérer les pays actifs
  const { data: countries, isLoading: countriesLoading } =
    api.auth.getActiveCountries.useQuery();

  const handleInputChange = (field: keyof SignupData, value: string) => {
    setSignupData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const formatPhoneNumber = (value: string, phoneCode: string) => {
    // Retirer tous les caractères non numériques
    const cleaned = value.replace(/\D/g, '');

    // Si un indicatif est sélectionné, formatter avec le code
    if (phoneCode && !value.startsWith(phoneCode)) {
      return phoneCode + cleaned;
    }

    return phoneCode + cleaned;
  };

  const handleCountryChange = (newCountryCode: string) => {
    const newPhoneCode = getPhoneCodeFromCountryCode(newCountryCode);

    if (!newPhoneCode) {
      console.error('Code téléphonique non trouvé pour le pays:', newCountryCode);
      return;
    }

    handleInputChange('countryCode', newCountryCode);
    handleInputChange('phoneCode', newPhoneCode);

    // Reformater le téléphone avec le nouvel indicatif
    if (signupData.phone) {
      // Retirer l'ancien indicatif s'il existe
      let phoneDigits = signupData.phone;
      if (signupData.phoneCode && phoneDigits.startsWith(signupData.phoneCode)) {
        phoneDigits = phoneDigits.slice(signupData.phoneCode.length);
      }
      phoneDigits = phoneDigits.replace(/\D/g, '');
      const formattedPhone = newPhoneCode + phoneDigits;
      handleInputChange('phone', formattedPhone);
    }
  };

  const handlePhoneChange = (value: string) => {
    if (signupData.phoneCode) {
      const formatted = formatPhoneNumber(value, signupData.phoneCode);
      handleInputChange('phone', formatted);
    } else {
      handleInputChange('phone', value);
    }
  };

  const validateForm = (): boolean => {
    const { firstName, lastName, email, phone, countryCode, phoneCode } = signupData;

    if (!firstName.trim() || !lastName.trim()) {
      setError('Le nom et prénom sont requis');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format d'email invalide");
      return false;
    }

    if (!countryCode || !phoneCode) {
      setError('Veuillez sélectionner un pays');
      return false;
    }

    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      setError('Format de téléphone invalide');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Utiliser le provider signup pour envoyer le code
      const result = (await signIn('signup', {
        ...signupData,
        action: 'send',
        redirect: false,
      })) as SignInResult;

      if (result?.error) {
        // Mapper les codes d'erreur
        let errorMessage = result.error;
        const specificCode = result.code;

        switch (specificCode) {
          case 'email_taken':
            errorMessage = 'Cette adresse email est déjà utilisée';
            break;
          case 'phone_taken':
            errorMessage = 'Ce numéro de téléphone est déjà utilisé';
            break;
          case 'invalid_country':
            errorMessage = 'Pays non supporté';
            break;
          case 'send_failed':
            errorMessage = "Erreur lors de l'envoi du code";
            break;
          default:
            errorMessage = "Erreur lors de l'inscription";
            break;
        }

        setError(errorMessage);
      } else {
        setStep('verification');
      }
    } catch (err) {
      console.error('Erreur inscription:', err);
      setError("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = (await signIn('signup', {
        ...signupData,
        code,
        action: 'verify',
        redirect: false,
      })) as SignInResult;

      if (result?.error) {
        let errorMessage = result.error;
        const specificCode = result.code;

        switch (specificCode) {
          case 'no_code_pending':
            errorMessage = "Aucun code en attente. Recommencez l'inscription.";
            setStep('form');
            break;
          case 'code_expired':
            errorMessage = "Code expiré. Recommencez l'inscription.";
            setStep('form');
            break;
          case 'code_already_used':
            errorMessage = "Code déjà utilisé. Recommencez l'inscription.";
            setStep('form');
            break;
          case 'invalid_code':
            errorMessage = 'Code invalide. Vérifiez et réessayez.';
            setCode('');
            break;
          case 'too_many_attempts':
            errorMessage = "Trop de tentatives. Recommencez l'inscription.";
            setStep('form');
            break;
          default:
            errorMessage = 'Erreur lors de la vérification';
            break;
        }

        setError(errorMessage);
      } else if (result?.ok) {
        // Inscription réussie, rediriger vers le formulaire de profil
        router.push('/profile/complete');
      } else {
        setError("Erreur lors de l'inscription");
      }
    } catch (err) {
      console.error('Erreur vérification:', err);
      setError('Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md">
      <div className="mb-6 flex items-center justify-center">
        {step === 'form' ? (
          <User className="h-12 w-12 text-blue-600" />
        ) : signupData.verificationMethod === 'email' ? (
          <Mail className="h-12 w-12 text-blue-600" />
        ) : (
          <Phone className="h-12 w-12 text-blue-600" />
        )}
      </div>

      <h2 className="mb-6 text-center text-2xl font-bold">
        {step === 'form' ? 'Créer un compte' : 'Vérification'}
      </h2>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {step === 'form' ? (
        <form onSubmit={handleSubmit}>
          {/* Nom et Prénom */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Prénom *
              </label>
              <input
                type="text"
                id="firstName"
                value={signupData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
                disabled={loading}
                autoComplete="given-name"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nom *
              </label>
              <input
                type="text"
                id="lastName"
                value={signupData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
                disabled={loading}
                autoComplete="family-name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Adresse email *
            </label>
            <input
              type="email"
              id="email"
              value={signupData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Sélecteur de pays */}
          <div className="mb-4">
            <label
              htmlFor="country"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Pays de résidence *
            </label>
            <select
              id="country"
              value={signupData.countryCode}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              disabled={loading || countriesLoading}
            >
              <option value="">Sélectionnez un pays</option>
              {countries?.map((country) => (
                <option key={country.id} value={country.code}>
                  {country.flag} {country.name} ({country.code})
                </option>
              ))}
            </select>
            {countriesLoading && (
              <p className="mt-1 text-sm text-gray-500">Chargement des pays...</p>
            )}
          </div>

          {/* Téléphone */}
          <div className="mb-4">
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Numéro de téléphone *
            </label>
            <input
              type="tel"
              id="phone"
              value={signupData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder={
                signupData.phoneCode
                  ? `${signupData.phoneCode}612345678`
                  : "Sélectionnez d'abord un pays"
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              disabled={loading || !signupData.phoneCode}
              autoComplete="tel"
              inputMode="tel"
            />
            <p className="mt-1 text-sm text-gray-600">
              {signupData.phoneCode
                ? `Format: ${signupData.phoneCode}XXXXXXXXX`
                : 'Sélectionnez un pays pour activer ce champ'}
            </p>
          </div>

          {/* Méthode de vérification */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Recevoir le code de vérification par :
            </label>
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => handleInputChange('verificationMethod', 'email')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  signupData.verificationMethod === 'email'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Mail className="h-4 w-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('verificationMethod', 'sms')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  signupData.verificationMethod === 'sms'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Phone className="h-4 w-4" />
                SMS
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || countriesLoading}
            className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              `Créer le compte et recevoir le code ${signupData.verificationMethod === 'email' ? 'par email' : 'par SMS'}`
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <div className="mb-2 text-center text-sm text-gray-600">
            Un code a été envoyé{' '}
            {signupData.verificationMethod === 'email'
              ? `à ${signupData.email}`
              : `par SMS au ${signupData.phone}`}
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
              {signupData.verificationMethod === 'email' ? 'par email' : 'par SMS'}
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
              'Créer mon compte'
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('form');
              setCode('');
              setError('');
            }}
            className="flex w-full items-center justify-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au formulaire
          </button>
        </form>
      )}
    </div>
  );
}
