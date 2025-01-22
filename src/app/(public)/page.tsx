import Link from 'next/link'
import { ROUTES } from '@/schemas/routes'
import { buttonVariants } from '@/components/ui/button'
import { ArrowRight, CalendarIcon, CheckCircle, ScrollText, Shield, Users } from 'lucide-react'
import React from 'react'
import { IdCardIcon } from '@radix-ui/react-icons'
import { CTASection } from '@/app/(public)/cta-section'

export default async function LandingPage() {

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Hero Section */}
      <section
        className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-gradient-to-b from-primary/10 to-background px-4 py-20">
        <div className="container relative z-10 mx-auto flex flex-col items-center text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
            Votre Consulat<br />
            <span className="text-primary">100% Digital</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {"Simplifiez vos démarches consulaires et gérez tous vos components en ligne, en toute sécurité et depuis n'importe où."}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="#features"
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className: "rounded-full"
              })}
            >
              Découvrir les fonctionnalités
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            Tout votre consulat dans votre poche
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Shield className="size-10 text-primary" />}
              title="Sécurisé et Officiel"
              description="Vos documents et démarches sont traités de manière 100% sécurisée et conforme aux normes consulaires."
            />
            <FeatureCard
              icon={<Users className="size-10 text-primary" />}
              title="Communauté Active"
              description="Rejoignez la communauté des ressortissants et restez connecté avec votre consulat."
            />
            <FeatureCard
              icon={<CheckCircle className="size-10 text-primary" />}
              title="Simple et Rapide"
              description="Effectuez vos démarches en quelques clics et suivez leur avancement en temps réel."
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-muted py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            Nos Services
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              title="Carte Consulaire"
              description="Obtenez votre carte consulaire numérique et gérez vos informations facilement."
              icon={<IdCardIcon className={"size-8"} />}
            />
            <ServiceCard
              title="Documents Officiels"
              description="Demandez et renouvelez vos documents officiels en ligne."
              icon={<ScrollText className={"size-8"}/>}
            />
            <ServiceCard
              title="Rendez-vous"
              description="Prenez rendez-vous en ligne et évitez les files d'attente."
              icon={<CalendarIcon className={"size-8"}/>}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}

// Components
function FeatureCard({
                       icon,
                       title,
                       description
                     }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function ServiceCard({
                       title,
                       description,
                       icon
                     }: {
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-lg bg-background p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}