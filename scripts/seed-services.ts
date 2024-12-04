import { PrismaClient, ConsularServiceType, DocumentType } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Seeding consular services...')

    // Supprimer les services existants
    await prisma.consularService.deleteMany()

    // 1. Demande de passeport
    await prisma.consularService.create({
      data: {
        type: ConsularServiceType.PASSPORT_REQUEST,
        title: "Demande de passeport",
        description: "Demande de passeport biométrique pour les ressortissants gabonais",
        estimatedTime: "4-6 semaines",
        price: 100,
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
              title: "Informations personnelles",
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "reason",
                  type: "select",
                  label: "Motif de la demande",
                  required: true,
                  options: [{
                    value: "RENEWAL",
                    label: "Renouvellement"
                  }, {
                    value: "LOSS",
                    label: "Perte"
                  }, {
                    value: "THEFT",
                    label: "Vol"
                  }]
                },
                {
                  name: "passportNumber",
                  type: "text",
                  label: "Numéro du passeport précédent",
                  required: false
                }
              ])
            },
            {
              order: 2,
              title: "Rendez-vous",
              description: "Choisissez une date pour le dépôt de vos documents",
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "appointmentDate",
                  type: "date",
                  label: "Date du rendez-vous",
                  required: true
                }
              ])
            }
          ]
        }
      }
    })

    // 2. Carte consulaire
    await prisma.consularService.create({
      data: {
        type: ConsularServiceType.CONSULAR_CARD,
        title: "Carte consulaire",
        description: "Demande de carte consulaire pour les ressortissants gabonais",
        estimatedTime: "1-2 semaines",
        price: 50,
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
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "phoneGabon",
                  type: "tel",
                  label: "Numéro de téléphone au Gabon",
                  required: false
                },
                {
                  name: "emergencyContact",
                  type: "text",
                  label: "Contact d'urgence",
                  required: true
                }
              ])
            }
          ]
        }
      }
    })

    // 3. Déclaration de naissance
    await prisma.consularService.create({
      data: {
        type: ConsularServiceType.BIRTH_REGISTRATION,
        title: "Déclaration de naissance",
        description: "Enregistrement d'une naissance auprès du consulat",
        estimatedTime: "2-3 semaines",
        requiredDocuments: [
          DocumentType.BIRTH_CERTIFICATE,
          DocumentType.PROOF_OF_ADDRESS,
          DocumentType.MARRIAGE_CERTIFICATE
        ],
        steps: {
          create: [
            {
              order: 1,
              title: "Informations sur l'enfant",
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "birthPlace",
                  type: "text",
                  label: "Lieu de naissance",
                  required: true
                },
                {
                  name: "birthDate",
                  type: "date",
                  label: "Date de naissance",
                  required: true
                }
              ])
            },
            {
              order: 2,
              title: "Informations sur les parents",
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

    // 4. Enregistrement de mariage
    await prisma.consularService.create({
      data: {
        type: ConsularServiceType.MARRIAGE_REGISTRATION,
        title: "Enregistrement de mariage",
        description: "Enregistrement d'un mariage auprès du consulat",
        estimatedTime: "3-4 semaines",
        requiredDocuments: [
          DocumentType.BIRTH_CERTIFICATE,
          DocumentType.IDENTITY_CARD,
          DocumentType.PROOF_OF_ADDRESS
        ],
        steps: {
          create: [
            {
              order: 1,
              title: "Informations sur les époux",
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "marriageDate",
                  type: "date",
                  label: "Date du mariage",
                  required: true
                },
                {
                  name: "marriagePlace",
                  type: "text",
                  label: "Lieu du mariage",
                  required: true
                },
                {
                  name: "matrimonialRegime",
                  type: "select",
                  label: "Régime matrimonial",
                  required: true,
                  options: ["COMMUNAUTE", "SEPARATION", "PARTICIPATION"]
                }
              ])
            }
          ]
        }
      }
    })

    // 5. Déclaration de décès
    await prisma.consularService.create({
      data: {
        type: ConsularServiceType.DEATH_REGISTRATION,
        title: "Déclaration de décès",
        description: "Enregistrement d'un décès auprès du consulat",
        estimatedTime: "1-2 semaines",
        requiredDocuments: [
          DocumentType.DEATH_CERTIFICATE,
          DocumentType.PROOF_OF_ADDRESS
        ],
        steps: {
          create: [
            {
              order: 1,
              title: "Informations sur le défunt",
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "deathDate",
                  type: "date",
                  label: "Date du décès",
                  required: true
                },
                {
                  name: "deathPlace",
                  type: "text",
                  label: "Lieu du décès",
                  required: true
                },
                {
                  name: "deathCause",
                  type: "text",
                  label: "Cause du décès",
                  required: true
                }
              ])
            },
            {
              order: 2,
              title: "Informations du déclarant",
              isRequired: true,
              fields: JSON.stringify([
                {
                  name: "declarantRelation",
                  type: "select",
                  label: "Lien avec le défunt",
                  required: true,
                  options: ["SPOUSE", "CHILD", "PARENT", "SIBLING", "OTHER"]
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