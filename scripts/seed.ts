import { addDays, setHours, setMinutes, subDays } from 'date-fns'
import {
  PrismaClient,
  UserRole,
  DocumentType,
  Gender,
  MaritalStatus,
  WorkStatus,
  NationalityAcquisition,
  RequestStatus,
  DocumentStatus,
  User,
} from '@prisma/client'

const PROFILE_COUNT = 10

const SAMPLE_NATIONALITIES = ['gabon', 'france', 'senegal', 'cameroon', 'congo']
const SAMPLE_CITIES = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille']
const SAMPLE_PROFESSIONS = ['Ingénieur', 'Médecin', 'Enseignant', 'Entrepreneur', 'Étudiant']
const SAMPLE_EMPLOYERS = ['Total', 'Orange', 'BNP Paribas', 'Carrefour', 'EDF']

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Début du seeding...')

    console.log('🌱 Début du seeding du consulat...')

    // Supprimer les données existantes
    await prisma.timeSlot.deleteMany()
    await prisma.consulateSchedule.deleteMany()
    await prisma.consulate.deleteMany()
    // Supprimer les données existantes
    await prisma.emergencyContact.deleteMany()
    await prisma.addressGabon.deleteMany()
    await prisma.userDocument.deleteMany()
    await prisma.profile.deleteMany()
    await prisma.address.deleteMany()
    await prisma.user.deleteMany()

    // Créer le consulat
    const consulat = await prisma.consulate.create({
      data: {
        name: "Ambassade du Gabon en France",
        email: "contact@ambagabon-fr.org",
        phone: "0142996868",
        isGeneral: true,
        website: "https://ambagabon-fr.org",
        address: {
          create: {
            firstLine: "26bis Avenue Raphaël",
            city: "Paris",
            zipCode: "75016",
            country: "france"
          }
        },
        countries: {
          create: [
            { name: "France", code: "FR" },
            { name: "Belgique", code: "BE" },
            { name: "Luxembourg", code: "LU" }
          ]
        },
        schedule: {
          create: [
            { dayOfWeek: 1, openTime: "09:00", closeTime: "16:30", isOpen: true },  // Lundi
            { dayOfWeek: 2, openTime: "09:00", closeTime: "16:30", isOpen: true },  // Mardi
            { dayOfWeek: 3, openTime: "09:00", closeTime: "16:30", isOpen: true },  // Mercredi
            { dayOfWeek: 4, openTime: "09:00", closeTime: "16:30", isOpen: true },  // Jeudi
            { dayOfWeek: 5, openTime: "09:00", closeTime: "16:30", isOpen: true },  // Vendredi
            { dayOfWeek: 6, openTime: "00:00", closeTime: "00:00", isOpen: false }, // Samedi
            { dayOfWeek: 0, openTime: "00:00", closeTime: "00:00", isOpen: false }  // Dimanche
          ]
        }
      }
    })

    const manager = await prisma.user.create({
      data: {
        email: 'itoutouberny+manager@gmail.com',
        name: 'Manager Consulaire',
        role: UserRole.ADMIN,
        emailVerified: new Date(),
        consulate:{
          connect: {
            id: consulat.id
          }
        }
      },
    })

    // Générer des créneaux de rendez-vous pour les 30 prochains jours
    const startDate = new Date()
    const numberOfDays = 30
    const slotDuration = 30 // minutes

    for (let day = 0; day < numberOfDays; day++) {
      const currentDate = addDays(startDate, day)
      const dayOfWeek = currentDate.getDay()

      // Vérifier si le consulat est ouvert ce jour
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Lundi à Vendredi
        // Créer des créneaux entre 9h et 16h30
        const startTime = setHours(setMinutes(currentDate, 0), 9)
        const endTime = setHours(setMinutes(currentDate, 30), 16)

        let currentSlot = startTime
        while (currentSlot < endTime) {
          await prisma.timeSlot.create({
            data: {
              consulateId: consulat.id,
              startTime: currentSlot,
              endTime: addMinutes(currentSlot, slotDuration),
              duration: slotDuration,
              isAvailable: true
            }
          })
          currentSlot = addMinutes(currentSlot, slotDuration)
        }
      }
    }

    // 2. Créer l'utilisateur avec son profil
    console.log('Création de l\'utilisateur et du profil...')
    const user = await prisma.user.create({
      data: {
        email: "itoutouberny@gmail.com",
        phone: "+330612250393",
        name: "Berny Itoutou",
        role: UserRole.USER,
        emailVerified: new Date(),
        phoneVerified: new Date(),
        lastLogin: new Date(),
        consulateId: consulat.id,
        profile: {
          create: {
            firstName: "John",
            lastName: "Doe",
            gender: Gender.MALE,
            birthDate: "1990-01-01",
            birthPlace: "Paris",
            birthCountry: "france",
            nationality: "gabon",
            email: "itoutouberny@gmail.com",
            phone: "+330612250393",
            maritalStatus: MaritalStatus.SINGLE,
            workStatus: WorkStatus.EMPLOYEE,
            acquisitionMode: NationalityAcquisition.BIRTH,
            identityPicture: "https://utfs.io/f/yMD4lMLsSKvznrMiNYCVFA1bUs9ixXJIwYke3aRG6qo42vpB",
            profession: "Ingénieur informatique",
            employer: "Decathlon",
            employerAddress: "10 rue de l'Innovation, Paris",
            activityInGabon: "Étudiant",
            passportNumber: "GA123456",
            passportIssueDate: new Date("2020-01-01"),
            passportExpiryDate: new Date("2030-01-01"),
            passportIssueAuthority: "Ambassade du Gabon",
            passport: {
              create: {
                type: DocumentType.PASSPORT,
                status: DocumentStatus.PENDING,
                fileUrl: "https://utfs.io/f/yMD4lMLsSKvzCwNoT5d18tkLi9WuUPrXjgdzRhvo5IVe4fbs",
                issuedAt: new Date("2020-01-01"),
                expiresAt: new Date("2030-01-01"),
                metadata: {
                  documentNumber: "GA123456",
                  issuingAuthority: "Ambassade du Gabon",
                }
              }
            },
            birthCertificate: {
              create: {
                type: DocumentType.BIRTH_CERTIFICATE,
                status: DocumentStatus.PENDING,
                fileUrl: "https://utfs.io/f/yMD4lMLsSKvzCwNoT5d18tkLi9WuUPrXjgdzRhvo5IVe4fbs",
                issuedAt: new Date("2020-01-01"),
                expiresAt: new Date("2030-01-01"),
              }
            },
            address: {
              create: {
                firstLine: "15 rue des Lilas",
                secondLine: "Apt 4B",
                city: "Paris",
                zipCode: "75003",
                country: "france"
              }
            },
            addressInGabon: {
              create: {
                address: "123 Boulevard du Bord de Mer",
                district: "Quartier Louis",
                city: "Libreville"
              }
            },
            emergencyContact: {
              create: {
                fullName: "Jane Doe",
                relationship: "Sœur",
                phone: "+33687654321"
              }
            },
          }
        }
      }
    })

    console.log('✅ Seeding terminé avec succès!')
    console.log('Données créées:', {
      consulat: { id: consulat.id, name: consulat.name },
      user: { id: user.id, email: user.email },
      manager: { id: manager.id, email: manager.email }
    })

    for (let i = 0; i < PROFILE_COUNT; i++) {
      const user = await createSampleProfile(i)
      await prisma.consulate.update({
        where: { id: consulat.id },
        data: {
          users: {
            connect: {
              id: user.id
            }
          }
        }
      })

      console.log(`Created profile ${i + 1}/${PROFILE_COUNT}`)
    }

  } catch (error) {
    console.error('❌ Erreur pendant le seeding:', error)
    await prisma.$disconnect()
    throw error
  }
}


async function createSampleProfile(index: number): Promise<User> {
  const now = new Date()
  const status = [RequestStatus.DRAFT, RequestStatus.SUBMITTED][index % 2]

  // Créer un utilisateur
  const user = await prisma.user.create({
    data: {
      email: `itoutouberny+${index}@gmail.com`,
      phone: `+3361234${(56789 + index).toString().padStart(5, '0')}`,
      name: `User ${index}`,
      emailVerified: now,
      phoneVerified: now,
    }
  })

  // Documents communs
  const commonDocData = {
    userId: user.id,
    status: DocumentStatus.PENDING,
    issuedAt: subDays(now, 365),
    expiresAt: addDays(now, 365),
  }

  // Créer les documents
  const passport = await prisma.userDocument.create({
    data: {
      ...commonDocData,
      type: 'PASSPORT',
      fileUrl: 'https://utfs.io/f/yMD4lMLsSKvzCwNoT5d18tkLi9WuUPrXjgdzRhvo5IVe4fbs',
      metadata: {
        documentNumber: `PA${index}123456`,
        issuingAuthority: 'Préfecture de Police',
      }
    }
  })

  const birthCertificate = await prisma.userDocument.create({
    data: {
      ...commonDocData,
      type: 'BIRTH_CERTIFICATE',
      fileUrl: 'https://utfs.io/f/yMD4lMLsSKvzCwNoT5d18tkLi9WuUPrXjgdzRhvo5IVe4fbs',
    }
  })

  const residencePermit = await prisma.userDocument.create({
    data: {
      ...commonDocData,
      type: 'RESIDENCE_PERMIT',
      fileUrl: 'https://utfs.io/f/yMD4lMLsSKvzCwNoT5d18tkLi9WuUPrXjgdzRhvo5IVe4fbs',
    }
  })

  const addressProof = await prisma.userDocument.create({
    data: {
      ...commonDocData,
      type: 'PROOF_OF_ADDRESS',
      fileUrl: 'https://utfs.io/f/yMD4lMLsSKvzCwNoT5d18tkLi9WuUPrXjgdzRhvo5IVe4fbs',
    }
  })

  // Créer l'adresse
  const address = await prisma.address.create({
    data: {
      firstLine: `${index} rue de la Paix`,
      secondLine: `Apt ${index}`,
      city: SAMPLE_CITIES[index % SAMPLE_CITIES.length],
      zipCode: `750${(index % 20).toString().padStart(2, '0')}`,
      country: 'france'
    }
  })

  // Créer le profil
  await prisma.profile.create({
    data: {
      userId: user.id,
      firstName: `Jon-${index}`,
      lastName: `Doe-${index}`,
      gender: index % 2 === 0 ? Gender.MALE : Gender.FEMALE,
      birthDate: subDays(now, 10000 + index * 100).toISOString(),
      birthPlace: SAMPLE_CITIES[index % SAMPLE_CITIES.length],
      birthCountry: 'gabon',
      nationality: SAMPLE_NATIONALITIES[index % SAMPLE_NATIONALITIES.length],
      maritalStatus: Object.values(MaritalStatus)[index % Object.values(MaritalStatus).length],
      workStatus: Object.values(WorkStatus)[index % Object.values(WorkStatus).length],
      acquisitionMode: Object.values(NationalityAcquisition)[index % Object.values(NationalityAcquisition).length],
      identityPicture: 'https://utfs.io/f/yMD4lMLsSKvznrMiNYCVFA1bUs9ixXJIwYke3aRG6qo42vpB',

      // Documents
      passportId: passport.id,
      birthCertificateId: birthCertificate.id,
      residencePermitId: residencePermit.id,
      addressProofId: addressProof.id,

      // Informations passeport
      passportNumber: `PA${index}123456`,
      passportIssueDate: subDays(now, 365),
      passportExpiryDate: addDays(now, 365),
      passportIssueAuthority: 'Préfecture de Police',

      // Contact
      phone: `+3361234${(56789 + index).toString().padStart(5, '0')}`,
      email: `itoutouberny+${index}@gmail.com`,
      addressId: address.id,

      // Adresse au Gabon
      addressInGabon: {
        create: {
          address: `${index} Boulevard du Bord de Mer`,
          district: 'Louis',
          city: 'Libreville'
        }
      },

      // Informations professionnelles
      profession: SAMPLE_PROFESSIONS[index % SAMPLE_PROFESSIONS.length],
      employer: SAMPLE_EMPLOYERS[index % SAMPLE_EMPLOYERS.length],
      employerAddress: `${index} rue des Entreprises`,
      activityInGabon: 'Ancien étudiant à l\'UOB',

      // Contact d'urgence
      emergencyContact: {
        create: {
          fullName: `Contact${index}`,
          relationship: 'Frère/Sœur',
          phone: `+3361234${(99999 - index).toString().padStart(5, '0')}`
        }
      },

      // Statut
      status,
      submittedAt: status === RequestStatus.SUBMITTED ? subDays(now, 1) : null,
    }
  })

  return user
}

// Fonction utilitaire pour ajouter des minutes à une date
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000)
}

// Exécution avec gestion d'erreur simplifiée
main().catch((error) => {
  console.error('Fatal error:', error)
})