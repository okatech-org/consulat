import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | Consulat.ga',
  description:
    'Politique de confidentialité de Consulat.ga - Découvrez comment nous protégeons vos données personnelles.',
};

export default function PrivacyPolicy() {
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
        Politique de Confidentialité
      </h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            1. Préambule
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Consulat.ga est un produit développé et opéré par OKA Tech, SASU au capital de
            [montant], immatriculée au RCS de Paris sous le numéro [numéro], dont le siège
            social est situé au 59 Rue de Ponthieu, 75008 Paris, France.
          </p>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Cette plateforme est mise à disposition des consulats et administrations
            diplomatiques sous forme de service (SaaS - Software as a Service).
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            2. Propriété des Données
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Les données collectées et traitées via la plateforme Consulat.ga restent la
            propriété exclusive des administrations utilisatrices. OKA Tech agit
            uniquement en tant que sous-traitant au sens du RGPD.
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
            <li>Les données sont hébergées en France sur des serveurs sécurisés</li>
            <li>
              Chaque administration dispose d&apos;un environnement isolé et sécurisé
            </li>
            <li>Les données sont chiffrées au repos et en transit</li>
            <li>Des sauvegardes automatiques sont effectuées quotidiennement</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            3. Collecte et Traitement des Données
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Dans le cadre de son fonctionnement, la plateforme collecte et traite :
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
            <li>Données d&apos;identification (nom, prénom, date de naissance)</li>
            <li>Documents d&apos;identité et justificatifs</li>
            <li>Coordonnées de contact</li>
            <li>Données de connexion et journaux d&apos;activité</li>
            <li>Données biométriques (uniquement pour les services concernés)</li>
          </ul>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Toutes les données sont traitées conformément au RGPD et à la loi Informatique
            et Libertés.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            4. Mesures de Sécurité Techniques
          </h2>
          <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
            <li>Chiffrement TLS 1.3 pour toutes les communications</li>
            <li>Chiffrement AES-256 pour les données au repos</li>
            <li>Authentification multi-facteurs (MFA)</li>
            <li>Surveillance 24/7 des systèmes</li>
            <li>Tests de pénétration réguliers</li>
            <li>Conformité ISO 27001</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            5. Droits des Utilisateurs
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Conformément à la réglementation, vous disposez des droits suivants :
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
            <li>Droit d&apos;accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l&apos;effacement</li>
            <li>Droit à la limitation du traitement</li>
            <li>Droit à la portabilité des données</li>
            <li>Droit d&apos;opposition</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            6. Contact
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Pour toute question concernant notre politique de confidentialité ou pour
            exercer vos droits, veuillez contacter notre Délégué à la Protection des
            Données :
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
