import { User, Profile, Consulate } from '@prisma/client';

export type UserContext = {
  user: {
    name: string | null;
    email: string;
    role: string;
  };
  profile: {
    firstName: string;
    lastName: string;
    birthDate: string;
    birthPlace: string;
    birthCountry: string;
    gender: string;
    maritalStatus: string;
    workStatus: string;
    phone: string;
    address: {
      firstLine: string;
      secondLine: string | null;
      city: string;
      zipCode: string;
      country: string;
    };
    status: string;
  };
  consulate: {
    name: string;
    email: string;
    phone: string;
    isGeneral: boolean;
    address: {
      firstLine: string;
      secondLine: string | null;
      city: string;
      zipCode: string;
      country: string;
    };
    website: string | null;
    countries: string[];
  };
  documents: {
    hasPassport: boolean;
    hasBirthCertificate: boolean;
    hasResidencePermit: boolean;
    hasAddressProof: boolean;
  };
};

export function createUserContext(
  user: User,
  profile: Profile | null,
  consulate: Consulate | null,
): UserContext {
  return {
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
    profile: profile
      ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          birthDate: profile.birthDate,
          birthPlace: profile.birthPlace,
          birthCountry: profile.birthCountry,
          gender: profile.gender,
          maritalStatus: profile.maritalStatus,
          workStatus: profile.workStatus,
          phone: profile.phone,
          address: profile.address,
          status: profile.status,
        }
      : null,
    consulate: consulate
      ? {
          name: consulate.name,
          email: consulate.email,
          phone: consulate.phone,
          address: consulate.address,
          website: consulate.website,
          countries: consulate.countries.map((c) => c.name),
          isGeneral: consulate.isGeneral,
        }
      : null,
    documents: profile
      ? {
          hasPassport: !!profile.passport,
          hasBirthCertificate: !!profile.birthCertificate,
          hasResidencePermit: !!profile.residencePermit,
          hasAddressProof: !!profile.addressProof,
        }
      : null,
  };
}

export const rayContext = `
You are Ray, a consulate agent . Your role is to help users with their consular procedures. Here are your guidelines:

0. Act like a human, not a robot. Remember that you are communicating with a real person and should be empathetic to their needs.
1. Always be polite, professional, and helpful.
2. Provide accurate and concise information about passports, visas, birth certificates, and other consular services.
3. Adapt your responses based on the user's context (country of residence, status, etc.).
4. Use the specific user information to personalize your responses.
5. If you don't know the answer, direct the user to the appropriate consular service.
6. Respond in the user's language.
7. Use Markdown format to structure your responses (lists, bold, links, etc.).
9. Respect the confidentiality of user information.
10. Provide links to relevant forms or pages on the consulate's website if necessary.
11. Call the user by his lastName (if known) or by his firstName and add the appropriate title (Mr., Mrs., etc.).
12. Clearly state the steps the user needs to take to complete a certain process.

Information on consular services:
- Passports: Require a valid ID and a recent photo.
- Visas: Requirements vary depending on the country of origin and length of stay.
- Birth certificates: Can be obtained by providing proof of identity and birth details.

Make sure to check the user's context before responding and adapt your answers accordingly.
`;
