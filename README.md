# what-to-eat
What is in your fridge and needs to be eaten asap? Created with ADHD's object permanence issues in mind.

At the current time it is all local! No identification needed but only available on your current device.

A modern and unified anti-waste app. A refrigerator management app with:
• Tab navigation (Urgent, Fridge, Freezer, Cupboards, All)
• Bottom navigation (Shopping List, Recipes)
• Product addition flow with image capture
• Color-coded badge system for urgency

---

## Stack technique

React + Vite + Firebase + Tailwind CSS + React Router
PWA via `vite-plugin-pwa` (déjà configuré)

---

## Objectif final — App Store iOS

Publication visée dans ~6 mois via **Capacitor** (wrapper natif Xcode de l'app React/Vite existante).
La version desktop web reste disponible en parallèle.

### Pourquoi Capacitor et pas autre chose

| Option | Verdict |
|---|---|
| PWA seule | Suffisant Android (TWA), **refusé Apple App Store** (section 4.2) |
| **Capacitor** | ✅ Wrappe le code React existant, génère un projet Xcode, accepté par Apple |
| React Native | Réécriture quasi-complète — hors sujet |

---

## Critères d'acceptation App Store (Apple)

1. **Valeur fonctionnelle native** — notifications push, accès caméra, offline. Déjà en bonne voie.
2. **Accessibilité VoiceOver** — Apple teste la a11y. Échec possible si absente. → `eslint-plugin-jsx-a11y` + axe DevTools obligatoires.
3. **Privacy Policy** — Firebase collecte des données → nutrition label App Store Connect requis.
4. **Sécurité** — App Check Firebase, aucun secret dans le bundle.

---

## Points d'architecture à anticiper maintenant

Pour ne pas tout refaire à l'intégration Capacitor :

- **Navigation** : vérifier compatibilité react-router avec Capacitor history mode
- **Caméra** : éviter les hacks `<input type=file>` — abstraire pour pouvoir brancher le plugin Capacitor Camera
- **Notifications** : prévoir Capacitor Push Notifications (pas web push)
- **Stockage offline** : `idb` déjà en place — compatible Capacitor ✅
- **URLs** : aucune URL `localhost` hardcodée — Capacitor utilise `capacitor://localhost`
- **A11y** : commencer maintenant, corriger en fin de projet est coûteux

---

## Timeline

| Phase | Période | Focus |
|---|---|---|
| Développement React | Maintenant → mois 3 | Features, itérations, a11y en continu |
| Intégration Capacitor | Mois 3–4 | Config wrapper, tests simulateur iOS, fix ce qui casse |
| Tests & sécurité | Mois 4–5 | Tests utilisateurs sur device réel, audit sécurité, App Check |
| Soumission | Mois 6 | App Store Connect, review Apple |