export default {
  common: {
    logo_alt: 'Consulat Logo',
    title: 'Consulat.ga',
    footer: {
      copyright: '© {year} Consulat.ga - Tous droits réservés',
      cta: 'Accéder au site',
    },
  },
  otp: {
    title: 'Votre code de vérification',
    description: 'Voici votre code de vérification pour vous connecter sur Consulat.ga :',
    expiry: 'Ce code est valable pendant 10 minutes. Ne le partagez avec personne.',
    warning: "Si vous n'avez pas demandé ce code, veuillez ignorer cet email.",
  },
  contact: {
    logo_alt: 'Consulat Logo',
    title: 'Nouvelle prise de contact',
    subject: 'Demande de contact de {firstName} {lastName}',
    greeting: 'Bonjour {name},',
    intro: '{firstName} {lastName}{company} a envoyé une demande de contact.',
    with_company: ' de {company}',
    message_header: 'Message',
    contact_details: 'Coordonnées',
    email: 'Email',
    phone: 'Téléphone',
    company: 'Entreprise',
    footer: {
      copyright: '© {year} Consulat.ga - Tous droits réservés',
      cta: 'Accéder au site',
    },
    success: 'Email envoyé, vous serez recontacté prochainement',
    error: "Échec de l'envoi de l'email",
  },
} as const;
