// scripts/seed-services.ts
import { PrismaClient, ConsularServiceType, DocumentType, ServiceStepType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Seeding consular services...')

    // Supprimer les services existants
    await prisma.consularService.deleteMany()

    // 1. Transcription d'acte de naissance
    await prisma.consularService.create({
      data: {
        type: ConsularServiceType.BIRTH_REGISTRATION,
        title: "Transcription d'acte de naissance",
        description: "Transcription d'un acte de naissance étranger dans les registres consulaires",
        estimatedTime: "2-3 semaines",
        price: 0,
        requiresAppointment: false,
        requiredDocuments: [
          DocumentType.BIRTH_CERTIFICATE,
          DocumentType.PASSPORT,
          DocumentType.IDENTITY_CARD
        ],
        steps: {
          create: [
            {
              order: 1,
              title: "Informations de l'enfant",
              description: "État civil de l'enfant",
              stepType: ServiceStepType.FORM,
              isRequired: true,
              fields: JSON.stringify([
                { name: "childFirstName", type: "text", label: "Prénom(s) de l'enfant", required: true },
                { name: "childLastName", type: "text", label: "Nom de l'enfant", required: true },
                { name: "birthDate", type: "date", label: "Date de naissance", required: true },
                { name: "birthPlace", type: "text", label: "Lieu de naissance", required: true }
              ])
            },
            {
              order: 2,
              title: "Informations des parents",
              description: "État civil des parents",
              stepType: ServiceStepType.FORM,
              isRequired: true,
              fields: JSON.stringify([
                { name: "fatherFullName", type: "text", label: "Nom complet du père", required: true },
                { name: "motherFullName", type: "text", label: "Nom complet de la mère", required: true }
              ])
            }
          ]
        }
      }
    })

    // 2. Demande de carte consulaire
    await prisma.consularService.create({
      data: {
        type: ConsularServiceType.CONSULAR_CARD,
        title: "Demande de carte consulaire",
        description: "Demande de carte consulaire pour les ressortissants gabonais",
        estimatedTime: "1-2 semaines",
        price: 50,
        requiresAppointment: true,
        appointmentDuration: 30,
        requiredDocuments: [
          DocumentType.IDENTITY_PHOTO,
          DocumentType.PASSPORT,
          DocumentType.PROOF_OF_ADDRESS,
          DocumentType.RESIDENCE_PERMIT
        ],
        steps: {
          create: [
            {
              order: 1,
              title: "Vérification d'identité",
              description: "Validation des informations d'identité",
              stepType: ServiceStepType.FORM,
              isRequired: true,
              fields: JSON.stringify([
                { name: "passportNumber", type: "text", label: "Numéro de passeport", required: true },
                { name: "passportExpiry", type: "date", label: "Date d'expiration du passeport", required: true }
              ])
            }
          ]
        }
      }
    })

    console.log('✅ Services seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding services:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()