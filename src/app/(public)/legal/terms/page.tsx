import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Conditions d'Utilisation | Consulat.ga",
  description:
    "Conditions d'utilisation de Consulat.ga - Découvrez les règles et conditions d'utilisation de nos services.",
};

export default function TermsOfService() {
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
        Conditions d&apos;Utilisation
      </h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            1. Présentation du Service
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Consulat.ga est une plateforme SaaS (Software as a Service) développée et
            opérée par OKA Tech, SASU au capital de [montant], immatriculée au RCS de
            Paris sous le numéro [numéro], dont le siège social est situé au 59 Rue de
            Ponthieu, 75008 Paris, France.
          </p>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            La plateforme est actuellement en phase bêta pour une durée de 3 mois, durant
            laquelle certaines fonctionnalités peuvent être limitées ou modifiées.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            2. Conditions de Service
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Le service est fourni sous forme de licence d&apos;utilisation aux consulats
            et administrations diplomatiques. Les conditions suivantes s&apos;appliquent :
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
            <li>Licence non exclusive et non transférable</li>
            <li>Accès limité à la durée de l&apos;abonnement</li>
            <li>Interdiction de sous-licencier ou revendre le service</li>
            <li>Obligation de respecter les conditions de sécurité</li>
            <li>Respect des lois sur la protection des données</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            3. Propriété des Données
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Les administrations utilisatrices conservent l&apos;entière propriété de leurs
            données. OKA Tech s&apos;engage à :
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
            <li>
              Ne pas utiliser les données à d&apos;autres fins que la fourniture du
              service
            </li>
            <li>Assurer la portabilité des données</li>
            <li>Supprimer les données sur demande</li>
            <li>Notifier immédiatement toute violation de données</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            4. Niveau de Service (SLA)
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Pendant la phase bêta, nous nous efforçons de maintenir :
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
            <li>Une disponibilité de 99,5% du service</li>
            <li>Un temps de réponse inférieur à 500ms</li>
            <li>Une résolution des incidents critiques sous 4 heures</li>
            <li>Des sauvegardes quotidiennes</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            5. Responsabilités
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            OKA Tech ne pourra être tenue responsable :
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
            <li>Des interruptions de service dues à la maintenance</li>
            <li>Des problèmes causés par une mauvaise utilisation du service</li>
            <li>Des pertes de données dues à une négligence de l&apos;utilisateur</li>
            <li>Des dommages indirects ou consécutifs</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            6. Modifications des Conditions
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            OKA Tech se réserve le droit de modifier ces conditions à tout moment. Les
            utilisateurs seront notifiés par email de tout changement significatif.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            7. Contact
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Pour toute question concernant ces conditions d&apos;utilisation, veuillez
            nous contacter :
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
