import LegalLayout from './LegalLayout'

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display font-bold text-[16px] text-ink-primary">{title}</h2>
      {children}
    </section>
  )
}

export default function MentionsLegales() {
  return (
    <LegalLayout title="Mentions légales">

      <p className="text-ink-primary text-[13px]">
        Conformément à la loi belge du 11 mars 2003 sur certains aspects juridiques des services
        de la société de l'information, les présentes mentions légales sont portées à la connaissance
        des utilisateurs de l'application What to eat.
      </p>

      <Section title="Éditeur">
        <p>Angéla Binot</p>
        <p>Bruxelles, Belgique</p>
        <p>
          Contact :{' '}
          <a href="mailto:[EMAIL]" className="underline underline-offset-2">[EMAIL]</a>
        </p>
      </Section>

      <Section title="Hébergement">
        <p>
          L'application est hébergée par <strong>Google Firebase</strong> (Firebase Hosting),
          un service de Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande.
        </p>
        <p>
          Les données sont stockées dans des centres de données situés en Europe
          (région europe-west).
        </p>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>
          L'ensemble du contenu de l'application What to eat (code source, design, textes, icônes…)
          restent la propriété de leurs auteurs respectifs et sont soumises à leurs propres licences.
          Toute reproduction du design ou des textes à des fins commerciales est interdite sans
          autorisation écrite préalable.
        </p>
      </Section>

      <Section title="Responsabilité">
        <p>
          What to eat est un outil d'aide à la gestion alimentaire. Les informations affichées
          (dates de péremption, quantités) sont saisies par l'utilisateur et relèvent de sa
          responsabilité.
        </p>
      </Section>

      <Section title="Droit applicable">
        <p>
          Les présentes mentions légales sont soumises au droit belge. En cas de litige,
          les tribunaux de Bruxelles sont seuls compétents.
        </p>
      </Section>

      <p className="text-ink-primary text-[13px]">
        Dernière mise à jour : juillet 2026
      </p>

    </LegalLayout>
  )
}
