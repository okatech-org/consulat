import type { Doc } from '../_generated/dataModel';

export type CompleteChildProfile = Doc<'childProfiles'> & {
  registrationRequest?: Doc<'requests'>;
  identityPicture?: Doc<'documents'>;
  passport?: Doc<'documents'>;
  birthCertificate?: Doc<'documents'>;
};

export type CompleteProfile = Doc<'profiles'> & {
  registrationRequest?: Doc<'requests'>;
  passport?: Doc<'documents'>;
  birthCertificate?: Doc<'documents'>;
  residencePermit?: Doc<'documents'>;
  addressProof?: Doc<'documents'>;
  identityPicture?: Doc<'documents'>;
};
