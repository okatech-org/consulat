import {
  PrismaClient,
  UserRole,
  OrganizationType,
  ServiceCategory,
  DocumentType,
  OrganizationStatus,
  DocumentStatus,
  AppointmentType,
  AppointmentStatus,
  ProcessingMode,
  DeliveryMode,
  ServicePriority,
  RequestStatus,
  NotificationStatus,
  Gender,
  MaritalStatus,
  WorkStatus,
  FamilyLink,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting seed...');

    // Nettoyer la base de données dans le bon ordre
    await prisma.$transaction([
      prisma.notificationLog.deleteMany(),
      prisma.scheduledNotification.deleteMany(),
      prisma.notificationPreference.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.appointment.deleteMany(),
      prisma.note.deleteMany(),
      prisma.message.deleteMany(),
      prisma.userDocument.deleteMany(),
      prisma.requestAction.deleteMany(),
      prisma.serviceRequest.deleteMany(),
      prisma.consularService.deleteMany(),
      prisma.emergencyContact.deleteMany(),
      prisma.phone.deleteMany(),
      prisma.address.deleteMany(),
      prisma.parentalAuthority.deleteMany(),
      prisma.profile.deleteMany(),
      prisma.user.deleteMany(),
      prisma.organization.deleteMany(),
      prisma.country.deleteMany(),
    ]);

    // Créer les pays
    console.log('Creating countries...');
    await prisma.country.createMany({
      data: [
        {
          id: 'country-france',
          name: 'France',
          code: 'FR',
          flag: 'https://flagcdn.com/fr.svg',
          status: 'ACTIVE',
          metadata: JSON.stringify({
            currency: {
              code: 'EUR',
              symbol: '€',
              format: '#,##0.00',
              symbolPosition: 'after',
            },
            language: { defaultLocale: 'fr', locales: ['fr', 'en', 'es'] },
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h',
            timeZone: 'Europe/Paris',
          }),
        },
        {
          id: 'country-belgique',
          name: 'Belgique',
          code: 'BE',
          flag: 'https://flagcdn.com/be.svg',
          status: 'INACTIVE',
          metadata: JSON.stringify({
            currency: {
              code: 'EUR',
              symbol: '€',
              format: '#,##0.00',
              symbolPosition: 'after',
            },
            language: { defaultLocale: 'fr', locales: ['fr', 'en', 'nl'] },
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h',
            timeZone: 'Europe/Brussels',
          }),
        },
      ],
    });

    // Créer les organisations
    console.log('Creating organizations...');
    await prisma.organization.create({
      data: {
        id: 'organization-ambassade-france',
        name: 'Ambassade du Gabon en France',
        type: OrganizationType.EMBASSY,
        status: OrganizationStatus.ACTIVE,
        countries: { connect: [{ code: 'FR' }] },
        metadata: JSON.stringify({
          FR: {
            settings: {
              logo: 'https://example.com/logo-france.png',
              contact: {
                address: {
                  firstLine: '26 Rue de la Faisanderie',
                  city: 'Paris',
                  zipCode: '75116',
                  country: 'FR',
                },
                phone: '+33145630787',
                email: 'contact@ambagabon-fr.org',
                website: 'https://ambagabon-fr.org',
              },
              schedule: {
                monday: {
                  isOpen: true,
                  slots: [
                    { start: '09:00', end: '12:00' },
                    { start: '14:00', end: '17:00' },
                  ],
                },
                tuesday: {
                  isOpen: true,
                  slots: [
                    { start: '09:00', end: '12:00' },
                    { start: '14:00', end: '17:00' },
                  ],
                },
                wednesday: {
                  isOpen: true,
                  slots: [
                    { start: '09:00', end: '12:00' },
                    { start: '14:00', end: '17:00' },
                  ],
                },
                thursday: {
                  isOpen: true,
                  slots: [
                    { start: '09:00', end: '12:00' },
                    { start: '14:00', end: '17:00' },
                  ],
                },
                friday: {
                  isOpen: true,
                  slots: [{ start: '09:00', end: '18:00' }],
                },
                saturday: { isOpen: false },
                sunday: { isOpen: false },
              },
              holidays: [
                {
                  date: '2024-01-01',
                  name: "Jour de l'an",
                },
              ],
            },
          },
        }),
        appointmentSettings: JSON.stringify({
          quotas: {
            DOCUMENT_SUBMISSION: 10,
            DOCUMENT_COLLECTION: 15,
            INTERVIEW: 5,
            MARRIAGE_CEREMONY: 2,
            EMERGENCY: 3,
          },
        }),
      },
    });

    // Créer les utilisateurs
    console.log('Creating users...');

    // Admin et Agents
    await prisma.profile.create({
      data: {
        id: 'profile-admin',
        firstName: 'Admin',
        lastName: 'France',
        birthDate: new Date('1980-01-01'),
        birthPlace: 'Paris',
        birthCountry: 'FR',
        nationality: 'FR',
        gender: Gender.MALE,
        residenceCountyCode: 'FR',
        user: {
          create: {
            id: 'user-admin',
            email: 'okatech+admin@icloud.com',
            roles: [UserRole.ADMIN],
            organizationId: 'organization-ambassade-france',
            countryCode: 'FR',
            specializations: [
              ServiceCategory.IDENTITY,
              ServiceCategory.REGISTRATION,
              ServiceCategory.CIVIL_STATUS,
              ServiceCategory.VISA,
            ],
            linkedCountries: { connect: [{ code: 'FR' }] },
          },
        },
      },
    });
    await prisma.profile.create({
      data: {
        id: 'profile-agent-1',
        firstName: 'Agent',
        lastName: 'France Un',
        birthDate: new Date('1985-01-01'),
        birthPlace: 'Paris',
        birthCountry: 'FR',
        nationality: 'FR',
        gender: Gender.FEMALE,
        residenceCountyCode: 'FR',
        user: {
          create: {
            id: 'user-agent-france-1',
            email: 'okatech+agent@icloud.com',
            roles: [UserRole.AGENT],
            assignedOrganizationId: 'organization-ambassade-france',
            countryCode: 'FR',
            specializations: [ServiceCategory.IDENTITY, ServiceCategory.REGISTRATION],
            linkedCountries: { connect: [{ code: 'FR' }] },
          },
        },
      },
    });
    await prisma.profile.create({
      data: {
        id: 'profile-agent-2',
        firstName: 'Agent',
        lastName: 'France Deux',
        birthDate: new Date('1990-01-01'),
        birthPlace: 'Lyon',
        birthCountry: 'FR',
        nationality: 'FR',
        gender: Gender.MALE,
        residenceCountyCode: 'FR',
        user: {
          create: {
            id: 'user-agent-france-2',
            email: 'itoutouberny+agent@gmail.com',
            roles: [UserRole.AGENT],
            assignedOrganizationId: 'organization-ambassade-france',
            countryCode: 'FR',
            specializations: [ServiceCategory.CIVIL_STATUS, ServiceCategory.VISA],
            linkedCountries: { connect: [{ code: 'FR' }] },
          },
        },
      },
    });

    // Créer les services consulaires
    console.log('Creating consular services...');
    await Promise.all([
      // Service 1: Demande de passeport
      prisma.consularService.create({
        data: {
          id: 'service-passport',
          name: 'Demande de passeport',
          description:
            'Service de demande et de renouvellement de passeport pour les ressortissants gabonais',
          category: ServiceCategory.IDENTITY,
          isActive: true,
          requiredDocuments: [
            DocumentType.IDENTITY_PHOTO,
            DocumentType.BIRTH_CERTIFICATE,
            DocumentType.PROOF_OF_ADDRESS,
            DocumentType.NATIONALITY_CERTIFICATE,
          ],
          optionalDocuments: [DocumentType.RESIDENCE_PERMIT],
          requiresAppointment: true,
          appointmentDuration: 30,
          price: 50,
          currency: 'EUR',
          organization: { connect: { id: 'organization-ambassade-france' } },
          Country: { connect: { id: 'country-france' } },
          processingMode: ProcessingMode.PRESENCE_REQUIRED,
          deliveryMode: [DeliveryMode.IN_PERSON],
        },
      }),

      // Service 2: Inscription consulaire
      prisma.consularService.create({
        data: {
          id: 'service-registration',
          name: 'Inscription consulaire',
          description:
            "Enregistrement auprès du consulat pour les Gabonais résidant à l'étranger",
          category: ServiceCategory.REGISTRATION,
          isActive: true,
          requiredDocuments: [
            DocumentType.PASSPORT,
            DocumentType.PROOF_OF_ADDRESS,
            DocumentType.RESIDENCE_PERMIT,
            DocumentType.IDENTITY_PHOTO,
            DocumentType.BIRTH_CERTIFICATE,
          ],
          requiresAppointment: true,
          appointmentDuration: 30,
          price: 0,
          organization: { connect: { id: 'organization-ambassade-france' } },
          Country: { connect: { id: 'country-france' } },
          processingMode: ProcessingMode.PRESENCE_REQUIRED,
          deliveryMode: [DeliveryMode.IN_PERSON],
        },
      }),
    ]);

    // Créér les comptes super admin
    await Promise.all([
      prisma.user.create({
        data: {
          firstName: 'Okatech',
          lastName: 'SA',
          id: 'user-super-admin',
          email: 'okatech@icloud.com',
          roles: [UserRole.SUPER_ADMIN],
        },
      }),
    ]);

    // Créer des utilisateurs normaux avec leurs profils
    console.log('Creating regular users with profiles...');
    await Promise.all([
      prisma.profile.create({
        data: {
          id: 'profile-berny-itoutou',
          userId: 'user-berny-itoutou',
          firstName: 'Berny',
          lastName: 'Itoutou',
          gender: Gender.MALE,
          birthDate: new Date('1990-01-01'),
          birthPlace: 'Paris',
          birthCountry: 'FR',
          nationality: 'GA',
          passportNumber: 'GA123456',
          email: 'itoutouberny@gmail.com',
          passportIssueDate: new Date('2020-01-01'),
          passportExpiryDate: new Date('2030-01-01'),
          passportIssueAuthority: 'Ambassade du Gabon',
          status: RequestStatus.SUBMITTED,
          maritalStatus: MaritalStatus.SINGLE,
          workStatus: WorkStatus.EMPLOYEE,
          profession: 'Développeur',
          employer: 'Consulat.ga',
          employerAddress: '123 Rue de la Tech, 75008 Paris',
          fatherFullName: 'Jean Itoutou',
          motherFullName: 'Marie Itoutou',
          activityInGabon: 'Consultant IT',
          cardPin: 'GA123456',
          residenceCountyCode: 'FR',
          user: {
            create: {
              id: 'user-berny-itoutou',
              email: 'itoutouberny@gmail.com',
              firstName: 'Berny',
              lastName: 'Itoutou',
              roles: [UserRole.USER],
              emailVerified: new Date(),
              countryCode: 'FR',
            },
          },
          address: {
            create: {
              firstLine: '123 Rue de la Paix',
              secondLine: 'Appartement 4B',
              city: 'Paris',
              zipCode: '75008',
              country: 'FR',
            },
          },
          phone: {
            create: {
              number: '0612345678',
              countryCode: '+33',
            },
          },
          residentContact: {
            create: {
              firstName: 'Pierre',
              lastName: 'Itoutou',
              relationship: FamilyLink.FATHER,
              phone: {
                create: {
                  number: '0687654321',
                  countryCode: '+33',
                },
              },
              address: {
                create: {
                  firstLine: '42 Boulevard de la Liberté',
                  city: 'Paris',
                  zipCode: '75010',
                  country: 'FR',
                },
              },
            },
          },
          homeLandContact: {
            create: {
              firstName: 'Marie',
              lastName: 'Itoutou',
              relationship: FamilyLink.MOTHER,
              phone: {
                create: {
                  number: '074123456',
                  countryCode: '+241',
                },
              },
              address: {
                create: {
                  firstLine: "42 Boulevard de l'Indépendance",
                  city: 'Libreville',
                  zipCode: null,
                  country: 'GA',
                },
              },
            },
          },
          identityPicture: {
            create: {
              type: DocumentType.IDENTITY_PHOTO,
              status: DocumentStatus.VALIDATED,
              fileUrl: '/images/avatar-placeholder.png',
              issuedAt: new Date('2024-04-15T09:00:00Z'),
              expiresAt: new Date('2029-04-15T09:00:00Z'),
            },
          },
          passport: {
            create: {
              type: DocumentType.PASSPORT,
              status: DocumentStatus.VALIDATED,
              fileUrl: 'https://example.com/passport.pdf',
              issuedAt: new Date('2020-04-15T09:00:00Z'),
              expiresAt: new Date('2030-04-15T09:00:00Z'),
            },
          },
          birthCertificate: {
            create: {
              type: DocumentType.BIRTH_CERTIFICATE,
              status: DocumentStatus.VALIDATED,
              fileUrl: 'https://example.com/birth-certificate.pdf',
              issuedAt: new Date('1990-04-15T09:00:00Z'),
            },
          },
          residencePermit: {
            create: {
              type: DocumentType.RESIDENCE_PERMIT,
              status: DocumentStatus.VALIDATED,
              fileUrl: 'https://example.com/residence-permit.pdf',
              issuedAt: new Date('2023-04-15T09:00:00Z'),
              expiresAt: new Date('2028-04-15T09:00:00Z'),
            },
          },
          addressProof: {
            create: {
              type: DocumentType.PROOF_OF_ADDRESS,
              status: DocumentStatus.VALIDATED,
              fileUrl: 'https://example.com/proof-of-address.pdf',
              issuedAt: new Date('2024-04-15T09:00:00Z'),
              expiresAt: new Date('2025-04-15T09:00:00Z'),
            },
          },
        },
      }),
      prisma.profile.create({
        data: {
          id: 'profile-jane-doe',
          firstName: 'Jane',
          lastName: 'Doe',
          gender: Gender.FEMALE,
          birthDate: new Date('1988-05-15'),
          birthPlace: 'Paris',
          birthCountry: 'FR',
          nationality: 'GA',
          passportNumber: 'GA789012',
          email: 'itoutouberny+jane@gmail.com',
          passportIssueDate: new Date('2021-03-15'),
          passportExpiryDate: new Date('2031-03-15'),
          passportIssueAuthority: 'Consulat du Gabon à Paris',
          status: RequestStatus.SUBMITTED,
          maritalStatus: MaritalStatus.MARRIED,
          workStatus: WorkStatus.EMPLOYEE,
          profession: 'Médecin',
          employer: 'Hôpital Saint-Louis',
          employerAddress: '1 Avenue Claude Vellefaux, 75010 Paris',
          fatherFullName: 'John Doe',
          motherFullName: 'Mary Doe',
          spouseFullName: 'John Doe',
          activityInGabon: 'Missions humanitaires',
          cardPin: 'GA789012',
          residenceCountyCode: 'FR',
          user: {
            create: {
              id: 'user-jane-doe',
              email: 'itoutouberny+jane@gmail.com',
              firstName: 'Jane',
              lastName: 'Doe',
              roles: [UserRole.USER],
              emailVerified: new Date(),
              countryCode: 'FR',
            },
          },
          address: {
            create: {
              firstLine: '45 Rue de Rivoli',
              secondLine: 'Apt 12',
              city: 'Paris',
              zipCode: '75004',
              country: 'FR',
            },
          },
          phone: {
            create: {
              number: '0623456789',
              countryCode: '+33',
            },
          },
          residentContact: {
            create: {
              firstName: 'Michael',
              lastName: 'Doe',
              relationship: FamilyLink.SPOUSE,
              phone: {
                create: {
                  number: '0634567890',
                  countryCode: '+33',
                },
              },
              address: {
                create: {
                  firstLine: '45 Rue de Rivoli',
                  secondLine: 'Apt 12',
                  city: 'Paris',
                  zipCode: '75004',
                  country: 'FR',
                },
              },
            },
          },
          homeLandContact: {
            create: {
              firstName: 'John',
              lastName: 'Doe',
              relationship: FamilyLink.FATHER,
              phone: {
                create: {
                  number: '074987654',
                  countryCode: '+241',
                },
              },
              address: {
                create: {
                  firstLine: '123 Boulevard Triomphal',
                  city: 'Libreville',
                  zipCode: null,
                  country: 'GA',
                },
              },
            },
          },
          identityPicture: {
            create: {
              type: DocumentType.IDENTITY_PHOTO,
              status: DocumentStatus.VALIDATED,
              fileUrl: '/images/avatar-placeholder.png',
              issuedAt: new Date('2023-05-15T09:00:00Z'),
              expiresAt: new Date('2028-05-15T09:00:00Z'),
            },
          },
          passport: {
            create: {
              type: DocumentType.PASSPORT,
              status: DocumentStatus.VALIDATED,
              fileUrl: 'https://example.com/jane-passport.pdf',
              issuedAt: new Date('2021-03-15T09:00:00Z'),
              expiresAt: new Date('2031-03-15T09:00:00Z'),
            },
          },
          birthCertificate: {
            create: {
              type: DocumentType.BIRTH_CERTIFICATE,
              status: DocumentStatus.VALIDATED,
              fileUrl: 'https://example.com/jane-birth-certificate.pdf',
              issuedAt: new Date('1988-05-15T09:00:00Z'),
            },
          },
          residencePermit: {
            create: {
              type: DocumentType.RESIDENCE_PERMIT,
              status: DocumentStatus.VALIDATED,
              fileUrl: 'https://example.com/jane-residence-permit.pdf',
              issuedAt: new Date('2021-03-15T09:00:00Z'),
              expiresAt: new Date('2031-03-15T09:00:00Z'),
            },
          },
          addressProof: {
            create: {
              type: DocumentType.PROOF_OF_ADDRESS,
              status: DocumentStatus.VALIDATED,
              fileUrl: 'https://example.com/jane-address-proof.pdf',
              issuedAt: new Date('2021-03-15T09:00:00Z'),
              expiresAt: new Date('2031-03-15T09:00:00Z'),
            },
          },
        },
      }),
    ]);

    // Créer le profil de l'enfant
    console.log('Creating child profile...');
    const childProfile = await prisma.profile.create({
      data: {
        id: 'profile-berny-child',
        firstName: 'Emma',
        lastName: 'Itoutou',
        gender: Gender.FEMALE,
        birthDate: new Date('2020-05-15'),
        birthPlace: 'Paris',
        birthCountry: 'FR',
        nationality: 'GA',
        category: 'MINOR',
        status: 'DRAFT',
        residenceCountyCode: 'FR',
        identityPicture: {
          create: {
            type: DocumentType.IDENTITY_PHOTO,
            status: DocumentStatus.VALIDATED,
            fileUrl: '/images/avatar-placeholder.png',
            issuedAt: new Date('2024-01-01'),
            expiresAt: new Date('2029-01-01'),
          },
        },
        birthCertificate: {
          create: {
            type: DocumentType.BIRTH_CERTIFICATE,
            status: DocumentStatus.VALIDATED,
            fileUrl: 'https://example.com/emma-birth-certificate.pdf',
            issuedAt: new Date('2020-05-15'),
            expiresAt: new Date('2030-05-15'),
          },
        },
        address: {
          create: {
            firstLine: '123 Rue de la Paix',
            secondLine: 'Appartement 4B',
            city: 'Paris',
            zipCode: '75008',
            country: 'FR',
          },
        },
      },
    });

    // Créer l'autorité parentale
    console.log('Creating parental authority...');
    await prisma.parentalAuthority.create({
      data: {
        role: 'FATHER',
        isActive: true,
        profile: {
          connect: {
            id: childProfile.id,
          },
        },
        parentUser: {
          connect: {
            id: 'user-berny-itoutou',
          },
        },
      },
    });

    await prisma.parentalAuthority.create({
      data: {
        role: 'MOTHER',
        isActive: true,
        profile: {
          connect: {
            id: childProfile.id,
          },
        },
        parentUser: {
          connect: {
            id: 'user-jane-doe',
          },
        },
      },
    });

    // Créer des rendez-vous
    console.log('Creating appointments...');
    await Promise.all([
      prisma.appointment.create({
        data: {
          id: 'appointment-berny-itoutou-1',
          countryCode: 'FR',
          date: new Date('2025-04-15'),
          startTime: new Date('2025-04-15T09:00:00Z'),
          endTime: new Date('2025-04-15T09:30:00Z'),
          duration: 30,
          type: AppointmentType.DOCUMENT_SUBMISSION,
          status: AppointmentStatus.CONFIRMED,
          organization: { connect: { id: 'organization-ambassade-france' } },
          attendee: { connect: { id: 'user-berny-itoutou' } },
          agent: { connect: { id: 'user-agent-france-1' } },
          instructions: 'Veuillez apporter tous les documents originaux.',
        },
      }),
      prisma.appointment.create({
        data: {
          id: 'appointment-berny-itoutou-2',
          countryCode: 'FR',
          date: new Date('2024-04-16'),
          startTime: new Date('2024-04-16T14:00:00Z'),
          endTime: new Date('2024-04-16T14:45:00Z'),
          duration: 45,
          type: AppointmentType.DOCUMENT_COLLECTION,
          status: AppointmentStatus.CONFIRMED,
          organization: { connect: { id: 'organization-ambassade-france' } },
          attendee: { connect: { id: 'user-berny-itoutou' } },
          agent: { connect: { id: 'user-agent-france-2' } },
          instructions: 'Retrait de la carte consulaire et entretien.',
        },
      }),
      prisma.appointment.create({
        data: {
          id: 'appointment-jane-doe-1',
          countryCode: 'FR',
          date: new Date('2025-04-20'),
          startTime: new Date('2025-04-20T14:00:00Z'),
          endTime: new Date('2025-04-20T14:30:00Z'),
          duration: 30,
          type: AppointmentType.DOCUMENT_SUBMISSION,
          status: AppointmentStatus.CONFIRMED,
          organization: { connect: { id: 'organization-ambassade-france' } },
          attendee: { connect: { id: 'user-jane-doe' } },
          agent: { connect: { id: 'user-agent-france-1' } },
          instructions: 'Please bring all original documents and their copies.',
        },
      }),
      prisma.appointment.create({
        data: {
          id: 'appointment-jane-doe-2',
          countryCode: 'FR',
          date: new Date('2024-04-25'),
          startTime: new Date('2024-04-25T15:00:00Z'),
          endTime: new Date('2024-04-25T15:45:00Z'),
          duration: 45,
          type: AppointmentType.INTERVIEW,
          status: AppointmentStatus.PENDING,
          organization: { connect: { id: 'organization-ambassade-france' } },
          attendee: { connect: { id: 'user-jane-doe' } },
          agent: { connect: { id: 'user-agent-france-1' } },
          instructions: 'Interview for consular registration.',
        },
      }),
    ]);

    // Créer des demandes de service
    console.log('Creating service requests...');
    await Promise.all([
      prisma.serviceRequest.create({
        data: {
          id: 'service-request-france-1',
          status: RequestStatus.SUBMITTED,
          priority: ServicePriority.STANDARD,
          service: { connect: { id: 'service-passport' } },
          assignedTo: { connect: { id: 'user-agent-france-1' } },
          serviceCategory: 'IDENTITY',
          submittedBy: { connect: { id: 'user-berny-itoutou' } },
          organization: { connect: { id: 'organization-ambassade-france' } },
          country: { connect: { code: 'FR' } },
          chosenProcessingMode: ProcessingMode.PRESENCE_REQUIRED,
          chosenDeliveryMode: DeliveryMode.IN_PERSON,
          submittedAt: new Date(),
          requiredDocuments: {
            create: [
              {
                type: DocumentType.PASSPORT,
                status: DocumentStatus.PENDING,
                fileUrl: 'https://example.com/passport.pdf',
              },
              {
                type: DocumentType.IDENTITY_PHOTO,
                status: DocumentStatus.PENDING,
                fileUrl: 'https://example.com/photo.jpg',
              },
            ],
          },
        },
      }),
      prisma.serviceRequest.create({
        data: {
          id: 'service-request-france-2',
          status: RequestStatus.PENDING,
          priority: ServicePriority.STANDARD,
          serviceCategory: 'REGISTRATION',
          assignedTo: { connect: { id: 'user-agent-france-1' } },
          service: { connect: { id: 'service-registration' } },
          submittedBy: { connect: { id: 'user-jane-doe' } },
          organization: { connect: { id: 'organization-ambassade-france' } },
          country: { connect: { code: 'FR' } },
          chosenProcessingMode: ProcessingMode.PRESENCE_REQUIRED,
          chosenDeliveryMode: DeliveryMode.IN_PERSON,
          submittedAt: new Date(),
          firstPassValidation: true,
          requestedFor: { connect: { id: 'profile-jane-doe' } },
          processingTime: 0,
        },
      }),
    ]);

    // Créer les notifications
    console.log('Creating notifications...');

    // Add registration request for Berny Itoutou
    console.log('Creating registration request for Berny Itoutou...');
    await prisma.serviceRequest.create({
      data: {
        id: 'service-request-registration-berny',
        status: RequestStatus.SUBMITTED,
        priority: ServicePriority.STANDARD,
        serviceCategory: ServiceCategory.REGISTRATION,
        service: { connect: { id: 'service-registration' } },
        submittedBy: { connect: { id: 'user-berny-itoutou' } },
        requestedFor: { connect: { id: 'profile-berny-itoutou' } },
        organization: { connect: { id: 'organization-ambassade-france' } },
        assignedTo: { connect: { id: 'user-agent-france-1' } },
        country: { connect: { code: 'FR' } },
        chosenProcessingMode: ProcessingMode.PRESENCE_REQUIRED,
        chosenDeliveryMode: DeliveryMode.IN_PERSON,
        submittedAt: new Date(),
      },
    });

    await Promise.all([
      prisma.notification.createMany({
        data: [
          // Notifications pour user-berny-itoutou
          {
            id: 'notification-1',
            userId: 'user-berny-itoutou',
            type: 'CONSULAR_REGISTRATION_SUBMITTED',
            title: 'Inscription consulaire soumise',
            message: "Votre demande d'inscription consulaire a été soumise avec succès.",
            createdAt: new Date('2024-03-20T10:00:00Z'),
            read: true,
            status: NotificationStatus.SENT,
            priority: 'normal',
          },
          {
            id: 'notification-2',
            userId: 'user-berny-itoutou',
            type: 'CONSULAR_REGISTRATION_VALIDATED',
            title: 'Dossier validé',
            message:
              "Votre dossier d'inscription consulaire a été validé. Vous pouvez accéder à votre carte consulaire virtuelle dès maintenant.",
            createdAt: new Date('2024-03-21T14:30:00Z'),
            read: false,
            status: NotificationStatus.SENT,
            priority: 'high',
            actions: JSON.stringify([
              {
                label: 'Voir ma carte consulaire',
                url: '/my-space/consular-card',
                primary: true,
              },
            ]),
            metadata: { cardId: 'CARD-123456', validUntil: '2029-03-21' },
          },
          {
            id: 'notification-3',
            userId: 'user-jane-doe',
            type: 'CONSULAR_CARD_READY',
            title: 'Carte prête pour retrait',
            message: 'Votre carte consulaire est prête pour le retrait.',
            createdAt: new Date('2024-03-22T09:15:00Z'),
            read: false,
            status: NotificationStatus.SENT,
            priority: 'high',
            actions: JSON.stringify([
              {
                label: 'Prendre rendez-vous',
                url: '/my-space/appointments/new?serviceRequestId=service-request-france-2&type=DOCUMENT_COLLECTION',
                primary: true,
              },
            ]),
          },
          // Notification with date d'expiration
          {
            id: 'notification-4',
            userId: 'user-berny-itoutou',
            type: 'APPOINTMENT_REMINDER_1_DAY',
            title: 'Rappel de rendez-vous',
            message: 'Votre rendez-vous est prévu pour demain à 10h00.',
            createdAt: new Date('2024-03-25T09:00:00Z'),
            read: false,
            status: NotificationStatus.SENT,
            priority: 'urgent',
            expiresAt: new Date('2024-03-26T11:00:00Z'),
            actions: JSON.stringify([
              {
                label: 'Voir le rendez-vous',
                url: '/my-space/appointments/appointment-1',
                primary: true,
              },
              {
                label: 'Annuler',
                url: '/my-space/appointments/appointment-1/cancel',
                primary: false,
              },
            ]),
          },
          // Notification for new registration request
          {
            id: 'notification-5',
            userId: 'user-berny-itoutou',
            type: 'CONSULAR_REGISTRATION_SUBMITTED',
            title: 'Nouvelle inscription consulaire',
            message:
              "Votre demande d'inscription consulaire a été enregistrée et est en cours de traitement.",
            createdAt: new Date(),
            read: false,
            status: NotificationStatus.SENT,
            priority: 'normal',
            actions: JSON.stringify([
              {
                label: 'Voir ma demande',
                url: '/my-space/requests/service-request-registration-berny',
                primary: true,
              },
            ]),
          },
        ],
      }),

      // Créer des notifications programmées
      prisma.scheduledNotification.createMany({
        data: [
          {
            id: 'scheduled-notification-1',
            userId: 'user-berny-itoutou',
            scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 jour dans le futur
            processed: false,
            payload: {
              type: 'APPOINTMENT_REMINDER_1_DAY',
              title: 'Rappel de rendez-vous',
              message: "N'oubliez pas votre rendez-vous demain à 14h30.",
              channels: ['app', 'email'],
              recipient: {
                userId: 'user-berny-itoutou',
                email: 'berny.itoutou@example.com',
              },
              actions: [
                {
                  label: 'Voir le rendez-vous',
                  url: '/my-space/appointments/appointment-2',
                  primary: true,
                },
              ],
              priority: 'high',
            },
            createdAt: new Date(),
          },
          {
            id: 'scheduled-notification-2',
            userId: 'user-jane-doe',
            scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 jours dans le futur
            processed: false,
            payload: {
              type: 'APPOINTMENT_REMINDER_3_DAYS',
              title: 'Rappel de rendez-vous',
              message: 'Votre rendez-vous est prévu dans 3 jours.',
              channels: ['app', 'email', 'sms'],
              recipient: {
                userId: 'user-jane-doe',
                email: 'jane.doe@example.com',
                phoneNumber: '+33612345678',
              },
              priority: 'normal',
            },
            createdAt: new Date(),
          },
        ],
      }),

      // Créer des préférences de notification
      prisma.notificationPreference.createMany({
        data: [
          // Préférences pour user-berny-itoutou
          {
            id: 'notification-pref-1',
            userId: 'user-berny-itoutou',
            type: 'APPOINTMENT_REMINDER_1_DAY',
            channel: 'app',
            enabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'notification-pref-2',
            userId: 'user-berny-itoutou',
            type: 'APPOINTMENT_REMINDER_1_DAY',
            channel: 'email',
            enabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'notification-pref-3',
            userId: 'user-berny-itoutou',
            type: 'APPOINTMENT_REMINDER_1_DAY',
            channel: 'sms',
            enabled: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          // Préférences pour user-jane-doe
          {
            id: 'notification-pref-4',
            userId: 'user-jane-doe',
            type: 'APPOINTMENT_REMINDER_3_DAYS',
            channel: 'app',
            enabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'notification-pref-5',
            userId: 'user-jane-doe',
            type: 'APPOINTMENT_REMINDER_3_DAYS',
            channel: 'email',
            enabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'notification-pref-6',
            userId: 'user-jane-doe',
            type: 'APPOINTMENT_REMINDER_3_DAYS',
            channel: 'sms',
            enabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
    ]);

    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
