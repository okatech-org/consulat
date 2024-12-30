import { addDays, setHours, setMinutes } from 'date-fns'
import {
  PrismaClient,
  UserRole,
  DocumentType,
  Gender,
  MaritalStatus,
  WorkStatus,
  NationalityAcquisition,
  DocumentStatus,
  FamilyLink,
} from '@prisma/client'

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
    await prisma.phone.deleteMany()

    // Créer le consulat
    const consulat = await prisma.consulate.create({
      data: {
        name: "Ambassade du Gabon en France",
        email: "contact@ambagabon-fr.org",
        phone: {
          create: {
            number: "+33145000000",
            countryCode: "+33"
          }
        },
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

    await prisma.user.create({
      data: {
        email: 'itoutouberny+manager@gmail.com',
        phone: {
          create: {
            number: '+33612250393',
            countryCode: '+33'
          }
        },
        name: 'Manager Consulaire',
        role: UserRole.ADMIN,
        emailVerified: new Date(),
        phoneVerified: new Date(),
        consulate:{
          connect: {
            id: consulat.id
          }
        }
      },
    })
    await prisma.user.create({
      data: {
        email: 'iasted+m@me.com',
        name: 'Asted Manager',
        role: UserRole.RESPONSIBLE,
        emailVerified: new Date(),
        consulate:{
          connect: {
            id: consulat.id
          }
        }
      },
    })
    await prisma.user.create({
      data: {
        email: 'iasted+a@me.com',
        name: 'Asted Admin',
        role: UserRole.ADMIN,
        emailVerified: new Date(),
        consulate:{
          connect: {
            id: consulat.id
          }
        }
      },
    })
    await prisma.user.create({
      data: {
        email: 'iasted+sa@me.com',
        name: 'Asted Super Admin',
        role: UserRole.SUPER_ADMIN,
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

    const [phone1, phone2] = await Promise.all([
      prisma.phone.create({ data: { number: '0612250393', countryCode: '+33' } }),
      prisma.phone.create({ data: { number: '612250393', countryCode: '+33' } }),
    ])

    // 2. Créer l'utilisateur avec son profil
    console.log('Création de l\'utilisateur et du profil...')
    await prisma.user.create({
      data: {
        email: "itoutouberny@gmail.com",
        phone: {
          connect: {
            id: phone1.id
          }
        },
        name: "Berny Itoutou",
        role: UserRole.USER,
        emailVerified: new Date(),
        phoneVerified: new Date(),
        lastLogin: new Date(),
        consulate: {
          connect: {
            id: consulat.id
          }
        },
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
            phone: {
              connect: {
                id: phone1.id
              }
            },
            maritalStatus: MaritalStatus.SINGLE,
            workStatus: WorkStatus.EMPLOYEE,
            acquisitionMode: NationalityAcquisition.BIRTH,
            identityPicture: {
              create: {
                type: DocumentType.IDENTITY_PHOTO,
                status: DocumentStatus.PENDING,
                fileUrl: "https://utfs.io/f/yMD4lMLsSKvznrMiNYCVFA1bUs9ixXJIwYke3aRG6qo42vpB",
                issuedAt: new Date("2020-01-01"),
                expiresAt: new Date("2030-01-01"),
              }
            },
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
                relationship: FamilyLink.SPOUSE,
                phone: {
                  create: {
                    number: "612343678",
                    countryCode: "+33"
                  }
                }
              }
            },
          }
        }
      }
    })
    await prisma.user.create({
      data: {
        email: "kamauitoutou@gmail.com",
        phone: {
          connect: {
            id: phone2.id
          }
        },
        name: "Kamau François",
        role: UserRole.USER,
        emailVerified: new Date(),
        phoneVerified: new Date(),
        lastLogin: new Date(),
        consulate: {
          connect: {
            id: consulat.id
          }
        },
        profile: {
          create: {
            firstName: "Kamau",
            lastName: "François",
            gender: Gender.MALE,
            birthDate: "1990-01-01",
            birthPlace: "Paris",
            birthCountry: "france",
            nationality: "gabon",
            email: "kamauitoutou@gmail.com",
            phone: {
              connect: {
                id: phone2.id
              }
            },
            maritalStatus: MaritalStatus.SINGLE,
            workStatus: WorkStatus.EMPLOYEE,
            acquisitionMode: NationalityAcquisition.BIRTH,
            identityPicture: {
              create: {
                type: DocumentType.IDENTITY_PHOTO,
                status: DocumentStatus.PENDING,
                fileUrl: "https://utfs.io/f/yMD4lMLsSKvznrMiNYCVFA1bUs9ixXJIwYke3aRG6qo42vpB",
                issuedAt: new Date("2020-01-01"),
                expiresAt: new Date("2030-01-01"),
              }
            },
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
                relationship: FamilyLink.OTHER,
                phone: {
                  create: {
                    number: "642345678",
                    countryCode: "+33"
                  }
                }
              }
            },
          }
        }
      }
    })

  } catch (error) {
    console.error('❌ Erreur pendant le seeding:', error)
    await prisma.$disconnect()
    throw error
  }
}

// Fonction utilitaire pour ajouter des minutes à une date
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000)
}

// Exécution avec gestion d'erreur simplifiée
main().catch((error) => {
  console.error('Fatal error:', error)
})