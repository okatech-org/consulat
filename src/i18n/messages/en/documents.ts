export default {
  title: 'My documents',
  description: 'Manage your official documents and track their status',
  empty: {
    title: 'No documents',
    description: "You haven't uploaded any documents yet",
  },
  types: {
    passport: 'Passport',
    birth_certificate: 'Birth certificate',
    residence_permit: 'Residence permit',
    proof_of_address: 'Proof of address',
    identity_card: 'Identity card',
  },
  status: {
    pending: 'Pending',
    validated: 'Validated',
    rejected: 'Rejected',
    expired: 'Expired',
  },
  expires_on: 'Expires on',
  actions: {
    view: 'View',
    download: 'Download',
  },
} as const;
