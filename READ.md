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

**La dette technique se documente ici.**
Pas dans des TODO dans le code. Pas dans des tickets. Dans ce fichier, section "Points de vigilance".

---

### Points de vigilance actuels

- **`RepasGroup`** (dans `MealGroupsList.jsx`) : rename + delete confirm + collapse en un seul composant. À surveiller si ça grossit encore.
- **Cohérence stock / planning** : résolue par la migration IndexedDB — `useMeals` modifie le store `products` dans la même transaction que le store `meals`. Plus de risque d'état incohérent.
- **Pente glissante planning** : le planning n'est PAS un planificateur de menus. C'est une externalisation de mémoire — "je prévois d'utiliser ce produit tel jour avant qu'il périsse". Toute feature qui ressemble à "planifier ses repas" est hors scope. La question à se poser : "est-ce que ça aide à ne pas oublier un produit ?" Si non, on ne le fait pas.

### À faire

- **Cibles tactiles** : les boutons sort/mealMode (`w-8 h-8` = 32px) et le `+` du Header (`w-8 h-8` = 32px) sont en dessous des 44px requis par la règle accessibilité. Décision en suspens : les actions secondaires peuvent-elles rester à 32px ? À trancher.
- **mealMode — état actif peu lisible** : le changement de fond seul ne suffit pas pour le persona TDAH ("l'état actif d'un bouton doit être indiscutable"). Proposition en attente de go : afficher un label texte à côté de l'icône quand le mode est actif.
- **Lien urgence → planning absent** : aucun raccourci direct depuis un produit urgent pour le placer sur un jour. Le flux actuel (activer mealMode → taper l'icône → picker) est trop long pour le persona. À creuser.
- **Produit déjà planifié non signalé** : dans le stock, rien n'indique qu'un produit a déjà été placé dans le planning. Risque de le planifier en double.
- **Audit `aria-label` complet** : seuls les boutons sort/mealMode ont été mis à jour. Les autres boutons icônes de l'app (corbeille, panier, shuffle, etc.) sont à auditer.

---

## Contexte & persona

**Profil utilisateur** : personne TDAH, pas de permanence des objets, déteste planifier les repas, peu à l'aise avec les finances, goûts simples, aime cuisiner des choses rapides.

**Ce qui fonctionne déjà** : elle achète via une app anti-gaspi (ex. Happy Hour) — les visuels l'aident à n'acheter que l'essentiel, et la date de péremption courte la force à manger rapidement et varié.

**Ce qui ne fonctionne pas** : elle oublie ce qui est dans son frigo, ne sait pas quoi cuisiner, et les produits longue durée (barres de céréales, éponges, sodas) disparaissent de sa mémoire.

---

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

---

## Principes de design

- **Simple et local** : pas de compte, pas de panneau d'admin, pas de profil. Tout fonctionne en local (IndexedDB).
- **Zéro friction cognitive** : chaque action demande le moins de décisions possible. Chaque réglage exposé à l'utilisateur est une décision cognitive en plus — on n'en ajoute pas sans raison impérative.
- **L'image est le centre de gravité** : c'est ce qui déclenche la reconnaissance, pas le nom.
- **L'urgence comme moteur** : les dates courtes sont un levier de motivation, pas un problème.
- **Suggestion, pas planification** : une recette ce soir, pas un menu de la semaine.
- **KISS** : pas de fonctionnalité sans usage concret. Trois lignes de code valent mieux qu'une abstraction prématurée.
- **Mobile first** : on conçoit et code pour petit écran en premier. Pas de layout desktop à adapter — l'app est max-w-[430px], pensée pour le pouce, pas pour la souris.
- **Accessibilité** : on suit les bonnes pratiques WCAG — contrastes suffisants, cibles tactiles ≥ 44px, labels explicites sur les boutons icônes (`title`, `aria-label`), hiérarchie de titres cohérente, focus visible.

---

## Stack technique

- **Framework** : React 18 + Vite
- **Routing** : React Router DOM (SPA)
- **CSS** : Tailwind CSS v3
- **Stockage** : IndexedDB via `idb` — local, sans backend, sans compte
- **Structure** : composants découplés, logique dans des hooks custom

### Migration IndexedDB — périmètre

| Périmètre | Change ? |
|---|---|
| Interface des hooks (ce qu'ils retournent) | Non — les composants ne voient rien |
| Composants | Non |
| Intérieur des hooks | Oui — chargement initial en `useEffect`, écritures en `await` |
| `persist()` | Remplacé par `await db.put()` |
| `localStorage.getItem` | Remplacé par `await db.getAll()` |
| `src/db.js` | Nouveau fichier, 5 stores |
| Callbacks `onDecreaseQty` / `onIncreaseQty` / `onRemoveIfZero` | Supprimés — `useMeals` écrit directement dans le store `products` via `db` |

Loading : IndexedDB local ≈ 50ms. Pas de spinner — les composants affichent déjà une liste vide au démarrage. Aucune complexité défensive à ajouter.

### Hooks

| Hook | Rôle |
|------|------|
| `useStore` | Produits + liste de courses (localStorage) |
| `useRecipes` | Recettes : CRUD, favoris, réordonnancement |
| `useMeals` | Planning de repas : meals + groupes "repas" (localStorage) |
| `useMealChecklist` | État checklist dans MealGroupsList (checked, rowQtys, Mangé/Ranger) |
| `useSortable` | Drag-and-drop dans les listes produits |

---

## Routes

| Route | Page |
|-------|------|
| `/` | Accueil (tabs + stock) |
| `/liste` | Liste de courses |
| `/recettes` | Recettes sauvegardées |
| `/recettes/new` | Formulaire ajout recette |
| `/recettes/:id` | Détail / édition recette |
| `/planning` | Planning de repas (7 jours) |

---

## Architecture de l'app

### Navigation

- **Header** (fixe haut) : titre (→ retour Urgent), bouton `+`, icône panier (badge items non cochés), menu hamburger
- **MenuDrawer** : tiroir global accessible depuis le hamburger — accès tabs + pages
- **TabBar** : onglets de stock sous le header (visible page `/` seulement)

### Onglets (page `/`)

| Onglet | Contenu |
|--------|---------|
| 🔴 Urgent | Vue par défaut. Repas prévus du jour + produits frigo triés par urgence + proposition recette |
| 🧊 Frigo | Tous les produits frigo, compteur |
| ❄️ Congél | Produits congélateur, compteur |
| 📦 Placards | Produits longue durée, compteur |
| Tout | Liste complète |

Tous les onglets sauf Urgent : bouton tri manuel (drag-and-drop) activable.

### Pages full-screen

| Page | Contenu |
|------|---------|
| `/liste` | Liste de courses : checkbox, +/−, effacer cochés, ajout rapide, ajouter au stock depuis cochés |
| `/recettes` | Recettes : CRUD, favoris, réordonnancement |
| `/planning` | Planning de repas sur 7 jours |

---

## Vue "Urgent" (accueil)

1. **Repas prévus aujourd'hui** (`PlannedMealsSection`) : affiché uniquement si des repas existent pour aujourd'hui — même composant que `/planning`, contexte today.
2. **Liste prioritaire** : produits frigo triés par date, badges colorés.
   - Mode repas (bouton couvert 🍴) : active un picker inline pour affecter un produit à un repas du jour.
3. **Proposition de repas** : carte recette aléatoire avec bouton ⇄.

---

## Planning de repas (`/planning` + `useMeals`)

### Concept — ce que c'est vraiment

**Ce n'est pas un planificateur de menus.** C'est une externalisation de mémoire pour cerveau TDAH.

Le problème résolu : l'utilisatrice a du poulet qui expire demain et des courgettes qui expirent dans 3 jours. Sans aide, elle oublie qu'ils existent. Avec le planning, elle "place" le poulet sur aujourd'hui et les courgettes sur demain — pas pour planifier ce qu'elle mange, mais pour **ne pas oublier de les utiliser avant qu'ils périment**.

L'acte de glisser un produit sur un jour = externaliser la mémoire dans l'app.

La question filtre pour toute nouvelle feature planning : *"est-ce que ça aide à ne pas oublier un produit ?"* Si non, hors scope.

Un repas = un produit du stock réservé pour une date. Quand on ajoute un produit au planning, sa quantité en stock diminue immédiatement. À la confirmation (mangé / rangé), le stock est ajusté.

### Structure de données

- **`meals`** : `{ id, productId, productSnapshot, qty, date, repasId | null }`
- **`repas`** : `{ id, name, date }` — groupe nommé (ex. "Déjeuner", "Dîner")
- Persisté dans `wte-meals` et `wte-repas` (localStorage)

### Page `/planning`

- Sélecteur de jours : 7 jours défilants, point indicateur si repas existants.
- `MealGroupsList` : affiche les groupes "repas" + les meals sans groupe (label : "Encas").
- Bouton `+` dans le header : ouvre le picker de produit sans groupe.
- "Nouveau repas" : crée un groupe nommé via bottom sheet.

### `MealGroupsList`

- Groupes repliables, renommables inline, supprimables (avec confirmation inline).
- Chaque ligne meal : checkbox + ajustement quantité consommée.
- Barre flottante bas quand des items sont cochés : **"Mangé"** (jette la qté non cochée) / **"Ranger"** (remet en stock la qté cochée).
- Aussi utilisé dans `PlannedMealsSection` (vue today sur l'accueil).

### Actions sur un meal

| Action | Effet |
|--------|-------|
| Cocher + "Mangé" | Confirme la consommation, retire du planning, supprime du stock si qty = 0 |
| Cocher + "Ranger" | Remet la quantité en stock, retire du planning |
| Corbeille (ligne) | Annule le repas, remet toute la quantité en stock |
| Supprimer le groupe | Annule tous les meals du groupe, remet les quantités en stock |

---

## Actions sur les produits (stock)

Chaque ligne produit expose directement :
- **🛒** → confirmation inline → ajoute à la liste de courses
- **✕** → confirmation inline → supprime du stock
- **+/−** → incrémente / décrémente la quantité
- **Mode repas** (onglet Urgent) : bouton 🍴 dans la `SectionLabel` active l'ajout au planning

Pas de modal intermédiaire : les confirmations apparaissent dans la ligne.

---

## Parcours utilisateur — Ajout d'un produit

### Étape 1 — Source de l'image

Grille 2×2 :
- **Galerie** : photo déjà prise
- **Screenshot** : import direct d'un screenshot Happy Hour
- **Code-barres** : produits emballés standards
- **Saisie rapide** : champ texte + icône générique (→ placard par défaut)

### Étape 2 — Détails du produit

| Champ | Comportement |
|-------|-------------|
| **Nom** | Pré-rempli par l'IA depuis la photo |
| **Quantité** | Boutons +/−, défaut : 1 |
| **Date de péremption** | Pills : Demain / 3 jours / 1 semaine / 1 mois / Pas de date |

### Étape 3 — Emplacement

Trois boutons larges : **Frigo** (défaut frais) · **Congélateur** · **Placard**

---

## Badges de date

| Couleur | Condition |
|---------|-----------|
| 🔴 Rouge | ≤ 1 jour |
| 🟡 Amber | 2–4 jours |
| 🟢 Vert | ≥ 5 jours |
| 🔵 Bleu | Congélateur |
| ⚪ Neutre | Placard |

---

## Page Recettes (`/recettes`)

- Recettes sauvegardées localement. Deux exemples pré-chargés au premier lancement.
- Chaque recette : emoji · nom · temps · chips ingrédients.
- **Consulter** : tap → détail recette (`/recettes/:id`) avec ingrédients + étapes.
- **Ajouter** : `/recettes/new` — emoji preset, nom, temps, ingrédients, étapes.
- **Éditer** : inline sur la page détail.
- **Favoris** : toggle, favoris remontés en tête.
- **Réordonner** : drag-and-drop.
- **Supprimer** : bouton ✕ avec confirmation Oui / Non inline.
- Ces recettes alimentent la carte "Proposition de repas" (onglet Urgent) : seules les recettes avec au moins un ingrédient en stock sont proposées, triées par ingrédient le plus urgent à consommer. Le bouton ⇄ navigue dans ce pool trié.

---

## Liste de courses (`/liste`)

- Badge compteur (items non cochés) dans le header, toutes pages.
- Items cochés en bas, barrés et estompés.
- Ajout rapide par texte + emoji depuis la page.
- +/− sur chaque item.
- "Effacer cochés" + "Ajouter au stock" (avec choix emplacement + date).

---

## Ce qu'on ne fait PAS en v1

- Pas de liste de courses générée automatiquement
- Pas de score nutritionnel
- Pas de partage / multi-utilisateur
- Pas de synchronisation cloud
- Pas de profil ou préférences alimentaires
- Pas d'IA pour la suggestion de recette

**L'objectif unique de la v1 : elle ouvre l'app et sait quoi manger ce soir en moins de 10 secondes.**
