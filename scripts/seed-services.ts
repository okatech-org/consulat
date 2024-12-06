import { PrismaClient, ConsularServiceType, DocumentType, ServiceStepType } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Seeding consular services...')

    // Supprimer les services existants
    await prisma.consularService.deleteMany()

    // 1. Demande de carte consulaire (simple)
    await prisma.consularService.create({
      data: {
        type: ConsularServiceType.CONSULAR_CARD,
        title: "Demande de carte consulaire",
        description: "Demande de carte consulaire pour les ressortissants gabonais",
        estimatedTime: "1-2 semaines",
        price: 50,
        requiresAppointment: false,
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
              title: "Informations de contact",
              description: "Vos coordonnées actuelles",
              stepType: ServiceStepType.FORM,
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "phone",
                  type: "tel",
                  label: "Numéro de téléphone",
                  required: true
                },
                {
                  name: "email",
                  type: "email",
                  label: "Adresse email",
                  required: true
                }
              ])
            }
          ]
        }
      }
    })

    // 2. Demande de passeport (avec rendez-vous)
    await prisma.consularService.create({
      data: {
        type: ConsularServiceType.PASSPORT_REQUEST,
        title: "Demande de passeport",
        description: "Demande de passeport biométrique",
        estimatedTime: "4-6 semaines",
        price: 100,
        requiresAppointment: true,
        appointmentDuration: 30,
        requiredDocuments: [
          DocumentType.IDENTITY_PHOTO,
          DocumentType.BIRTH_CERTIFICATE,
          DocumentType.PROOF_OF_ADDRESS,
          DocumentType.NATIONALITY_CERTIFICATE
        ],
        steps: {
          create: [
            {
              order: 1,
              title: "Motif de la demande",
              description: "Informations sur votre demande",
              stepType: ServiceStepType.FORM,
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "reason",
                  type: "select",
                  label: "Motif de la demande",
                  required: true,
                  options: [
                    { value: "FIRST_REQUEST", label: "Première demande" },
                    { value: "RENEWAL", label: "Renouvellement" },
                    { value: "LOSS", label: "Perte" },
                    { value: "THEFT", label: "Vol" }
                  ]
                },
                {
                  name: "previousPassportNumber",
                  type: "text",
                  label: "Numéro du passeport précédent",
                  required: false
                }
              ])
            }
          ]
        }
      }
    })

    // 3. Déclaration de naissance (formulaire complexe)
    await prisma.consularService.create({
      data: {
        type: ConsularServiceType.BIRTH_REGISTRATION,
        title: "Déclaration de naissance",
        description: "Enregistrement d'une naissance auprès du consulat",
        estimatedTime: "2-3 semaines",
        price: 0,
        requiresAppointment: false,
        requiredDocuments: [
          DocumentType.BIRTH_CERTIFICATE,
          DocumentType.MARRIAGE_CERTIFICATE,
          DocumentType.PROOF_OF_ADDRESS
        ],
        steps: {
          create: [
            {
              order: 1,
              title: "Informations sur l'enfant",
              description: "État civil de l'enfant",
              stepType: ServiceStepType.FORM,
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "childFirstName",
                  type: "text",
                  label: "Prénom(s) de l'enfant",
                  required: true
                },
                {
                  name: "childLastName",
                  type: "text",
                  label: "Nom de l'enfant",
                  required: true
                },
                {
                  name: "birthDate",
                  type: "date",
                  label: "Date de naissance",
                  required: true
                },
                {
                  name: "birthPlace",
                  type: "text",
                  label: "Lieu de naissance",
                  required: true
                }
              ])
            },
            {
              order: 2,
              title: "Informations sur les parents",
              description: "État civil des parents",
              stepType: ServiceStepType.FORM,
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "fatherNationality",
                  type: "text",
                  label: "Nationalité du père",
                  required: true
                },
                {
                  name: "motherNationality",
                  type: "text",
                  label: "Nationalité de la mère",
                  required: true
                }
              ])
            }
          ]
        }
      }
    })

    // 4. Certificat de capacité juridique (simple avec rendez-vous)
    await prisma.consularService.create({
      data: {
        type: ConsularServiceType.CONSULAR_REGISTRATION,
        title: "Certificat de capacité juridique",
        description: "Attestation de capacité juridique pour les ressortissants gabonais",
        estimatedTime: "1-2 semaines",
        price: 25,
        requiresAppointment: true,
        appointmentDuration: 15,
        requiredDocuments: [
          DocumentType.PASSPORT,
          DocumentType.BIRTH_CERTIFICATE
        ],
        optionalDocuments: [
          DocumentType.NATIONALITY_CERTIFICATE
        ],
        steps: {
          create: [
            {
              order: 1,
              title: "Motif de la demande",
              description: "Usage prévu du certificat",
              stepType: ServiceStepType.FORM,
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "purpose",
                  type: "textarea",
                  label: "Motif de la demande",
                  required: true,
                  placeholder: "Précisez l'usage prévu du certificat"
                }
              ])
            }
          ]
        }
      }
    })

    console.log('✅ Seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()