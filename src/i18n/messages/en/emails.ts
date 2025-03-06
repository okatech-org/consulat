export default {
  common: {
    logo_alt: 'Consulate Logo',
    title: 'Consulat.ga',
    footer: {
      copyright: '© {year} Consulat.ga - All rights reserved',
      cta: 'Visit the website',
    },
  },
  otp: {
    title: 'Your verification code',
    description: 'Here is your verification code to sign in to Consulat.ga:',
    expiry: 'This code is valid for 10 minutes. Do not share it with anyone.',
    warning: 'If you did not request this code, please ignore this email.',
  },
  contact: {
    logo_alt: 'Consulate Logo',
    title: 'New contact request',
    subject: 'Contact request from {firstName} {lastName}',
    greeting: 'Hello {name},',
    intro: '{firstName} {lastName}{company} has sent a contact request.',
    with_company: ' from {company}',
    message_header: 'Message',
    contact_details: 'Contact details',
    email: 'Email',
    phone: 'Phone',
    company: 'Company',
    footer: {
      copyright: '© {year} Consulat.ga - All rights reserved',
      cta: 'Visit the website',
    },
    success: 'Email sent, you will be contacted soon',
    error: 'Failed to send email',
  },
} as const;
