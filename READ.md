# Spec produit — What to eat (anti-gaspi TDAH)

---

## Philosophie de développement

> 50 ans de métier enseignent une chose : le code qu'on n'écrit pas ne peut pas avoir de bug.

### Règles de travail

**Expliquer avant de coder — toujours.**
Avant toute implémentation, décrire ce qu'on va faire et attendre le go explicite. Pas d'exception.

**Ne jamais committer — jamais.**
Aucun `git commit`, `git add`, `git push` ou toute opération git d'écriture. Les commits sont faits manuellement par la développeuse, point.

**Code lisible par un junior.**
Un développeur junior doit comprendre chaque mécanisme sans avoir à deviner. Les passages non évidents (state imbriqué, closures, logique métier compacte) reçoivent un commentaire court qui explique le "pourquoi", pas le "quoi".

**KISS avant tout.**
Si tu peux l'expliquer en une phrase, tu peux le coder en 10 lignes. Si tu ne peux pas l'expliquer, tu ne le codes pas encore.

**Pas d'abstraction prématurée.**
On ne crée pas un helper pour deux cas d'usage. On copie-colle une fois, on abstrait à la troisième occurrence — et encore, seulement si ça simplifie vraiment.

**Un composant = une responsabilité.**
Quand un fichier dépasse ~150 lignes ou fait deux choses différentes, c'est le signal de découper. Pas avant.

**Pas de feature sans usage réel.**
Aucune fonctionnalité "pour plus tard", "au cas où", ou "ça pourrait être utile". Si l'utilisatrice ne l'a pas demandé explicitement, ça n'existe pas.

**Pas de complexité défensive.**
Pas de validation pour des cas impossibles. Pas de fallback pour ce que le framework garantit. Pas d'error handling sur du code interne qu'on contrôle.

**IndexedDB via `src/db.js`.**
Le storage est IndexedDB (pas localStorage) — nécessaire pour que le Service Worker PWA puisse accéder aux données et déclencher des notifications hors-app. Wrapper : `idb` (~1kb), pas Dexie (trop de magie). La base est définie dans `src/db.js` (infrastructure, pas données métier) avec 5 stores : `products`, `shoppingList`, `meals`, `repas`, `recipes`.

**L'état distribué est résolu par IndexedDB.**
Avec une instance `db` partagée, `useMeals` écrit directement dans le store `products` sans passer par `useStore`. Les callbacks `onDecreaseQty` / `onIncreaseQty` / `onRemoveIfZero` qui couplaient les deux hooks via `App.jsx` disparaissent — remplacés par une transaction directe dans `useMeals`.

**Vérifier le `.gitignore` avant tout staging.**
Avant de `git add` un fichier — nouveau ou modifié — vérifier qu'il ne devrait pas être ignoré : secrets, fichiers générés, documents privés (comme ce README). En cas de doute, ouvrir `.gitignore` et confirmer.

**La dette technique se documente ici.**
Pas dans des TODO dans le code. Pas dans des tickets. Dans ce fichier, section "Points de vigilance".

### Points de vigilance

- **`RepasGroup`** (dans `MealGroupsList.jsx`) : rename + delete confirm + collapse en un seul composant. À surveiller si ça grossit encore.
- **Cohérence stock / planning** : résolue par la migration IndexedDB — `useMeals` modifie le store `products` dans la même transaction que le store `meals`. Plus de risque d'état incohérent.
- **Pente glissante planning** : le planning n'est PAS un planificateur de menus. C'est une externalisation de mémoire — "je prévois d'utiliser ce produit tel jour avant qu'il périsse". Toute feature qui ressemble à "planifier ses repas" est hors scope. La question à se poser : "est-ce que ça aide à ne pas oublier un produit ?" Si non, on ne le fait pas.
- **Icône PWA `purpose: 'any maskable'`** : un seul fichier `icon-512.png` sert les deux usages. Sur Android, les icônes maskable sont rognées en cercle — si le sujet de l'icône est trop proche des bords, il sera coupé. À corriger si l'icône est mal rendue après installation : créer un `icon-512-maskable.png` avec plus de marge et séparer les deux entrées dans le manifest.
- **Auth anonyme + App Check — seul vrai risque de sécurité** : un script peut appeler `signInAnonymously()` en boucle, obtenir 10 000 UIDs anonymes, écrire des documents dans `/users/{uid}/products/`. La Cloud Function à 9h lit **tous** les users → chaque lecture coûte de l'argent sur Blaze. Filet immédiat : budget alert 5€ à activer dès l'upgrade Blaze (avant de lancer `firebase deploy --only functions`). Vraie protection : App Check (étape 4) — vérifie que les requêtes viennent de l'app, pas d'un script. Ne rien coder de plus avant l'étape 4.
- **Notifications iOS** : les push PWA ne fonctionnent que sur iOS 16.4+, app installée via Safari. Sur iOS plus ancien ou navigateur non-Safari, `Notification` est `'unsupported'` — le bouton radio est masqué.
- **Cloud Function en attente Blaze** : le code est déployable (`firebase deploy --only functions`) dès que le plan est upgradé. Penser à définir le budget alert avant de confirmer l'upgrade.

### À faire

- **Cibles tactiles** : les boutons sort/mealMode (`w-8 h-8` = 32px) et le `+` du Header (`w-8 h-8` = 32px) sont en dessous des 44px requis par la règle accessibilité. Décision en suspens : les actions secondaires peuvent-elles rester à 32px ? À trancher.
- **mealMode — état actif peu lisible** : le changement de fond seul ne suffit pas pour le persona TDAH ("l'état actif d'un bouton doit être indiscutable"). Proposition en attente de go : afficher un label texte à côté de l'icône quand le mode est actif.
- **Lien urgence → planning absent** : aucun raccourci direct depuis un produit urgent pour le placer sur un jour. Le flux actuel (activer mealMode → taper l'icône → picker) est trop long pour le persona. À creuser.
- **Audit `aria-label` complet** : seuls les boutons sort/mealMode ont été mis à jour. Les autres boutons icônes de l'app (corbeille, panier, shuffle, etc.) sont à auditer.
- **Page "Mon compte" (`/compte`)** : à créer à l'étape 5, quand le statut d'abonnement est disponible dans Firestore. Voir section dédiée dans Pages.
- **Domaine custom + popup Google** : la popup Google Sign-In affiche le domaine depuis lequel l'utilisatrice lance la connexion. Actuellement : `what-to-eat-angelab.firebaseapp.com`. À changer avant le lancement public — voir section dédiée ci-dessous.

---

## Contexte & persona

**Profil utilisateur** : personne TDAH, pas de permanence des objets, déteste planifier les repas, peu à l'aise avec les finances, goûts simples, aime cuisiner des choses rapides.

**Ce qui fonctionne déjà** : elle achète via une app anti-gaspi (ex. Happy Hour) — les visuels l'aident à n'acheter que l'essentiel, et la date de péremption courte la force à manger rapidement et varié.

**Ce qui ne fonctionne pas** : elle oublie ce qui est dans son frigo, ne sait pas quoi cuisiner, et les produits longue durée (barres de céréales, éponges, sodas) disparaissent de sa mémoire.

### Persona TDAH — fiche de référence UX

À utiliser pour évaluer chaque décision d'interface. Poser la question : *"est-ce que ce persona passe cet écran sans friction ?"*

**Comportements cognitifs**
- Scanne les formes et couleurs, ne lit pas les labels
- Temps d'attention par élément : ~3 secondes avant de passer à autre chose
- Oublie ce qu'elle cherchait si un obstacle ou une décision apparaît
- Décision fatigue rapide : max 2 choix par écran, sinon abandon
- Pas de permanence des objets : ce qui n'est pas visible n'existe pas

**Comportements d'usage**
- N'explore pas l'interface — n'appuie pas sur des boutons dont elle ne connaît pas l'effet
- N'utilise pas les réglages, paramètres ou menus avancés
- Revient toujours à l'écran d'accueil comme point de repère
- L'urgence est un moteur : une date courte qui clignote, elle réagit

**Règles d'interface qui en découlent**
- Toute action doit être évidente sans apprentissage
- L'état actif d'un bouton doit être indiscutable (pas juste un changement de couleur subtil)
- Les cibles tactiles : minimum 44px (accessibilité + doigt imprécis)
- Zéro écran de réglages exposé à l'utilisatrice
- Le texte confirme ce que l'icône montre — icône seule = risque d'invisibilité

### User journeys — tests à faire

#### Journey 1 — "Merde, les framboises"

**Contexte** : mardi soir 18h30, elle rentre, ouvre le frigo, voit les framboises achetées il y a 3 jours via Too Good To Go.

1. Elle ouvre l'app → onglet Urgent
2. Elle voit les framboises avec le badge rouge "Aujourd'hui"
3. Elle tape sur le bouton cutlery (mealMode)
4. Elle appuie sur la coutellerie à côté des framboises → "Ajouter au repas ?" → Oui
5. Elle ferme l'app et va cuisiner

**Ce qu'on vérifie** : le badge est lisible d'un coup d'œil, mealMode est compréhensible sans apprentissage, le stock diminue après confirmation.

#### Journey 2 — "Je fais les courses demain"

**Contexte** : dimanche matin, elle sait qu'elle va au marché.

1. Elle ouvre l'app, tape sur l'icône panier → `/liste`
2. Elle voit sa liste (vide ou partielle)
3. Elle appuie sur **+** → ajoute "Yaourt"
4. Elle revient à l'accueil (tape sur le titre)
5. Elle va dans l'onglet Placard — voit que les pâtes sont à 1
6. Elle tape l'icône panier sur les pâtes → "Ajouter à la liste ?" → Oui
7. Elle retourne sur `/liste` — vérifie que les pâtes sont là
8. Au marché, elle coche les items au fur et à mesure
9. Rentrée, elle tape "Ranger les courses" → choisit Frigo → ajoute une date

**Ce qu'on vérifie** : navigation aller-retour home↔liste fluide, ajout rapide fonctionne, flow "ranger après courses" compréhensible.

---

## Principes de design

- **Local pour le quotidien, Firebase pour la mémoire long terme** : le stock, la liste de courses et le planning restent en IndexedDB local (éphémère, change souvent). Les recettes, le catalogue images et les données de notification vont dans Firebase (valeur durable, survit au changement d'appareil).
- **Zéro friction cognitive** : chaque action demande le moins de décisions possible. Chaque réglage exposé à l'utilisateur est une décision cognitive en plus — on n'en ajoute pas sans raison impérative.
- **L'image est le centre de gravité** : c'est ce qui déclenche la reconnaissance, pas le nom.
- **L'urgence comme moteur** : les dates courtes sont un levier de motivation, pas un problème.
- **Suggestion, pas planification** : une recette ce soir, pas un menu de la semaine.
- **KISS** : pas de fonctionnalité sans usage concret. Trois lignes de code valent mieux qu'une abstraction prématurée.
- **Mobile first** : on conçoit et code pour petit écran en premier. Pas de layout desktop à adapter — l'app est max-w-[430px], pensée pour le pouce, pas pour la souris.
- **Accessibilité** : on suit les bonnes pratiques WCAG — contrastes suffisants, cibles tactiles ≥ 44px, labels explicites sur les boutons icônes (`aria-label`), hiérarchie de titres cohérente, focus visible.

---

## Architecture

### Navigation

- **Header** (fixe haut) : titre (→ retour Urgent), bouton `+`, icône panier (badge items non cochés), menu hamburger
- **MenuDrawer** : tiroir global accessible depuis le hamburger — accès tabs + pages
- **TabBar** : onglets de stock sous le header (visible page `/` seulement)

### Routes

| Route | Page |
|-------|------|
| `/` | Accueil (tabs + stock) |
| `/liste` | Liste de courses |
| `/recettes` | Recettes sauvegardées |
| `/recettes/new` | Formulaire ajout recette |
| `/recettes/:id` | Détail / édition recette |
| `/planning` | Planning de repas (7 jours) |

### Onglets (page `/`)

| Onglet | Contenu |
|--------|---------|
| 🔴 Urgent | Vue par défaut. Repas prévus du jour + produits frigo triés par urgence + proposition recette |
| 🧊 Frigo | Tous les produits frigo, compteur |
| ❄️ Congél | Produits congélateur, compteur |
| 📦 Placards | Produits longue durée, compteur |
| Tout | Liste complète |

Tous les onglets sauf Urgent : bouton tri manuel (drag-and-drop) activable.

### Vue "Urgent" (accueil)

1. **Repas prévus aujourd'hui** (`PlannedMealsSection`) : affiché uniquement si des repas existent pour aujourd'hui — même composant que `/planning`, contexte today.
2. **Liste prioritaire** : produits frigo triés par date, badges colorés.
   - Mode repas (bouton couvert 🍴) : active un picker inline pour affecter un produit à un repas du jour.
3. **Proposition de repas** : carte recette aléatoire avec bouton ⇄.

### Actions sur les produits (stock)

Chaque ligne produit expose directement :
- **🛒** → confirmation inline → ajoute à la liste de courses
- **✕** → confirmation inline → supprime du stock
- **+/−** → incrémente / décrémente la quantité
- **Mode repas** (onglet Urgent) : bouton 🍴 dans la `SectionLabel` active l'ajout au planning

Pas de modal intermédiaire : les confirmations apparaissent dans la ligne.

### Ajout d'un produit

**Étape 1 — Source**

Le `+` du header ouvre `QuickAddSheet` (nom + emplacement, minimaliste). Un lien "Avec photo / date →" escalade vers `AddModal` (flux complet).

`AddModal` — grille 2×2 :
- **Galerie** : photo déjà prise
- **Screenshot** : import direct d'un screenshot Happy Hour
- **Code-barres** : produits emballés standards
- **Saisie rapide** : champ texte + icône générique

**Étape 2 — Détails**

| Champ | Comportement |
|-------|-------------|
| **Nom** | Pré-rempli par l'IA depuis la photo |
| **Quantité** | Boutons +/−, défaut : 1 |
| **Date de péremption** | Pills : Demain / 3 jours / 1 semaine / 1 mois / Pas de date |

**Étape 3 — Emplacement**

Trois boutons larges : **Frigo** (défaut frais) · **Congélateur** · **Placard**

### Badges de date

| Couleur | Condition |
|---------|-----------|
| 🔴 Rouge | ≤ 1 jour |
| 🟡 Amber | 2–4 jours |
| 🟢 Vert | ≥ 5 jours |
| 🔵 Bleu | Congélateur |
| ⚪ Neutre | Placard |

---

## Pages

### Planning de repas (`/planning` + `useMeals`)

**Ce n'est pas un planificateur de menus.** C'est une externalisation de mémoire pour cerveau TDAH.

Le problème résolu : l'utilisatrice a du poulet qui expire demain et des courgettes qui expirent dans 3 jours. Sans aide, elle oublie qu'ils existent. Avec le planning, elle "place" le poulet sur aujourd'hui et les courgettes sur demain — pas pour planifier ce qu'elle mange, mais pour **ne pas oublier de les utiliser avant qu'ils périment**.

La question filtre pour toute nouvelle feature planning : *"est-ce que ça aide à ne pas oublier un produit ?"* Si non, hors scope.

Un repas = un produit du stock réservé pour une date. Quand on ajoute un produit au planning, sa quantité en stock diminue immédiatement. À la confirmation (mangé / rangé), le stock est ajusté.

**Structure de données**

- **`meals`** : `{ id, productId, productSnapshot, qty, date, repasId | null }`
- **`repas`** : `{ id, name, date }` — groupe nommé (ex. "Déjeuner", "Dîner")
- Persisté dans IndexedDB (stores `meals` et `repas`)

**Page `/planning`**

- Sélecteur de jours : 7 jours défilants, point indicateur si repas existants.
- `MealGroupsList` : affiche les groupes "repas" + les meals sans groupe (label : "Encas").
- Bouton `+` dans le header : ouvre le picker de produit sans groupe.
- "Nouveau repas" : crée un groupe nommé via bottom sheet.

**`MealGroupsList`**

- Groupes repliables, renommables inline, supprimables (avec confirmation inline).
- Chaque ligne meal : checkbox + ajustement quantité consommée.
- Barre flottante bas quand des items sont cochés : **"Mangé"** (jette la qté non cochée) / **"Ranger"** (remet en stock la qté cochée).
- Aussi utilisé dans `PlannedMealsSection` (vue today sur l'accueil).

**Actions sur un meal**

| Action | Effet |
|--------|-------|
| Cocher + "Mangé" | Confirme la consommation, retire du planning, supprime du stock si qty = 0 |
| Cocher + "Ranger" | Remet la quantité en stock, retire du planning |
| Corbeille (ligne) | Annule le repas, remet toute la quantité en stock |
| Supprimer le groupe | Annule tous les meals du groupe, remet les quantités en stock |

### Recettes (`/recettes`)

- Recettes sauvegardées localement. Deux exemples pré-chargés au premier lancement.
- Chaque recette : emoji · nom · temps · chips ingrédients.
- **Consulter** : tap → détail recette (`/recettes/:id`) avec ingrédients + étapes.
- **Ajouter** : `/recettes/new` — emoji preset, nom, temps, ingrédients, étapes.
- **Éditer** : inline sur la page détail.
- **Favoris** : toggle, favoris remontés en tête.
- **Réordonner** : drag-and-drop.
- **Supprimer** : bouton ✕ avec confirmation Oui / Non inline.
- Ces recettes alimentent la carte "Proposition de repas" (onglet Urgent) : seules les recettes avec au moins un ingrédient en stock sont proposées, triées par ingrédient le plus urgent à consommer. Le bouton ⇄ navigue dans ce pool trié.

### Mon compte (`/compte`)

Page accessible depuis le MenuDrawer une fois connectée (remplace ou complète l'affichage email actuel). À créer à l'étape 5 — le contenu dépend du statut d'abonnement dans Firestore.

**Contenu prévu**

| Section | Détail |
|---|---|
| Identité | Prénom + email du compte Google (`user.displayName` + `user.email`) |
| Statut abonnement | "Essai gratuit — X jours restants" / "Abonnée · 2,99€/mois" / "Abonnement expiré" |
| Gestion abonnement | Lien vers le portail LemonSqueezy (annulation, factures) — URL fournie par LS |
| Déconnexion | Bouton "Se déconnecter" — même action que le drawer actuel |

**Ce qu'on ne met pas**
- Pas de stats (produits sauvés, jours d'utilisation) — aucune donnée collectée, feature hors scope v1
- Pas de modification du profil — le nom/email viennent de Google, non modifiables ici
- Pas de suppression de compte — hors scope v1, à envisager si obligation légale RGPD

**Dépendances avant de coder**
1. `trialStartedAt` écrit dans Firestore au premier sign-in (Step 5)
2. `isSubscribed` mis à jour par le webhook LemonSqueezy (Step 5)
3. URL du portail client LemonSqueezy (disponible après création du produit LS)

---

### Liste de courses (`/liste`)

- Badge compteur (items non cochés) dans le header, toutes pages.
- Items cochés en bas, barrés et estompés.
- Ajout rapide par texte + emoji depuis la page.
- +/− sur chaque item.
- "Effacer cochés" + "Ajouter au stock" (avec choix emplacement + date).

---

## Stack & structure technique

- **Framework** : React 18 + Vite
- **Routing** : React Router DOM (SPA)
- **CSS** : Tailwind CSS v3
- **Stockage local** : IndexedDB via `idb` — données éphémères (stock, planning, liste de courses)
- **Cloud** : Firebase — hébergement, notifications push, catalogue images, recettes
- **Structure** : `features/` par domaine métier, `components/` pour les éléments vraiment partagés, logique dans des hooks custom co-localisés avec leur feature

### Ce qui est local vs Firebase

| Donnée | Où | Pourquoi |
|---|---|---|
| Stock produits + quantités | IndexedDB | Change plusieurs fois/jour |
| Liste de courses | IndexedDB | Éphémère |
| Planning meals | IndexedDB | Éphémère |
| Recettes | Firestore | Valeur durable, survit au changement d'appareil |
| Catalogue images (nom → URL) | Firestore + Firebase Storage | Mémoire visuelle long terme |
| Dates d'expiration | Firestore | Nécessaire pour les notifs push hors-app |
| Subscription push | Firestore | Nécessaire pour les notifs push |

### Firebase — services utilisés

- **Firebase Hosting** — hébergement de la PWA
- **Firebase Auth** — authentification anonyme + upgrade optionnel
- **Firestore** — recettes, catalogue images, dates expiration, subscription push
- **Firebase Storage** — images produits
- **Firebase Cloud Functions** — job quotidien qui vérifie les expirations et envoie les notifications
- **FCM (Firebase Cloud Messaging)** — delivery des push notifications

**Coût :** free tier suffisant pour une app personnelle (< 500 utilisateurs).

### Migration IndexedDB

La migration remplace `localStorage` par IndexedDB dans tous les hooks. Le changement est interne aux hooks — les composants n'ont rien vu.

| Périmètre | Change ? |
|---|---|
| Interface des hooks (ce qu'ils retournent) | Non — les composants ne voient rien |
| Composants | Non |
| Intérieur des hooks | Oui — chargement initial en `useEffect`, écritures en `await` |
| `persist()` | Remplacé par `await db.put()` |
| `localStorage.getItem` | Remplacé par `await db.getAll()` |
| `src/db.js` | Nouveau fichier, 5 stores |
| Callbacks `onDecreaseQty` / `onIncreaseQty` / `onRemoveIfZero` | Supprimés — `useMeals` écrit directement dans le store `products` via `db` |

Loading : IndexedDB local ≈ 50ms. Pas de spinner — les composants affichent déjà une liste vide au démarrage.

**Avancement**

| Hook | Migré ? |
|------|---------|
| `src/db.js` | ✅ Fait |
| `useRecipes` | ✅ Fait — champ `position` ajouté pour préserver l'ordre drag-and-drop |
| `useStore` | ✅ Fait — `productsRef` pour callbacks temporaires stables ; `refreshProducts` prêt pour `useMeals` |
| `useMeals` | ✅ Fait — transaction atomique meals + products ; `onProductsChanged` remplace les 3 callbacks |

### Structure des fichiers

```
src/
  features/
    products/       HomePage, ProductRow, AddModal, QuickAddSheet, useStore, badges
    meals/          MealGroupsList, MealPlanPage, PlannedMealsSection, useMeals, useMealChecklist
    recipes/        RecipesPage, RecipeCard, RecipeModal, AddRecipeModal, useRecipes, data
    shopping/       ListePage, ShoppingList
    notifications/  useNotifications
    auth/           useAuth
  components/       Header, MenuDrawer, TabBar, SearchBar, SearchEmpty  ← partagés (2+ features)
  hooks/            useSortable  ← partagé (drag-and-drop multi-features)
  utils/            styles.js
  data/             products.js  ← données initiales produits
  db.js  firebase.js  sw.js  main.jsx  App.jsx
```

### Hooks

| Hook | Emplacement | Rôle |
|------|-------------|------|
| `useStore` | `features/products/` | Produits + liste de courses |
| `useRecipes` | `features/recipes/` | Recettes : CRUD, favoris, réordonnancement |
| `useMeals` | `features/meals/` | Planning de repas : meals + groupes "repas" |
| `useMealChecklist` | `features/meals/` | État checklist dans MealGroupsList (checked, rowQtys, Mangé/Ranger) |
| `useSortable` | `hooks/` | Drag-and-drop dans les listes produits |
| `useAuth` | `features/auth/` | Auth anonyme silencieuse + Google Sign-In + signOut |
| `useNotifications` | `features/notifications/` | Permission push + token FCM → Firestore |

---

## Authentification

### Principe : anonyme par défaut, upgrade optionnel

L'utilisatrice ne voit aucun écran de connexion au premier lancement. Firebase crée silencieusement un compte anonyme lié à l'appareil. Elle peut choisir de "sauvegarder" ses données en se connectant — ce point d'entrée est uniquement dans le **MenuDrawer**, discret, jamais intrusif.

### Flux

1. **Premier lancement** → compte anonyme automatique, aucune action requise
2. **Elle veut sauvegarder** → tap "Sauvegarder mes données" dans le menu → choix de méthode
3. **Elle change d'appareil** → se reconnecte → données récupérées

### Méthodes (étape 4a)

- **Google Sign-In** — un tap, pas de mot de passe, fonctionne sur tous les appareils
- ~~Magic link email~~ — retiré : Firebase Dynamic Links est abandonné, le lien ne rouvrirait pas la PWA sur mobile
- ~~Passkeys~~ — skippés : Firebase Auth ne supporte pas WebAuthn nativement

### Ce qu'on ne fait pas

- Pas d'email + mot de passe — trop de friction pour le persona
- Pas d'écran d'onboarding obligatoire
- Pas de "créer un compte" visible au démarrage
- Pas de forçage de connexion à aucun moment

---

## Statut & roadmap

**V1 — PWA avec notifications push. Gratuite, en test.**
L'objectif est de valider l'usage avec une utilisatrice TDAH réelle. On ne passe à l'étape suivante que quand la précédente est stable.

### Ce que l'app fait ✅

- **Installable sur l'écran d'accueil** — se lance en plein écran, sans barre d'URL, comme une app native
- **Fonctionne hors-ligne** — après le premier chargement, l'app tourne sans connexion (Service Worker + cache)
- **Données locales persistantes** — stock, planning, liste de courses survivent aux rechargements (IndexedDB)
- **Zéro compte requis** — aucune inscription, aucun mot de passe, aucune friction au premier lancement
- **Auth anonyme** — Firebase crée silencieusement un uid par appareil dès le chargement ✅
- **Bouton radio "Alertes"** dans le menu — toujours visible, 3 états : `○ Activer les alertes` / `● Alertes activées` / `× Alertes bloquées`. Stocke le token FCM dans Firestore (notif active dès que la Cloud Function est déployée)
- **Ajout rapide** — le `+` ouvre un bottom sheet minimal (nom + location) sans photo ni date. Lien "Avec photo / date →" escalade vers le flux complet (`AddModal`)
- **Badge "⚠ sans date"** — les produits frigo sans `expiryDate` affichent un badge tappable dans la liste
- **Picker date inline** — taper le badge ouvre un `<input type="date">` dans la ligne, sauvegarde immédiatement en IndexedDB via `updateExpiryDate`

### Roadmap — 5 étapes

**Étape 1 — Migration IndexedDB** ✅
- ~~Migrer `useMeals` (dernière hook restante)~~ ✅
- ~~Supprimer les callbacks `onDecreaseQty` / `onIncreaseQty` / `onRemoveIfZero` de `App.jsx`~~ ✅
- ~~Fix bug id collision `addProduct` (forEach + Date.now())~~ ✅
- ~~Corriger les `aria-label` manquants sur tous les boutons icônes~~ ✅

**Étape 2 — PWA** ✅
- ~~Icône (192×192 et 512×512)~~ ✅
- ~~`vite-plugin-pwa` + manifest + Service Worker~~ ✅
- ~~Déploiement sur Firebase Hosting~~ ✅ — https://what-to-eat-angelab.web.app

#### Détail étape 2 — pour la junior

**Le manifest — carte d'identité de l'app**
Fichier JSON qui dit au navigateur : nom de l'app, icône à afficher sur l'écran d'accueil, couleur de la barre de statut, mode de lancement (plein écran, sans barre d'URL). Sans lui, le navigateur ne propose pas d'installer l'app. Avec lui, Chrome et Safari mobile proposent "Ajouter à l'écran d'accueil".

**Le Service Worker — assistant qui tourne en arrière-plan**
Fichier JavaScript installé dans le navigateur, qui tourne séparément de l'app — même quand elle est fermée. Deux rôles :
- **Cache (utile maintenant)** : intercepte les requêtes (HTML, CSS, JS, images) et les met en cache. L'app se lance sans connexion.
- **Notifications push (utile à l'étape 3)** : reçoit les notifications Firebase quand l'app est fermée. Sans Service Worker, les push notifications sont impossibles — le navigateur n'a rien à "réveiller". C'est pour ça qu'on l'installe maintenant.

**`vite-plugin-pwa` — l'outil qui fait le travail**
Écrire un Service Worker manuellement est complexe (gestion du cache, des versions, des mises à jour). Le plugin le génère automatiquement à chaque `npm run build`. On lui donne la configuration, il produit les fichiers. On n'écrit pas le Service Worker à la main.

**Note sur `injectManifest`**
On est passé du mode `generateSW` (SW auto-généré) au mode `injectManifest` (on fournit `src/sw.js`, le plugin y injecte la liste Workbox). Ce changement est nécessaire pour que FCM puisse enregistrer son listener `onBackgroundMessage` dans le SW. Un SW purement Workbox-généré n'a pas accès au code FCM.

**Étape 3 — Notifications push** ← on est là

| Fichier | Rôle |
|---|---|
| `src/firebase.js` | Init SDK (auth, db, messaging) |
| `src/sw.js` | Service Worker custom : précache Workbox + écoute FCM en arrière-plan |
| `vite.config.js` | Basculé en mode `injectManifest` → utilise `src/sw.js` |
| `src/features/auth/useAuth.js` | Auth anonyme silencieuse + Google Sign-In (`linkWithPopup`) + signOut |
| `src/features/notifications/useNotifications.js` | Permission push + token FCM → Firestore (auth gérée par `useAuth`) |
| `functions/index.js` | Cloud Function planifiée (9h/j) : vérifie expirations → envoie notif |
| `firestore.rules` | Sécurité : chaque user lit/écrit uniquement ses propres données |
| `App.jsx` | Routeur pur — hooks partagés (`useStore`, `useMeals`, `useRecipes`, `useNotifications`), état partagé (`tab`, `sorting`), `MenuDrawer` |
| `features/products/HomePage.jsx` | Page `/` : état local (search, mealMode, showAdd), liste produits, modals ajout, proposition recette |
| `MenuDrawer.jsx` | Bouton "Activer les alertes" (affiché si permission pas encore accordée) |

- ~~Firebase Anonymous Auth (silencieux, aucune friction)~~ ✅ activé + déployé
- ~~Service Worker custom (cache + FCM arrière-plan)~~ ✅ déployé
- ~~Demande de permission notification dans l'app (une seule fois, non bloquante)~~ ✅ déployé
- ~~Clé VAPID renseignée dans `useNotifications.js`~~ ✅
- ~~Firestore rules déployées~~ ✅ — chaque user isolé
- ~~`firebase deploy --only hosting,firestore`~~ ✅ — app en ligne
- **Cloud Function quotidienne** ⏳ — code prêt, déploiement bloqué par plan Spark. Passer en Blaze + budget alert 5€ → `firebase deploy --only functions`

**Passer en Blaze pour activer les notifications**
1. Firebase console → https://console.firebase.google.com/project/what-to-eat-angelab/usage/details → Upgrade
2. Définir un budget alert à **5€** dès la page d'upgrade (email envoyé à 50%, 90%, 100%)
3. `firebase deploy --only functions`

**Tester les notifications sur téléphone**
- Ouvrir l'app installée (PWA ajoutée à l'écran d'accueil)
- Menu → bouton radio "Activer les alertes" → accepter la permission
- Vérifier dans Firestore console qu'un document `/users/{uid}` apparaît avec un `fcmToken`
- Si le bouton affiche "Alertes bloquées" : réglages du navigateur → autoriser les notifications pour ce site

**Note navigateurs mobiles**
- iOS : notifications push PWA nécessitent iOS 16.4+ et l'app installée via Safari (pas Chrome/Firefox)
- Android Chrome : fonctionne directement

**Protection anti-abus (à faire à l'étape 4)**
L'auth anonyme laisse n'importe quel chargement créer un uid. Le budget alert à 5€ est le filet de sécurité immédiat. La vraie protection viendra avec **App Check** (étape 4) — vérifie que les requêtes viennent de l'app et pas d'un script.

**Installer l'app sur son téléphone**

*Sur iPhone / iPad (Safari obligatoire)*
1. Ouvrir https://what-to-eat-angelab.web.app dans **Safari** (pas Chrome, pas Firefox — Apple bloque les PWA sur les autres navigateurs)
2. Appuyer sur l'icône **Partager** (carré avec une flèche vers le haut) en bas de l'écran
3. Faire défiler et choisir **"Sur l'écran d'accueil"**
4. Confirmer avec **"Ajouter"**

*Sur Android (Chrome)*
1. Ouvrir https://what-to-eat-angelab.web.app dans **Chrome**
2. Chrome affiche automatiquement une bannière "Ajouter à l'écran d'accueil" — appuyer dessus
3. Si la bannière n'apparaît pas : menu ⋮ → **"Ajouter à l'écran d'accueil"**

**Étape 4 — Auth upgrade + Firestore recettes**

Ordre : 4a → 4b → 4c. Chaque sous-étape validée avant la suivante.

**4a — Auth : Google Sign-In** ✅
- Magic Link retiré : Firebase Dynamic Links est abandonné — le lien ne rouvrirait pas la PWA sur mobile
- Passkeys skippés : Firebase Auth ne supporte pas WebAuthn nativement
- **Google** : `linkWithPopup(GoogleAuthProvider)` sur le compte anonyme — préserve l'UID et toutes les données Firestore. Sur nouvel appareil : `signInWithPopup` retrouve le même UID. Cas "compte déjà existant" géré (`auth/credential-already-in-use` → `signInWithPopup`).
- Point d'entrée : bouton "Sauvegarder mes données" dans MenuDrawer — un tap, Google popup, terminé
- Une fois connectée : affiche l'email dans le menu + "Se déconnecter"
- **Firebase console à activer** : Authentication → Sign-in methods → Google → Activer

**4b — Recettes dans Firestore** (dépend de 4a)
- `useRecipes` migré de IndexedDB → `/users/{uid}/recipes/`
- Migration Option B : au premier sign-in, les recettes IndexedDB locales sont copiées vers Firestore. Ensuite IndexedDB n'est plus utilisé pour les recettes — source unique.
- Survit au changement d'appareil

**4c — Catalogue images** ⏳ en attente — images gardées en IndexedDB local

Raison : Firebase Storage est payant au-delà du free tier Blaze. Les images en base64 dans IndexedDB coûtent €0.

Free tier Blaze (inclus, €0) : 5 GB stockage · 1 GB téléchargements/jour · 20 000 uploads/jour

1 utilisatrice en test : photos redimensionnées à 480px max, JPEG 0.72 → ~50–150 KB/image. 50 produits avec photo → ~5 MB total. 10 ouvertures/jour, 50 images → ~7 MB/jour. **Coût : €0.** À activer quand il y a des revenus (500 users = ~€2.88/jour de téléchargements).

**Étape 5 — Monétisation**
- Contacter ONEM pour autorisation activité accessoire (obligatoire avant)
- Intégrer LemonSqueezy (7 semaines d'essai → 2,99€/mois)
- Webhook LemonSqueezy → Cloud Function → statut dans Firestore
- Désactivation douce Firebase si non-abonné (app locale reste fonctionnelle)

---

## Modèle économique

**7 semaines gratuites, puis 2,99€/mois.**

Les 7 semaines sont délibérées : le persona TDAH a besoin de ce temps pour construire une habitude et traverser plusieurs cycles d'achat anti-gaspi avant de percevoir la valeur. Un essai de 7 jours serait insuffisant.

**Ce qui reste gratuit pour toujours**
- L'app locale (IndexedDB) — stock, planning, liste de courses
- Aucune fonctionnalité de base bloquée

**Ce qui nécessite un abonnement après l'essai**
- Notifications push hors-app (expiration produits)
- Synchronisation cross-device
- Catalogue images personnel
- Sauvegarde des recettes dans le cloud

**Flux d'essai**

| Moment | Ce qui se passe |
|---|---|
| Jour 1 | Firebase actif silencieusement, essai déclenché |
| Semaine 6 | Notification douce "Plus que 7 jours gratuits" |
| Semaine 7 | Invite à s'abonner — si refus, Firebase désactivé, local reste fonctionnel |
| Après paiement | Abonnement actif, renouvellement mensuel automatique |

**Décision actée : LemonSqueezy** (pas Stripe)

Pas d'Apple/Google store → pas de commission 30%.

| | Stripe | LemonSqueezy |
|---|---|---|
| Commission | 1,5% + 0,25€ → ~1,71€ net/mois | ~5% → ~1,89€ net/mois (pas de frais fixe) |
| TVA européenne | À gérer manuellement (ou TaxJar) | Incluse automatiquement |
| Webhook backend | Oui — Cloud Function requise | Simplifié |
| Complexité | Plus élevée | Moindre |

LemonSqueezy est "Merchant of Record" — c'est légalement eux qui vendent, pas toi. Ils collectent et reversent la TVA dans chaque pays EU automatiquement. Tu reçois l'argent net, sans déclaration TVA à gérer.

**Décomposition à 2,99€ TTC (TVA belge 21% incluse)**

| | |
|---|---|
| Prix payé par l'abonné | 2,99€ |
| TVA 21% → LemonSqueezy → fisc | -0,52€ |
| Commission LemonSqueezy (5%) | -0,12€ |
| **Revenu brut dev** | **2,35€** |

**Scénario A — Dev en revenus divers (33% flat)**

| | /user/mois | 50 users | 100 users | 500 users |
|---|---|---|---|---|
| Net après LS + TVA | 2,35€ | 117,50€ | 235€ | 1 175€ |
| Impôt BE 33% | -0,78€ | -38,77€ | -77,55€ | -387,75€ |
| **Net** | **1,57€** | **78,73€** | **157,45€** | **787,25€** |

Pas de cotisations sociales. Déclaré annuellement sur la fiche fiscale. Solution la plus simple.

**Scénario B — Dev indépendante complémentaire**

| | /user/mois | 50 users | 100 users | 500 users |
|---|---|---|---|---|
| Net après LS + TVA | 2,35€ | 117,50€ | 235€ | 1 175€ |
| Cotisations sociales ~20,5% | -0,48€ | -24,09€ | -48,18€ | -240,88€ |
| Impôt marginal ~45% | -0,84€ | -42,03€ | -84,07€ | -420,36€ |
| **Net** | **1,03€** | **51,38€** | **102,75€** | **513,76€** |

Plus de charges mais permet de déduire les frais (Firebase, domaine, matériel). Ne vaut le coup qu'à partir de ~200 users ou si les dépenses déductibles sont significatives.

**Seuils critiques**
- **~50 users** → montants fiscalement visibles, à déclarer sérieusement
- **~500 users** → Firebase peut dépasser le free tier Storage (5GB)
- TVA : jamais à gérer (LemonSqueezy s'en charge toujours)

**Verdict :** le scénario A (revenus divers, 33%) est meilleur à ce niveau — pas de cotisations sociales, déclaration simple. Devenir indépendante n'a de sens qu'à partir de ~600€/mois bruts ou si les frais déductibles sont significatifs. En revenus divers, aucune dépense n'est déductible.

> # ⚠️ DEMANDER AUX NANA DE LA FORMATION COMMENT ELLES FONT
> Avant toute décision sur la structure juridique, les taxes ou l'ONEM — demander aux autres participantes de la formation comment elles ont géré ça. Quelqu'un a sûrement déjà résolu ce problème.

**Situation réelle : dev au chômage en Belgique.**
Ni salariée ni indépendante — les allocations de chômage impliquent une règle spécifique : tout revenu d'activité doit être déclaré à l'ONEM, et une autorisation d'activité accessoire doit être obtenue AVANT d'encaisser le premier euro. Sans ça, risque de récupération des allocations. Démarche : contacter son syndicat (CSC / FGTB / CGSLB) ou l'ONEM directement. À faire avant d'activer LemonSqueezy.

**L'anonymat a une limite** : les 7 semaines d'essai fonctionnent en anonyme, mais l'abonnement force la création d'un compte.

---

## Domaine custom

### Pourquoi c'est important

La popup Google Sign-In affiche le domaine depuis lequel l'utilisatrice lance la connexion. Actuellement elle voit : *"Accéder à l'application what-to-eat-angelab.firebaseapp.com"*. Pour une app commerciale, ce domaine technique brise la confiance et l'image de marque. Il faut un vrai domaine avant tout lancement public.

### Quand le faire

À l'étape 5 — juste avant d'ouvrir les abonnements LemonSqueezy. Le domaine doit être stable avant que des utilisatrices payantes s'inscrivent (changer de domaine après = elles doivent réinstaller la PWA et perdent leurs données IndexedDB locales).

### Comment le faire (dans l'ordre)

**Étape 1 — Acheter un domaine**
Chez un registrar : Namecheap, OVH, Cloudflare Registrar (le moins cher). Choisir une extension courte : `.app`, `.io`, `.fr`. Exemple : `whattoeat.app`.

**Étape 2 — Connecter le domaine à Firebase Hosting**
1. Firebase Console → Hosting → ton site → "Add custom domain"
2. Entrer le domaine (`whattoeat.app`)
3. Firebase affiche deux enregistrements DNS de type **A** avec ses adresses IP
4. Aller chez le registrar → DNS settings → ajouter ces deux enregistrements A
5. Attendre la propagation DNS : 10 minutes à 48h selon le registrar
6. Firebase détecte automatiquement les enregistrements et provisionne le certificat HTTPS — rien d'autre à faire

**Étape 3 — Autoriser le domaine dans Firebase Auth**
Firebase Console → Authentication → Settings → Authorized domains → "Add domain" → entrer `whattoeat.app`.
Sans cette étape, la popup Google est bloquée depuis le nouveau domaine avec une erreur `auth/unauthorized-domain`.

**Étape 4 — Mettre à jour l'écran de consentement Google**
Google Cloud Console → APIs & Services → OAuth consent screen.
- "App name" : changer en `What to eat` (c'est le nom affiché en haut de la popup Google)
- "Authorized domains" : ajouter `whattoeat.app`
- Sauvegarder — la popup affiche immédiatement le nouveau nom

### Ce que ça change pour la PWA

- L'app, le Service Worker et les notifications push fonctionnent depuis le nouveau domaine
- Firebase garde `what-to-eat-angelab.web.app` actif en parallèle — les deux URLs fonctionnent
- **Attention migration** : le Service Worker est lié à l'origine. Les utilisatrices qui ont installé la PWA depuis l'ancienne URL doivent désinstaller et réinstaller. Leurs données IndexedDB locales (stock, planning, liste) sont perdues sur le nouveau domaine — seules les données Firestore (recettes, abonnement) survivent.

### Firebase Hosting vs Vercel

Un domaine custom ne peut pointer que vers une seule destination (DNS). Pour cette app, Firebase Hosting est le bon choix — le SW, FCM et Auth y sont natifs. Vercel peut rester pour les previews de branches de dev, mais le domaine principal va sur Firebase Hosting.

---

## SEO & métadonnées

**Fait ✅**
- `<title>What to eat</title>` — présent
- `lang="fr"` sur `<html>` — correct
- Google Fonts avec `preconnect` — performances optimisées
- `maximum-scale=1.0` **supprimé** — était une violation WCAG 1.4.4 (bloque le zoom utilisateur)

**À faire**

Meta description (impact SEO direct) :
```html
<meta name="description" content="Gère ton frigo, réduis le gaspillage. Suis tes dates de péremption et reçois des rappels avant qu'un produit ne soit perdu." />
```

Open Graph (prévisualisations WhatsApp, Messenger, Twitter) :
```html
<meta property="og:title" content="What to eat" />
<meta property="og:description" content="Gère ton frigo, réduis le gaspillage." />
<meta property="og:image" content="https://[domaine]/og-image.png" />
<meta property="og:url" content="https://[domaine]/" />
<meta property="og:type" content="website" />
```

Note fonts : Google Fonts en `<link>` bloque légèrement le rendu initial. Envisager de passer les fonts en self-hosted pour améliorer le score Lighthouse.

---

## Ce qu'on ne fait PAS en v1

- Pas de liste de courses générée automatiquement
- Pas de score nutritionnel
- Pas de partage / multi-utilisateur
- Pas de profil ou préférences alimentaires
- Pas d'IA pour la suggestion de recette
- Pas de monétisation active en v1

**L'objectif unique de la v1 : elle ouvre l'app et sait quoi manger ce soir en moins de 10 secondes.**
