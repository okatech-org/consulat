import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Configuration pour un Certificat de Coutume
  const certificatConfig = {
    document: {
      title: 'Certificat de Coutume',
      author: 'Consulat Général de la République du Gabon',
      creator: 'admin@consulatdugabon.fr',
    },
    fonts: [
      {
        family: 'Times-Roman',
        src: 'https://fonts.googleapis.com/css2?family=Tinos&display=swap',
      },
      {
        family: 'Times-Bold',
        src: 'https://fonts.googleapis.com/css2?family=Tinos:wght@700&display=swap',
      },
    ],
    children: [
      {
        id: 'page1',
        element: 'Page',
        props: {
          size: 'A4',
          orientation: 'portrait',
          style: {
            paddingTop: 35,
            paddingBottom: 65,
            paddingHorizontal: 35,
          },
        },
        children: [
          // En-tête
          {
            id: 'header',
            element: 'View',
            props: {
              style: {
                marginBottom: 20,
                display: 'flex',
                justifyContent: 'center',
                textAlign: 'center',
              },
            },
            children: [
              {
                id: 'logo',
                element: 'Image',
                props: {
                  source:
                    'https://rbvj2i3urx.ufs.sh/f/H4jCIhEWEyOi8n6yYJ4A70TedPrtpy34l6WLECizvqwZDVH1',
                  style: {
                    width: 70,
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    opacity: 0.5,
                  },
                },
              },
              {
                id: 'title1',
                element: 'Text',
                props: {
                  style: {
                    fontSize: 11,
                    fontFamily: 'Times-Bold',
                    textAlign: 'center',
                    marginBottom: 5,
                  },
                },
                content: 'CONSULAT GENERAL DE LA REPUBLIQUE DU GABON',
              },
              {
                id: 'title2',
                element: 'Text',
                props: {
                  style: {
                    fontSize: 11,
                    fontFamily: 'Times-Bold',
                    textAlign: 'center',
                    marginBottom: 10,
                  },
                },
                content: 'PRÈS LA RÉPUBLIQUE FRANÇAISE',
              },
              {
                id: 'title3',
                element: 'Text',
                props: {
                  style: {
                    fontSize: 11,
                    fontFamily: 'Times-Bold',
                    textAlign: 'center',
                    marginBottom: 10,
                    paddingBottom: 5,
                  },
                },
                content: 'LE CONSUL GÉNÉRAL',
              },
              {
                id: 'titleNumber',
                element: 'Text',
                props: {
                  style: {
                    fontSize: 11,
                    textAlign: 'left',
                    marginVertical: 15,
                  },
                },
                content: 'N°{{number}}/CGGF/CG/C/25',
              },
            ],
          },

          // Titre du document
          {
            id: 'documentTitle',
            element: 'Text',
            props: {
              style: {
                fontSize: 14,
                fontFamily: 'Times-Bold',
                textAlign: 'center',
                marginVertical: 20,
                textDecoration: 'underline',
              },
            },
            content: 'CERTIFICAT DE COUTUME',
          },

          // Sous-titre
          {
            id: 'subtitle',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                fontFamily: 'Times-Bold',
                textAlign: 'center',
                marginBottom: 20,
              },
            },
            content:
              'ÉNONCÉ CI-DESSOUS LES ARTICLES DU CODE CIVIL GABONAIS RELATIFS AU MARIAGE.',
          },

          // Introduction
          {
            id: 'intro',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                textAlign: 'justify',
                marginBottom: 15,
              },
            },
            content:
              'Je soussigné, Consul Général de la République Gabonaise en France, atteste par la présente ce qui suit concernant le mariage de :',
          },

          // Information de la personne
          {
            id: 'personInfo',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                fontFamily: 'Times-Bold',
                marginVertical: 15,
              },
            },
            content: '{{civilite}} : {{nom}} {{prenom}}',
          },

          // Article 219 introduction
          {
            id: 'article219Intro',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                marginBottom: 10,
              },
            },
            content:
              "Le Code civil Gabonais stipule en son premier alinéa de l'article 219 :",
          },

          // Article 219 contenu 1
          {
            id: 'article219Content1',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                marginLeft: 20,
                marginBottom: 10,
                textAlign: 'justify',
              },
            },
            content:
              "« Le mariage ne peut être célébré avant la publication des bans faite, à la requête des futurs époux, à la Mairie ou siège du Centre d'état civil dans laquelle ou lequel, le mariage doit être célébré ».",
          },

          // Article 219 contenu 2
          {
            id: 'article219Content2',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                marginBottom: 10,
                textAlign: 'justify',
              },
            },
            content:
              "Les modalités de la publication sont consignées dans le deuxième alinéa de l'article 219 précité :",
          },

          // Article 219 contenu 3
          {
            id: 'article219Content3',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                marginLeft: 20,
                marginBottom: 10,
                textAlign: 'justify',
              },
            },
            content:
              "« L'Officier d'État Civil procède à cette publication par voie d'affichage apposée à la porte de la Mairie ou au siège du Centre d'État Civil, dans lequel le mariage doit être célébré ».",
          },

          // Article 223 introduction
          {
            id: 'article223Intro',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                marginBottom: 10,
                textAlign: 'justify',
              },
            },
            content:
              "S'agissant des délais de publication, l'article 223 du Code civil Gabonais énonce :",
          },

          // Article 223 contenu
          {
            id: 'article223Content',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                marginLeft: 20,
                marginBottom: 10,
                textAlign: 'justify',
              },
            },
            content:
              "« L'affiche mentionnée à l'alinéa premier de l'article 219, énoncera à peine de nullité les noms, prénoms, professions, domicile et résidence des futurs époux ainsi que l'option du mariage monogamique ou polygamique et le régime matrimonial choisis. Elle restera apposée pendant dix jours (10) et le mariage ne pourra être célébré avant le dixième jour depuis et non compris celui de la publication. Si l'affichage est interrompu avant l'expiration de ce délai, il en est fait mention sur l'affiche qui aura cessé d'être apposée ».",
          },

          // Article 224 titre
          {
            id: 'article224Title',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                fontFamily: 'Times-Bold',
                marginBottom: 10,
              },
            },
            content: "L'article 224 du code Civil Gabonais ajoute :",
          },

          // Article 224 contenu
          {
            id: 'article224Content',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                marginLeft: 20,
                marginBottom: 10,
                textAlign: 'justify',
              },
            },
            content:
              "« Si le mariage n'a pas été célébré dans les trois mois à compter de l'expiration du délai de la publication, il ne pourra être célébré qu'après une nouvelle publication ».",
          },

          // Article 492 titre
          {
            id: 'article492Title',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                fontFamily: 'Times-Bold',
                marginBottom: 10,
              },
            },
            content:
              "L'article 492 du Code Civil Gabonais stipule à propos de la minorité (nubilité) et de la majorité :",
          },

          // Article 492 contenu
          {
            id: 'article492Content',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                marginLeft: 20,
                marginBottom: 10,
                textAlign: 'justify',
              },
            },
            content:
              "« Le mineur est l'individu de l'un ou l'autre sexe qui n'a point encore l'âge de 21 ans accomplis ».",
          },

          // Conditions d'âge introduction
          {
            id: 'conditionsAgeIntro',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                marginBottom: 10,
                textAlign: 'justify',
              },
            },
            content: "Concernant les conditions d'âge proprement dites,",
          },

          // Article 203 titre
          {
            id: 'article203Title',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                fontFamily: 'Times-Bold',
                marginBottom: 10,
              },
            },
            content: "L'article 203 du code Civil Gabonais dispose :",
          },

          // Article 203 contenu
          {
            id: 'article203Content',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                marginLeft: 20,
                marginBottom: 10,
                textAlign: 'justify',
              },
            },
            content:
              "« L'homme, avant dix-huit ans révolus, la femme avant quinze ans révolus, ne peuvent contracter mariage. Néanmoins, le Président de la République ou, à défaut, le Président de la Cour Suprême, peut accorder des dispenses d'âge pour des motifs graves ». Quant, enfin, à l'âge à partir duquel l'intervention des ascendants ou autres n'est plus requise.",
          },

          // Article 205 titre
          {
            id: 'article205Title',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                fontFamily: 'Times-Bold',
                marginBottom: 10,
              },
            },
            content: "L'article 205 du code Civil Gabonais précise :",
          },

          // Article 205 contenu
          {
            id: 'article205Content',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                marginLeft: 20,
                marginBottom: 10,
                textAlign: 'justify',
              },
            },
            content:
              "« Même si les conditions exigées par l'article 203 sont réunies, le jeune homme ou la jeune fille qui n'a pas atteint l'âge de 21 ans révolus ne peut contracter mariage sans le consentement de ses père et mère. En cas de refus d'un des père et mère, le consentement d'un seul des deux suffisent. En cas de divorce ou de séparation de corps, le consentement de celui qui a la garde de l'enfant sera toujours exigé »",
          },

          // Attestation additionnelle
          {
            id: 'additionalAttestation',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                marginBottom: 15,
                textAlign: 'justify',
              },
            },
            content:
              "Par ailleurs, nous attestons par la présente que l'intéressé(e) n'est pas placé(e)sous un régime de protection juridique des majeurs au Gabon et a la capacité juridique de conclure un contrat.",
          },

          // Formule finale
          {
            id: 'finalFormula',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                fontFamily: 'Times-Bold',
                marginBottom: 30,
                textAlign: 'justify',
              },
            },
            content:
              'En foi de quoi, la présente attestation est établie et délivrée pour servir et valoir ce que de droit.',
          },

          // Date et lieu
          {
            id: 'datePlace',
            element: 'Text',
            props: {
              style: {
                fontSize: 11,
                textAlign: 'right',
                marginBottom: 50,
              },
            },
            content: 'Fait à {{lieu}}, le {{date}}',
          },

          // Pied de page
          {
            id: 'footer',
            element: 'Text',
            fixed: true,
            props: {
              style: {
                position: 'absolute',
                bottom: 30,
                left: 0,
                right: 0,
                fontSize: 9,
                textAlign: 'center',
              },
            },
            content:
              '26 bis, avenue Raphaël 75016 Paris / Secrétariat : 01.42.99.68.62\ncontact@consulatgabonfrance.com',
          },
        ],
      },
    ],
  };

  try {
    console.log('🌱 Starting seed...');

    await prisma.documentTemplate.update({
      where: {
        id: 'cmavjl3k40001sfeny27hs1yq',
      },
      data: {
        name: 'Certificat de Coutume - France',
        content: JSON.stringify(certificatConfig),
      },
    });

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
