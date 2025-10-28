export interface KnowledgeBase {
  description: string;
  version: string;
  last_updated: string;
  categories: {
    id: number;
    name: string;
    instructions: {
      id: number;
      question: string;
      response: string;
      documentsJoints?: string[];
    }[];
  }[];
  ressources_officielles: {
    name: string;
    url: string;
    phone?: string;
    phone_emergency?: string;
    address?: string;
    email?: string;
    schedule?: string;
  }[];
}

export const knowledgeBase: KnowledgeBase = {
  description:
    'Base de connaissances complète pour un ChatBot Consulaire du Gabon en France',
  version: '1.1',
  last_updated: '2025-03-21',
  categories: [
    {
      id: 1,
      name: 'Citoyens Gabonais en France',
      instructions: [
        {
          id: 1.1,
          question: 'Comment renouveler mon passeport gabonais ?',
          response:
            "Pour renouveler votre passeport gabonais, vous devez prendre rendez-vous sur le site de la DGDI, fournir les documents suivants : ancien passeport, photos d'identité, justificatif de résidence, et payer les frais consulaires. Consultez [le site de la DGDI](https://dgdi.ga/) pour plus de détails.",
          documentsJoints: ['https://dgdi.ga/images/NDP-1.pdf'],
        },
        {
          id: 1.2,
          question: 'Comment obtenir une carte consulaire ?',
          response:
            "La carte consulaire est délivrée sur présentation d'un passeport valide, d'un justificatif de résidence et de photos d'identité. Prenez rendez-vous en ligne sur [le site du consulat](https://consulatdugabon.fr/).",
        },
        {
          id: 1.3,
          question: 'Que faire en cas de perte de mon passeport ?',
          response:
            'En cas de perte ou de vol de votre passeport, contactez immédiatement le consulat pour obtenir un laisser-passer temporaire. Vous devrez fournir une déclaration de perte et une copie de votre ancien passeport si disponible.',
        },
        {
          id: 1.4,
          question: 'Comment obtenir un acte de naissance gabonais ?',
          response:
            'Pour obtenir un acte de naissance gabonais, vous devez faire une demande auprès du consulat en fournissant une copie de votre passeport et les informations relatives à votre naissance (lieu, date, nom des parents).',
        },
        {
          id: 1.5,
          question: 'Comment légaliser un document pour le Gabon ?',
          response:
            'Pour légaliser un document, vous devez le présenter au consulat avec une copie de votre passeport. Le consulat apposera un cachet de légalisation pour attester de la validité du document.',
        },
      ],
    },
    {
      id: 2,
      name: 'Citoyens Gabonais souhaitant venir en France',
      instructions: [
        {
          id: 2.1,
          question: 'Comment obtenir un visa pour la France ?',
          response:
            "Pour obtenir un visa pour la France, vous devez déposer une demande auprès de l'ambassade de France au Gabon. Les documents requis incluent un passeport valide, une lettre d'invitation, un justificatif de ressources financières et une assurance voyage. Consultez [le site de l'ambassade de France au Gabon](https://ga.ambafrance.org/) pour plus d'informations.",
        },
        {
          id: 2.2,
          question: 'Quels sont les types de visas disponibles ?',
          response:
            "Les types de visas incluent le visa touristique, le visa d'affaires, le visa étudiant et le visa de travail. Chaque visa a des conditions spécifiques. Renseignez-vous sur [le site de l'ambassade de France au Gabon](https://ga.ambafrance.org/).",
        },
      ],
    },
    {
      id: 3,
      name: 'Étrangers souhaitant visiter ou résider au Gabon',
      instructions: [
        {
          id: 3.1,
          question: 'Comment obtenir un visa pour le Gabon ?',
          response:
            "Pour obtenir un visa pour le Gabon, vous devez déposer une demande auprès du consulat ou de l'ambassade du Gabon dans votre pays. Les documents requis incluent un passeport valide, une lettre d'invitation, un justificatif de ressources financières et une assurance voyage. Consultez [le site du consulat du Gabon](https://consulatdugabon.fr/) pour plus de détails.",
        },
        {
          id: 3.2,
          question: 'Quels sont les types de visas pour le Gabon ?',
          response:
            "Les types de visas incluent le visa touristique, le visa d'affaires, le visa étudiant et le visa de travail. Chaque visa a des conditions spécifiques. Renseignez-vous sur [le site du consulat du Gabon](https://consulatdugabon.fr/).",
        },
        {
          id: 3.3,
          question: 'Quelles sont les formalités pour résider au Gabon ?',
          response:
            "Pour résider au Gabon, vous devez obtenir un permis de séjour. Les documents requis incluent un passeport valide, un visa de long séjour, un justificatif de ressources financières et un certificat médical. Consultez [le site du consulat du Gabon](https://consulatdugabon.fr/) pour plus d'informations.",
        },
      ],
    },
    {
      id: 4,
      name: 'Droit Civil et Juridique',
      instructions: [
        {
          id: 4.1,
          question: 'Quelles sont les règles de succession au Gabon ?',
          response:
            'Au Gabon, les règles de succession sont régies par le Code Civil gabonais. Les biens mobiliers sont soumis à la loi du dernier domicile du défunt, tandis que les biens immobiliers sont régis par la loi de leur situation. Les héritiers doivent respecter les règles de dévolution légale, sauf en cas de testament valide. Consultez [le Code Civil du Gabon](https://www.legigabon.com) pour plus de détails.',
        },
        {
          id: 4.2,
          question: 'Comment le mariage est-il réglementé au Gabon et en France ?',
          response:
            "Au Gabon, le mariage est régi par le Code Civil gabonais, qui prévoit des conditions spécifiques pour la célébration et l'enregistrement. En France, le mariage est soumis au Code Civil français, qui exige une publication des bans et une célébration devant un officier d'état civil. Les mariages mixtes doivent respecter les lois des deux pays. Pour plus d'informations, consultez [le Code Civil du Gabon](https://www.legigabon.com) et [le Code Civil français](https://www.legifrance.gouv.fr).",
        },
        {
          id: 4.3,
          question: 'Quelles sont les règles de filiation au Gabon ?',
          response:
            "La filiation au Gabon est régie par le Code Civil gabonais. Elle peut être légitime, naturelle ou adoptive. La reconnaissance d'un enfant est possible devant un officier d'état civil ou par acte notarié. Pour plus de détails, consultez [le Code Civil du Gabon](https://www.legigabon.com).",
        },
        {
          id: 4.4,
          question: 'Comment fonctionne le divorce au Gabon et en France ?',
          response:
            "Au Gabon, le divorce est régi par le Code Civil gabonais et peut être prononcé pour faute, consentement mutuel ou séparation de corps. En France, le Code Civil français prévoit des procédures similaires, mais avec des nuances juridiques. Les ressortissants gabonais en France peuvent choisir de divorcer selon la loi gabonaise ou française, selon leur situation. Consultez [le Code Civil du Gabon](https://www.legigabon.com) et [le Code Civil français](https://www.legifrance.gouv.fr) pour plus d'informations.",
        },
        {
          id: 4.5,
          question:
            'Quels sont les droits des enfants nés de parents gabonais en France ?',
          response:
            "Les enfants nés de parents gabonais en France ont droit à la double nationalité. Ils sont soumis aux lois françaises en matière de filiation et d'état civil, mais peuvent également être enregistrés auprès du consulat gabonais pour obtenir la nationalité gabonaise. Pour plus de détails, consultez [le Code Civil français](https://www.legifrance.gouv.fr) et [le site du consulat du Gabon](https://consulatdugabon.fr/).",
        },
        {
          id: 4.6,
          question:
            'Comment gérer une succession impliquant des biens au Gabon et en France ?',
          response:
            "En cas de succession impliquant des biens au Gabon et en France, les biens mobiliers sont soumis à la loi du dernier domicile du défunt, tandis que les biens immobiliers sont régis par la loi de leur situation. Il est recommandé de consulter un notaire ou un avocat spécialisé en droit international pour gérer ces situations complexes. Pour plus d'informations, consultez [le Code Civil du Gabon](https://www.legigabon.com) et [le Code Civil français](https://www.legifrance.gouv.fr).",
        },
      ],
    },
    {
      id: 5,
      name: 'Urgences et Assistance',
      instructions: [
        {
          id: 5.1,
          question: "Que faire en cas d'urgence médicale en France ?",
          response:
            "En cas d'urgence médicale, appelez le 15 (SAMU) ou le 112 (numéro d'urgence européen). Contactez également le consulat pour une assistance consulaire si nécessaire.",
        },
        {
          id: 5.2,
          question: "Que faire en cas d'arrestation ou de détention en France ?",
          response:
            "En cas d'arrestation, vous avez le droit de contacter votre consulat. Le consulat peut vous fournir une assistance juridique et vous aider à contacter votre famille.",
        },
        {
          id: 5.3,
          question: 'Comment obtenir une assistance en cas de crise majeure ?',
          response:
            'En cas de crise majeure (catastrophe naturelle, conflit, etc.), contactez immédiatement le consulat pour obtenir des instructions et une assistance. Le consulat peut organiser des évacuations si nécessaire.',
        },
      ],
    },
    {
      id: 6,
      name: 'Informations Générales',
      instructions: [
        {
          id: 6.1,
          question: 'Comment contacter le consulat du Gabon en France ?',
          response:
            "Vous pouvez contacter le consulat du Gabon en France par téléphone au +33 (0)1 45 00 60 60 ou par e-mail à contact@consulatdugabon.fr. L'adresse est : 4 rue Élisée Reclus, 75007 Paris, France.",
        },
        {
          id: 6.2,
          question: "Quels sont les horaires d'ouverture du consulat ?",
          response:
            'Le consulat est ouvert du lundi au vendredi, de 9h30 à 16h30. Prenez rendez-vous en ligne sur [le site du consulat](https://consulatdugabon.fr/).',
        },
        {
          id: 6.3,
          question:
            'Où puis-je trouver des informations sur les événements culturels gabonais en France ?',
          response:
            'Le consulat organise régulièrement des événements culturels. Consultez [le site du consulat](https://consulatdugabon.fr/) ou suivez leurs réseaux sociaux pour rester informé.',
        },
      ],
    },
  ],
  ressources_officielles: [
    {
      name: 'Site du Consulat du Gabon en France',
      url: 'https://consulatdugabon.fr/',
      phone: '+33189719298',
      phone_emergency: '+33189719299',
      address: '26 Bis Avenue Raphael, 75016 Paris.',
      email: 'contact@consulatdugabon.fr',
      schedule: 'Lundi à Jeudi 9H00 à 16h30. Vendredi : 9H00 à 16h00',
    },
    {
      name: 'Ambassade de France au Gabon',
      url: 'https://ambassadedugabonenfrance.com/',
      address: '26 Bis Avenue Raphael, 75016 Paris.',
      phone: '+33142996868',
      email: 'ambassade.gabonfrance@gmail.com',
    },
    {
      name: 'Ministère des Affaires Étrangères du Gabon',
      url: 'https://www.diplomatie.gouv.ga/',
    },
    {
      name: 'Code Civil du Gabon',
      url: 'https://www.legigabon.com',
    },
    {
      name: 'Code Civil français',
      url: 'https://www.legifrance.gouv.fr',
    },
  ],
};

export function formatKnowledgeBaseForContext(kb: KnowledgeBase): string {
  const formattedCategories = kb.categories
    .map(
      (category) => `
# ${category.name}

${category.instructions
  .map(
    (instruction) => `
Q: ${instruction.question}
R: ${instruction.response}
${instruction.documentsJoints ? `Documents requis: ${instruction.documentsJoints.join(', ')}` : ''}
`,
  )
  .join('\n')}
`,
    )
    .join('\n');

  const formattedResources = kb.ressources_officielles
    .map(
      (resource) => `
- ${resource.name}
  ${resource.url ? `URL: ${resource.url}` : ''}
  ${resource.phone ? `Téléphone: ${resource.phone}` : ''}
  ${resource.phone_emergency ? `Urgence: ${resource.phone_emergency}` : ''}
  ${resource.email ? `Email: ${resource.email}` : ''}
  ${resource.address ? `Adresse: ${resource.address}` : ''}
  ${resource.schedule ? `Horaires: ${resource.schedule}` : ''}
`,
    )
    .join('\n');

  return `
Base de connaissances consulaire :

${formattedCategories}

Ressources officielles :
${formattedResources}

Instructions pour l'utilisation de cette base de connaissances :
1. Utilisez ces informations comme source principale pour répondre aux questions
2. Si une question correspond exactement à une entrée, utilisez la réponse fournie
3. Si la question est similaire mais pas identique, adaptez la réponse en vous basant sur les informations disponibles
4. Si aucune information pertinente n'est trouvée, indiquez-le clairement et redirigez vers les ressources officielles appropriées
5. Incluez toujours les liens pertinents des ressources officielles dans vos réponses
`;
}

export function getKnowledgeBaseContext(): string {
  return formatKnowledgeBaseForContext(knowledgeBase);
}
