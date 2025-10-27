import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions Légales | Consulat.ga',
  description:
    'Mentions légales de Consulat.ga - Informations légales et réglementaires concernant notre plateforme.',
};

export default function LegalNotice() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ Version Bêta : Consulat.ga est actuellement en phase de test pour une durée
          de 3 mois. Certaines fonctionnalités peuvent être limitées ou modifiées pendant
          cette période.
        </p>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        Mentions Légales
      </h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            1. Éditeur de la Solution
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            La solution Consulat.ga est éditée par :
          </p>
          <div className="pl-6 mb-6 text-gray-600 dark:text-gray-300">
            <p>OKA Tech</p>
            <p>SASU au capital de [montant]</p>
            <p>RCS Paris [numéro]</p>
            <p>Siège social : 59 Rue de Ponthieu, 75008 Paris, France</p>
            <p>Email : okatech@icloud.com</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            2. Directeur de la Publication
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            [Nom du Directeur]
            <br />
            Président de OKA Tech
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            3. Hébergement
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            La plateforme Consulat.ga est hébergée en France par :
          </p>
          <div className="pl-6 mb-6 text-gray-600 dark:text-gray-300">
            <p>[Nom de l&apos;hébergeur]</p>
            <p>[Adresse de l&apos;hébergeur]</p>
            <p>Certifications : ISO 27001, HDS</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            4. Protection des Données
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            En tant que sous-traitant au sens du RGPD, OKA Tech met en œuvre toutes les
            mesures techniques et organisationnelles appropriées pour assurer la sécurité
            des données traitées.
          </p>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Délégué à la Protection des Données (DPO) :
          </p>
          <div className="pl-6 mb-6 text-gray-600 dark:text-gray-300">
            <p>Email : dpo@okatech.fr</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            5. Propriété Intellectuelle
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            La plateforme Consulat.ga, son code source, ses designs, logos et contenus
            sont la propriété exclusive de OKA Tech. Toute reproduction non autorisée
            constitue une contrefaçon sanctionnée par le Code de la propriété
            intellectuelle.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            6. Version Bêta
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            La plateforme est actuellement en phase de test bêta pour une durée de 3 mois.
            Durant cette période :
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
            <li>Certaines fonctionnalités peuvent être limitées ou modifiées</li>
            <li>Des mises à jour fréquentes peuvent être déployées</li>
            <li>Le support technique est assuré en priorité</li>
            <li>Les retours utilisateurs sont activement collectés et analysés</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            7. Loi Applicable
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Les présentes mentions légales sont régies par le droit français. En cas de
            litige, les tribunaux français seront seuls compétents.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            8. Contact
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Pour toute question concernant ces mentions légales :
            <br />
            <br />
            OKA Tech
            <br />
            59 Rue de Ponthieu
            <br />
            75008 Paris
            <br />
            France
            <br />
            <br />
            Email :{' '}
            <a
              href="mailto:okatech@icloud.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              okatech@icloud.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
