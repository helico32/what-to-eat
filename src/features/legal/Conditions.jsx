import LegalLayout from './LegalLayout'

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display font-bold text-[16px] text-ink-primary">{title}</h2>
      {children}
    </section>
  )
}

function Li({ children }) {
  return <li className="ml-4 list-disc">{children}</li>
}

export default function Conditions() {
  return (
    <LegalLayout title="Conditions générales">

      <p className="text-ink-secondary text-[13px]">
        Les présentes conditions générales régissent l'utilisation de l'application What to eat
        et la souscription à son abonnement payant. En utilisant l'application, vous acceptez
        ces conditions.
      </p>

      <Section title="Éditeur du service">
        <p>Angéla Binot — <a href="mailto:[EMAIL]" className="underline underline-offset-2">[EMAIL]</a></p>
        <p>Bruxelles, Belgique</p>
      </Section>

      <Section title="Description du service">
        <p>
          What to eat est une application web progressive (PWA) d'aide à la gestion alimentaire
          anti-gaspi. Elle permet de suivre son stock (frigo, congélateur, placard), gérer une
          liste de courses, planifier l'utilisation des produits et sauvegarder des recettes.
        </p>
        <p>Le service est disponible en deux formules :</p>
        <ul className="flex flex-col gap-2 mt-1">
          <Li>
            <strong>Plan gratuit</strong> — fonctionnalités complètes en local sur l'appareil,
            sans inscription. Données stockées uniquement sur l'appareil : perdues en cas de
            changement de téléphone ou de réinstallation.
          </Li>
          <Li>
            <strong>Plan payant</strong> — sauvegarde des données dans le cloud (Firebase Firestore),
            synchronisation en cas de changement d'appareil, notifications push avant péremption.
            Nécessite une connexion via Google.
          </Li>
        </ul>
      </Section>

      <Section title="Essai gratuit">
        <p>
          Le plan payant est accessible via un essai gratuit de <strong>7 jours</strong>, sans
          carte bancaire requise. L'essai démarre à la première connexion Google. À l'issue de
          la période d'essai, sans souscription à l'abonnement, les fonctionnalités cloud sont
          désactivées. Les données locales restent accessibles.
        </p>
      </Section>

      <Section title="Prix et paiement">
        <p>
          Prix de l'abonnement : <strong>2,99€ TTC par mois</strong>, TVA européenne incluse.
        </p>
        <p>
          Le paiement est géré par <strong>LemonSqueezy</strong> (Lemon Squeezy LLC), qui agit
          en tant que Merchant of Record. LemonSqueezy encaisse le paiement, émet la facture et
          reverse la TVA aux autorités fiscales compétentes. Vos données bancaires sont traitées
          directement par LemonSqueezy — What to eat n'y a aucun accès.
        </p>
        <p>
          Le renouvellement est automatique chaque mois. Vous recevez une confirmation de
          paiement par email de la part de LemonSqueezy.
        </p>
      </Section>

      <Section title="Résiliation">
        <p>
          Vous pouvez résilier votre abonnement à tout moment depuis le portail client
          LemonSqueezy (lien accessible dans l'application, section Mon compte). La résiliation
          prend effet à la fin de la période mensuelle en cours : vous conservez l'accès jusqu'à
          cette date. Aucun remboursement n'est accordé pour la période entamée.
        </p>
      </Section>

      <Section title="Droit de rétractation">
        <p>
          Conformément à l'article VI.53, 13° du Code de droit économique belge, le droit de
          rétractation de 14 jours ne s'applique pas aux contenus et services numériques dont
          l'exécution a commencé avant l'expiration du délai de rétractation, avec le consentement
          exprès du consommateur et la reconnaissance que ce droit est perdu.
        </p>
        <p>
          En démarrant l'essai, vous reconnaissez expressément que l'exécution du service
          commence immédiatement et que le droit de rétractation ne s'applique pas.
        </p>
      </Section>

      <Section title="Disponibilité du service">
        <p>
          What to eat est fourni sans garantie de disponibilité continue. L'éditrice s'engage à
          maintenir le service en état de fonctionnement mais ne peut être tenue responsable
          d'interruptions dues à des tiers (Firebase, LemonSqueezy, fournisseur d'accès internet).
        </p>
        <p>
          En cas d'arrêt définitif du service payant, les utilisateurs abonnés seront prévenus
          par email avec un préavis d'au moins 30 jours. Le plan gratuit (fonctionnement local)
          n'est pas affecté par un arrêt du service cloud.
        </p>
      </Section>

      <Section title="Responsabilité">
        <p>
          Les dates de péremption et quantités affichées dans l'application sont saisies par
          l'utilisatrice. What to eat ne peut être tenu responsable d'une intoxication
          alimentaire ou d'un préjudice résultant d'une erreur de saisie ou d'une mauvaise
          interprétation des données affichées.
        </p>
      </Section>

      <Section title="Modification des conditions">
        <p>
          Ces conditions peuvent être modifiées à tout moment. En cas de modification substantielle,
          les utilisateurs abonnés seront informés par email au moins 30 jours avant l'entrée en
          vigueur des nouvelles conditions. La poursuite de l'utilisation du service vaut
          acceptation des nouvelles conditions.
        </p>
      </Section>

      <Section title="Droit applicable et juridiction">
        <p>
          Les présentes conditions sont soumises au droit belge. En cas de litige, et à défaut
          de résolution amiable, les tribunaux de Bruxelles sont seuls compétents.
        </p>
      </Section>

      <p className="text-ink-secondary text-[13px]">
        Dernière mise à jour : juillet 2026
      </p>

    </LegalLayout>
  )
}
