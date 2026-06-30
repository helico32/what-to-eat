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

export default function Confidentialite() {
  return (
    <LegalLayout title="Confidentialité">

      <p className="text-ink-secondary text-[13px]">
        Conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679),
        cette politique vous informe de la façon dont vos données personnelles sont collectées,
        utilisées et protégées.
      </p>

      <Section title="Responsable du traitement">
        <p>Angéla Binot — <a href="mailto:[EMAIL]" className="underline underline-offset-2">[EMAIL]</a></p>
        <p>Bruxelles, Belgique</p>
      </Section>

      <Section title="Données collectées">
        <p className="font-semibold text-[13px] text-ink-secondary uppercase tracking-wide">Via Google Sign-In (plan payant)</p>
        <ul className="flex flex-col gap-1">
          <Li>Adresse email du compte Google</Li>
          <Li>Nom affiché sur le compte Google</Li>
          <Li>Identifiant unique Firebase (UID) — généré par Firebase, différent de votre identifiant Google</Li>
        </ul>

        <p className="font-semibold text-[13px] text-ink-secondary uppercase tracking-wide mt-2">Sans connexion (plan gratuit)</p>
        <ul className="flex flex-col gap-1">
          <Li>Identifiant anonyme Firebase — créé automatiquement sur l'appareil, sans lien avec votre identité</Li>
        </ul>

        <p className="font-semibold text-[13px] text-ink-secondary uppercase tracking-wide mt-2">Données de l'application (stockées dans Firebase Firestore)</p>
        <ul className="flex flex-col gap-1">
          <Li>Stock de produits (noms, quantités, dates de péremption, emplacement)</Li>
          <Li>Liste de courses</Li>
          <Li>Planning de repas</Li>
          <Li>Recettes sauvegardées</Li>
          <Li>Token de notification push (FCM) — nécessaire pour l'envoi des rappels</Li>
          <Li>Date de début d'essai et statut d'abonnement</Li>
        </ul>

        <p className="font-semibold text-[13px] text-ink-secondary uppercase tracking-wide mt-2">Données techniques (collectées automatiquement par Firebase)</p>
        <ul className="flex flex-col gap-1">
          <Li>Adresse IP et données de connexion — collectées par Google Firebase à des fins de sécurité et de stabilité du service</Li>
        </ul>
      </Section>

      <Section title="Finalités et bases légales">
        <ul className="flex flex-col gap-2">
          <Li>
            <strong>Fourniture du service</strong> — traitement nécessaire à l'exécution du contrat
            (art. 6.1.b RGPD) : authentification, synchronisation des données, envoi des notifications
          </Li>
          <Li>
            <strong>Gestion de l'abonnement</strong> — obligation légale et exécution du contrat
            (art. 6.1.b et 6.1.c RGPD) : suivi de l'essai, facturation via LemonSqueezy
          </Li>
          <Li>
            <strong>Sécurité et prévention des abus</strong> — intérêt légitime
            (art. 6.1.f RGPD) : protection contre les accès frauduleux
          </Li>
        </ul>
      </Section>

      <Section title="Destinataires des données">
        <ul className="flex flex-col gap-2">
          <Li>
            <strong>Google Firebase</strong> (Google Ireland Limited, Dublin, Irlande) — hébergement,
            authentification, base de données Firestore, notifications FCM. Données traitées en Europe
            (région europe-west). Couvert par les Clauses Contractuelles Types de l'UE.
          </Li>
          <Li>
            <strong>LemonSqueezy</strong> (Lemon Squeezy LLC, États-Unis) — traitement des paiements
            et gestion des abonnements. LemonSqueezy agit en tant que Merchant of Record : c'est eux
            qui encaissent le paiement et émettent la facture. Vos données de paiement (numéro de
            carte, etc.) ne transitent jamais par What to eat.
          </Li>
        </ul>
        <p>Aucune donnée n'est vendue ou partagée avec des tiers à des fins publicitaires.</p>
      </Section>

      <Section title="Durée de conservation">
        <ul className="flex flex-col gap-1">
          <Li>Données du compte et de l'application : jusqu'à suppression du compte, sur demande</Li>
          <Li>Données de facturation : 7 ans (obligation comptable belge, art. III.86 Code de droit économique)</Li>
          <Li>Données locales (IndexedDB sur l'appareil) : sous votre contrôle — supprimées en effaçant les données du navigateur</Li>
        </ul>
      </Section>

      <Section title="Vos droits (RGPD)">
        <p>Vous disposez des droits suivants sur vos données :</p>
        <ul className="flex flex-col gap-1">
          <Li><strong>Accès</strong> — obtenir une copie de vos données</Li>
          <Li><strong>Rectification</strong> — corriger des données inexactes</Li>
          <Li><strong>Suppression</strong> — demander l'effacement de votre compte et de vos données</Li>
          <Li><strong>Portabilité</strong> — recevoir vos données dans un format structuré</Li>
          <Li><strong>Opposition</strong> — vous opposer à un traitement basé sur l'intérêt légitime</Li>
          <Li><strong>Limitation</strong> — restreindre temporairement le traitement</Li>
        </ul>
        <p>
          Pour exercer ces droits :{' '}
          <a href="mailto:[EMAIL]" className="underline underline-offset-2">[EMAIL]</a>
        </p>
        <p>
          En cas de réponse insatisfaisante, vous pouvez introduire une réclamation auprès de
          l'Autorité de Protection des Données (APD) :{' '}
          <span className="font-semibold">www.autoriteprotectiondonnees.be</span>
        </p>
      </Section>

      <Section title="Cookies et stockage local">
        <p>
          What to eat n'utilise pas de cookies de tracking ou publicitaires. L'application utilise :
        </p>
        <ul className="flex flex-col gap-1">
          <Li><strong>IndexedDB</strong> — stockage local sur votre appareil (données de l'app). Ne quitte pas votre appareil sans connexion Google.</Li>
          <Li><strong>Service Worker</strong> — cache des ressources pour le fonctionnement hors ligne. Aucune donnée personnelle.</Li>
          <Li><strong>Cookies Firebase Auth</strong> — maintien de la session de connexion. Fonctionnels, nécessaires au service.</Li>
        </ul>
      </Section>

      <p className="text-ink-secondary text-[13px]">
        Dernière mise à jour : juillet 2026
      </p>

    </LegalLayout>
  )
}
