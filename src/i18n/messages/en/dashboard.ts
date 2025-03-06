export default {
  sections: {
    profile: {
      title: 'My profile',
      status: {
        pending: 'Pending',
      },
      completion: 'Profile completion',
      missing_fields: 'Missing fields:',
      fields: {
        all: 'All fields are required',
        identity_photo: 'ID photo',
        passport: 'Passport',
        birth_certificate: 'Birth certificate',
        residence_permit: 'Residence permit',
      },
      actions: {
        complete: 'Complete my profile',
        view: 'View profile',
      },
      and_more: 'and {count} more',
    },
  },
} as const;
