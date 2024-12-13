// scripts/seed-services.ts
import { PrismaClient, ConsularServiceType, DocumentType, ServiceStepType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Seeding consular services...')

    // Supprimer les services existants
    await prisma.consularService.deleteMany()

    // 1. Tenant lieu de passeport
    await prisma.consularService.create({
      data: {
        type: ConsularServiceType.PASSPORT_REQUEST,
        title: "Tenant lieu de passeport",
        description: "Document provisoire permettant aux ressortissants gabonais résidant en France de régulariser leur situation administrative en l'absence de passeport valide",
        estimatedTime: "1-2 semaines",
        price: 0,
        requiresAppointment: true,
        appointmentDuration: 30,
        requiredDocuments: [
          DocumentType.CONSULAR_CARD,
          DocumentType.BIRTH_CERTIFICATE,
          DocumentType.PASSPORT,
        ],
        steps: {
          create: [
            {
              order: 1,
              title: "Informations personnelles",
              description: "Vos informations d'identité",
              stepType: ServiceStepType.FORM,
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "firstName",
                  type: "text",
                  label: "Prénom(s)",
                  required: true
                },
                {
                  name: "lastName",
                  type: "text",
                  label: "Nom",
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
              ]),
              profileFields: JSON.stringify({
                firstName: "firstName",
                lastName: "lastName",
                birthDate: "birthDate",
                birthPlace: "birthPlace"
              })
            },
            {
              order: 2,
              title: "Motif de la demande",
              description: "Raison de la demande du tenant lieu",
              stepType: ServiceStepType.FORM,
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "reason",
                  type: "select",
                  label: "Motif",
                  required: true,
                  options: [
                    { value: "LOST", label: "Perte du passeport" },
                    { value: "EXPIRED", label: "Passeport expiré" },
                    { value: "DAMAGED", label: "Passeport endommagé" }
                  ]
                },
                {
                  name: "details",
                  type: "textarea",
                  label: "Détails",
                  required: true
                }
              ])
            }
          ]
        }
      }
    })

    // 2. Acte de naissance
    await prisma.consularService.create({
      data: {
        type: ConsularServiceType.BIRTH_REGISTRATION,
        title: "Demande d'acte de naissance",
        description: "Obtention d'une copie d'acte de naissance auprès des services consulaires",
        estimatedTime: "2-3 semaines",
        price: 0,
        requiresAppointment: false,
        requiredDocuments: [
          DocumentType.IDENTITY_CARD,
          DocumentType.BIRTH_CERTIFICATE
        ],
        steps: {
          create: [
            {
              order: 1,
              title: "Informations du demandeur",
              description: "Vos informations personnelles",
              stepType: ServiceStepType.FORM,
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "firstName",
                  type: "text",
                  label: "Prénom(s)",
                  required: true
                },
                {
                  name: "lastName",
                  type: "text",
                  label: "Nom",
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
              ]),
              profileFields: JSON.stringify({
                firstName: "firstName",
                lastName: "lastName",
                birthDate: "birthDate",
                birthPlace: "birthPlace"
              })
            },
            {
              order: 2,
              title: "Informations des parents",
              description: "Informations sur vos parents",
              stepType: ServiceStepType.FORM,
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "fatherFullName",
                  type: "text",
                  label: "Nom complet du père",
                  required: true
                },
                {
                  name: "motherFullName",
                  type: "text",
                  label: "Nom complet de la mère",
                  required: true
                }
              ]),
              profileFields: JSON.stringify({
                fatherFullName: "fatherFullName",
                motherFullName: "motherFullName"
              })
            }
          ]
        }
      }
    })

    // 3. Certificat de nationalité
    await prisma.consularService.create({
      data: {
        type: ConsularServiceType.NATIONALITY_CERTIFICATE,
        title: "Certificat de nationalité",
        description: "Demande de certificat attestant de la nationalité gabonaise",
        estimatedTime: "3-4 semaines",
        price: 0,
        requiresAppointment: true,
        appointmentDuration: 30,
        requiredDocuments: [
          DocumentType.PASSPORT,
          DocumentType.BIRTH_CERTIFICATE,
          DocumentType.IDENTITY_CARD
        ],
        steps: {
          create: [
            {
              order: 1,
              title: "Informations personnelles",
              description: "Vos informations d'identité",
              stepType: ServiceStepType.FORM,
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "firstName",
                  type: "text",
                  label: "Prénom(s)",
                  required: true
                },
                {
                  name: "lastName",
                  type: "text",
                  label: "Nom",
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
                },
                {
                  name: "acquisitionMode",
                  type: "select",
                  label: "Mode d'acquisition de la nationalité",
                  required: true,
                  options: [
                    { value: "BIRTH", label: "Naissance" },
                    { value: "NATURALIZATION", label: "Naturalisation" },
                    { value: "MARRIAGE", label: "Mariage" }
                  ]
                }
              ]),
              profileFields: JSON.stringify({
                firstName: "firstName",
                lastName: "lastName",
                birthDate: "birthDate",
                birthPlace: "birthPlace",
                acquisitionMode: "acquisitionMode"
              })
            },
            {
              order: 2,
              title: "Justification",
              description: "Motif de la demande du certificat",
              stepType: ServiceStepType.FORM,
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "purpose",
                  type: "select",
                  label: "Motif de la demande",
                  required: true,
                  options: [
                    { value: "ADMINISTRATIVE", label: "Démarche administrative" },
                    { value: "EMPLOYMENT", label: "Emploi" },
                    { value: "EDUCATION", label: "Études" },
                    { value: "OTHER", label: "Autre" }
                  ]
                },
                {
                  name: "details",
                  type: "textarea",
                  label: "Précisions sur le motif",
                  required: true
                }
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
  }
}

main()