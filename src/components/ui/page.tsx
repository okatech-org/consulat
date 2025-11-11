import Link from 'next/link';
import Image from 'next/image';
import { buttonVariants } from '@/components/ui/button';
import { ArrowRight, Check, Lock, Users, MessageSquare, Shield } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { AnimatedSection } from '@/components/ui/animated-section';
import { GlobalAnimations } from '@/components/ui/global-animations';
import { Button } from '@/components/ui/button';
import { MobileSectionCarousel } from './mobile-section-carousel';

// Fonction utilitaire pour extraire l'ID YouTube d'une URL
function getYoutubeEmbedUrl(url: string) {
  // Patterns de différentes URL YouTube (standard, abrégée, etc.)
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  // Si aucun pattern ne correspond, renvoyer l'URL telle quelle
  return url;
}

export default async function LandingPage() {
  // Utilisation de getTranslations pour les composants serveur
  const t = await getTranslations('home');
  const l = await getTranslations('home.landing');

  // URL de la vidéo YouTube - à modifier ici pour changer la vidéo
  const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const embedUrl = getYoutubeEmbedUrl(youtubeUrl);

  // URLs des vidéos YouTube pour chaque section de fonctionnalités
  const videoParticipation = getYoutubeEmbedUrl(
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  );
  const videoDigital = getYoutubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const videoTracking = getYoutubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  return (
    <div className="flex flex-col bg-[#f2f2f2] dark:bg-[#131313] text-neutral-900 dark:text-white antialiased w-full home-container">
      {/* Composant client pour les animations globales */}
      <GlobalAnimations />

      {/* Hero Section with premium design */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#ffffff] to-[#f2f2f2] dark:from-[#131313] dark:to-[#242424] pt-16 pb-14 sm:pt-20 sm:pb-16 md:pt-24 md:pb-20 w-full home-hero">
        {/* Backgroundgrid simplifié avec plus de contraste */}
        <div className="absolute inset-0 bg-grid-pattern bg-[length:32px_32px] opacity-[0.08] dark:opacity-[0.1] home-grid-pattern"></div>

        {/* Formes de fond avec plus de contraste */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-b from-blue-300/20 to-indigo-300/20 blur-3xl dark:from-blue-700/20 dark:to-indigo-700/20"></div>
          <div className="absolute -bottom-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-b from-purple-300/20 to-indigo-300/20 blur-3xl dark:from-purple-700/20 dark:to-indigo-700/20"></div>
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <AnimatedSection animation="fade-right" className="max-w-3xl">
              <h1 className="mb-6 font-bold tracking-tight flex flex-col">
                <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-[#FEAA37] to-[#FEAA37] bg-clip-text text-transparent drop-shadow-sm">
                  CONSULAT.GA
                </span>
                <span className="text-[calc(1rem*0.83*1.1)] sm:text-[calc(1.25rem*0.83*1.1)] md:text-[calc(1.5rem*0.83*1.1)] lg:text-[calc(1.875rem*0.83*1.1)] bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm dark:from-blue-400 dark:to-indigo-400 mt-2">
                  Votre Lien Numérique avec le Gabon
                </span>
              </h1>
              <p className="mb-8 text-lg sm:text-xl leading-relaxed text-gray-800 dark:text-gray-200 home-subtitle">
                {l('hero.subtitle')}
              </p>

              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    size: 'lg',
                    className:
                      'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white home-button-primary',
                  })}
                >
                  {l('hero.citizen_space')}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="#features"
                  className={buttonVariants({
                    size: 'lg',
                    variant: 'outline',
                    className:
                      'border-blue-300 bg-white hover:bg-gray-50 text-blue-700 dark:border-blue-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-blue-400 home-button-secondary',
                  })}
                >
                  {l('hero.government_space')}
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              <div className="mt-8 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Lock className="size-4" />
                <span>Sécurisé et conforme aux normes de protection des données</span>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-left" className="flex justify-center">
              <div>
                <div>
                  <h3 className="text-xl font-bold text-blue-700 dark:text-blue-500 mb-4">
                    Consulat Digital
                  </h3>

                  {/* Intégration vidéo YouTube */}
                  <div className="aspect-[16/9] w-full overflow-hidden rounded-lg">
                    <iframe
                      className="w-full h-full"
                      src={embedUrl}
                      title="Consulat Digital - Présentation"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p className="mt-4 text-sm text-gray-800 dark:text-gray-200 text-center home-text">
                    Découvrez notre plateforme consulaire moderne et sécurisée pour tous
                    vos services administratifs.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features Section with subtle gradient - Transformé en carousel sur mobile */}
      <MobileSectionCarousel
        title="Avantages et Fonctionnalités"
        subtitle="Découvrez les fonctionnalités qui font de Consulat.ga la plateforme idéale pour vos démarches consulaires."
        badgeText="Avantages et Fonctionnalités"
        bgClassName="bg-gradient-to-b from-[#ffffff] to-[#f0f0f0] dark:from-[#242424] dark:to-[#2F2F2F] home-features"
      >
        {/* Card 1 - Participation */}
        <div className="group h-full transform transition-all duration-700 hover:translate-y-[-8px]">
          {/* Intégration vidéo YouTube - Section Participation */}
          <div className="mb-4 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/10">
            <iframe
              className="w-full h-full"
              src={videoParticipation}
              title="Participation Citoyenne"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <h3 className="mb-2 text-xl font-bold home-title">Participation Citoyenne</h3>
          <p className="text-gray-700 dark:text-gray-300 home-text text-sm sm:text-base break-words">
            Forums et groupes d'échange entre citoyens gabonais.
          </p>
        </div>

        {/* Card 2 - Digitalisation */}
        <div className="group h-full transform transition-all duration-700 hover:translate-y-[-8px]">
          {/* Intégration vidéo YouTube - Section Digital */}
          <div className="mb-4 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/10">
            <iframe
              className="w-full h-full"
              src={videoDigital}
              title="Digitalisation des Services"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <h3 className="mb-2 text-xl font-bold home-title">Digitalisation Complète</h3>
          <p className="text-gray-700 dark:text-gray-300 home-text text-sm sm:text-base break-words">
            Services administratifs en ligne sur smartphone.
          </p>
        </div>

        {/* Card 3 - Tracking */}
        <div className="group h-full transform transition-all duration-700 hover:translate-y-[-8px]">
          {/* Intégration vidéo YouTube - Section Tracking */}
          <div className="mb-4 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg shadow-purple-500/10">
            <iframe
              className="w-full h-full"
              src={videoTracking}
              title="Suivi en Temps Réel"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <h3 className="mb-2 text-xl font-bold home-title">Suivi en Temps Réel</h3>
          <p className="text-gray-700 dark:text-gray-300 home-text text-sm sm:text-base break-words">
            Suivi instantané de vos demandes consulaires.
          </p>
        </div>
      </MobileSectionCarousel>

      {/* Main Features Section - Transformé en carousel sur mobile */}
      <MobileSectionCarousel
        title="Services Consulaires Dématérialisés"
        subtitle="Tous vos services consulaires accessibles en quelques clics, sans file d'attente ni déplacement."
        badgeText="Services"
        bgClassName="bg-gradient-to-b from-[#f9fafc] to-[#f4f5f9] dark:from-[#242424] dark:to-[#131313] relative overflow-hidden"
      >
        {/* Service Card 1 */}
        <div className="relative flex flex-col h-full p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 transition-all duration-300 home-card">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Users className="h-6 w-6 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="mb-2 text-xl font-bold home-title">Identité et État Civil</h3>
          <p className="mb-4 text-gray-700 dark:text-gray-300 home-text text-sm sm:text-base break-words">
            Documents d&apos;identité en quelques clics.
          </p>
          <ul className="mb-6 space-y-2 flex-1">
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              <span className="text-sm">Passeports biométriques</span>
            </li>
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              <span className="text-sm">Cartes consulaires</span>
            </li>
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              <span className="text-sm">Actes de naissance</span>
            </li>
          </ul>
          <Link
            href="/dashboard/identity"
            className="mt-auto inline-flex items-center justify-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
          >
            En savoir plus
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {/* Service Card 2 */}
        <div className="relative flex flex-col h-full p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 transition-all duration-300 home-card">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            <MessageSquare className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h3 className="mb-2 text-xl font-bold home-title">Assistance Consulaire</h3>
          <p className="mb-4 text-gray-700 dark:text-gray-300 home-text text-sm sm:text-base break-words">
            Assistance consulaire immédiate.
          </p>
          <ul className="mb-6 space-y-2 flex-1">
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              <span className="text-sm">Assistance juridique</span>
            </li>
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              <span className="text-sm">Aide d&apos;urgence</span>
            </li>
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              <span className="text-sm">Conseils aux voyageurs</span>
            </li>
          </ul>
          <Link
            href="/dashboard/assistance"
            className="mt-auto inline-flex items-center justify-center rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
          >
            En savoir plus
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {/* Service Card 3 */}
        <div className="relative flex flex-col h-full p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 transition-all duration-300 home-card">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
            <Shield className="h-6 w-6 text-purple-500 dark:text-purple-400" />
          </div>
          <h3 className="mb-2 text-xl font-bold home-title">Protection des Citoyens</h3>
          <p className="mb-4 text-gray-700 dark:text-gray-300 home-text text-sm sm:text-base break-words">
            Protection garantie à l&apos;étranger.
          </p>
          <ul className="mb-6 space-y-2 flex-1">
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              <span className="text-sm">Signalement des incidents</span>
            </li>
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              <span className="text-sm">Protection consulaire</span>
            </li>
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              <span className="text-sm">Suivi des situations de crise</span>
            </li>
          </ul>
          <Link
            href="/dashboard/protection"
            className="mt-auto inline-flex items-center justify-center rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 transition-colors"
          >
            En savoir plus
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </MobileSectionCarousel>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-b from-[#f9fafc] to-[#f4f5f9] dark:from-[#131313] dark:to-[#242424] py-14 sm:py-16 md:py-20 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-[#131313] dark:to-[#242424] p-6 sm:p-10 md:p-12 lg:p-16">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-gradient-to-br from-blue-200/20 to-indigo-200/20 blur-3xl dark:from-blue-600/10 dark:to-indigo-600/10"></div>
              <div className="absolute left-0 bottom-0 h-[300px] w-[300px] -translate-x-1/4 translate-y-1/4 rounded-full bg-gradient-to-br from-blue-200/20 to-indigo-200/20 blur-3xl dark:from-blue-600/10 dark:to-indigo-600/10"></div>
              <div className="absolute right-0 bottom-0 h-[400px] w-[400px] translate-x-1/3 translate-y-1/4 rounded-full bg-gradient-to-br from-indigo-200/20 to-blue-200/20 blur-3xl dark:from-indigo-600/10 dark:to-blue-600/10"></div>
            </div>

            <div className="relative">
              <AnimatedSection
                animation="fade-up"
                className="mx-auto max-w-4xl text-center"
              >
                <h2 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm dark:from-blue-400 dark:to-indigo-400">
                  {l('action.title')}
                </h2>
                <p className="mx-auto mb-8 sm:mb-10 max-w-2xl text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  {l('action.description')}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="group w-full sm:w-auto bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-8 text-lg font-medium rounded-xl shadow-lg shadow-blue-400/10 dark:shadow-blue-900/20 transition-all"
                  >
                    {l('action.button')}
                    <ArrowRight className="ml-2 size-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 py-3 px-8 text-lg font-medium rounded-xl text-gray-700 dark:text-gray-200 transition-all"
                  >
                    {l('action.login')}
                  </Button>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden bg-gradient-to-br from-[#f7f9ff] to-[#f2f4fc] dark:from-[#131313] dark:to-[#242424] py-10 sm:py-12 w-full border-t border-blue-50/80 dark:border-neutral-900">
        {/* Éléments circulaires décoratifs */}
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-blue-100/40 dark:bg-blue-900/10 blur-3xl"></div>
        <div className="absolute -bottom-32 right-0 w-80 h-80 rounded-full bg-indigo-100/40 dark:bg-indigo-900/10 blur-3xl"></div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          {/* Section principale du footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
            {/* Logo, slogan et réseaux sociaux */}
            <div className="max-w-lg mx-auto md:mx-0 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-4">
                <div className="relative group">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <Image
                    src="https://greedy-horse-339.convex.cloud/api/storage/78d28d02-9cd2-44a0-b6b1-4717a766d080"
                    width={60}
                    height={60}
                    alt="Consulat.ga"
                    className="relative h-14 w-14 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Consulat.ga
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">
                    Votre lien numérique avec le Gabon
                  </p>
                </div>
              </div>

              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
                Connectant le Gabon et sa diaspora à travers des services consulaires
                numériques innovants. Notre plateforme simplifie vos démarches
                administratives où que vous soyez.
              </p>

              <div className="flex items-center justify-center md:justify-start gap-4 mb-5">
                <AnimatedSection animation="fade-up" delay={0.1} className="flex gap-4">
                  <a href="#" aria-label="Twitter" className="group">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-blue-600/20 dark:from-blue-400/10 dark:to-blue-600/10 blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 scale-0 group-hover:scale-110"></div>
                      <div className="relative bg-white dark:bg-gray-800 rounded-full p-2.5 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:shadow-blue-500/10 dark:group-hover:shadow-blue-500/5">
                        <svg
                          className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </div>
                    </div>
                  </a>
                  <a href="#" aria-label="LinkedIn" className="group">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-500/20 dark:from-blue-600/10 dark:to-indigo-500/10 blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 scale-0 group-hover:scale-110"></div>
                      <div className="relative bg-white dark:bg-gray-800 rounded-full p-2.5 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:shadow-blue-500/10 dark:group-hover:shadow-blue-500/5">
                        <svg
                          className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </div>
                    </div>
                  </a>
                  <a href="#" aria-label="Instagram" className="group">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-500/20 dark:from-purple-400/10 dark:to-pink-500/10 blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 scale-0 group-hover:scale-110"></div>
                      <div className="relative bg-white dark:bg-gray-800 rounded-full p-2.5 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:shadow-purple-500/10 dark:group-hover:shadow-purple-500/5">
                        <svg
                          className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </a>
                </AnimatedSection>
              </div>
            </div>

            {/* Bouton Contact avec animation */}
            <div className="mx-auto md:ml-auto md:mr-0 max-w-md w-full">
              <AnimatedSection
                animation="fade-up"
                delay={0.2}
                className="relative group bg-gradient-to-br from-white to-gray-50 dark:from-[#242424] dark:to-[#2F2F2F] rounded-lg p-5 sm:p-6 shadow-lg shadow-blue-500/5 dark:shadow-blue-500/2 border border-gray-100 dark:border-gray-800"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-3 tracking-tight">
                  Besoin d'aide ?
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  Notre équipe d'experts est disponible pour répondre à toutes vos
                  questions et vous accompagner dans vos démarches administratives.
                </p>

                <Link
                  href="/contact"
                  className="relative group block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg text-base font-medium text-center shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10">Nous contacter</span>
                  <div className="absolute inset-0 flex justify-end items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="h-full aspect-square bg-white/10 -skew-x-12 translate-x-full group-hover:translate-x-1/2 transition-transform duration-500"></div>
                  </div>
                </Link>

                <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
                  Notre équipe est à votre disposition
                </p>
              </AnimatedSection>
            </div>
          </div>

          {/* Séparateur stylisé */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1 w-16 rounded-full"></div>
            </div>
          </div>

          {/* Section légale avec effet d'affichage */}
          <AnimatedSection
            animation="fade-up"
            delay={0.3}
            className="mt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
          >
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 tracking-wide">
              &copy; {new Date().getFullYear()} Consulat.ga. Tous droits réservés.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-6">
              <Link
                href="/legal/privacy"
                className="group relative text-xs md:text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <span>Politique de confidentialité</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 opacity-0 group-hover:w-full group-hover:opacity-100 transition-all duration-300"></span>
              </Link>
              <Link
                href="/legal/terms"
                className="group relative text-xs md:text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <span>Conditions d'utilisation</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 opacity-0 group-hover:w-full group-hover:opacity-100 transition-all duration-300"></span>
              </Link>
              <Link
                href="/legal/mentions"
                className="group relative text-xs md:text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <span>Mentions légales</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 opacity-0 group-hover:w-full group-hover:opacity-100 transition-all duration-300"></span>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </footer>
    </div>
  );
}
