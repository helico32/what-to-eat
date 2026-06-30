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

**localStorage est suffisant.**
Pas de backend, pas de cloud, pas de sync, pas de compte. Tant que c'est vrai, on ne l'interroge pas.

**L'état distribué est un risque.**
Quand deux clés localStorage doivent rester cohérentes (ex. `wte-meals` et le stock produit), c'est une dette à documenter, pas à ignorer.

**La dette technique se documente ici.**
Pas dans des TODO dans le code. Pas dans des tickets. Dans ce fichier, section "Points de vigilance".

---

### Points de vigilance actuels

- **`MealGroupsList`** fait trop de choses (affichage, état check, rename, confirm delete, logique mangé/rangé). Candidat au découpage si ça grossit encore.
- **Cohérence stock / planning** : quand on ajoute un produit au planning, le stock diminue immédiatement. Si l'app crash avant confirmation, le stock est faux. Acceptable en v1, à corriger si on ajoute une sync.
- **Pente glissante planning** : le planning n'est PAS un planificateur de menus. C'est une externalisation de mémoire — "je prévois d'utiliser ce produit tel jour avant qu'il périsse". Toute feature qui ressemble à "planifier ses repas" est hors scope. La question à se poser : "est-ce que ça aide à ne pas oublier un produit ?" Si non, on ne le fait pas.

---

## Contexte & persona

**Profil utilisateur** : personne TDAH, pas de permanence des objets, déteste planifier les repas, peu à l'aise avec les finances, goûts simples, aime cuisiner des choses rapides.

**Ce qui fonctionne déjà** : elle achète via une app anti-gaspi (ex. Happy Hour) — les visuels l'aident à n'acheter que l'essentiel, et la date de péremption courte la force à manger rapidement et varié.

**Ce qui ne fonctionne pas** : elle oublie ce qui est dans son frigo, ne sait pas quoi cuisiner, et les produits longue durée (barres de céréales, éponges, sodas) disparaissent de sa mémoire.

---

## Principes de design

- **Simple et local** : pas de compte, pas de panneau d'admin, pas de profil. Tout fonctionne en localStorage.
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
- **Stockage** : localStorage uniquement — pas de backend, pas de compte
- **Structure** : composants découplés, logique dans des hooks custom

### Hooks

| Hook | Rôle |
|------|------|
| `useStore` | Produits + liste de courses (localStorage) |
| `useRecipes` | Recettes : CRUD, favoris, réordonnancement |
| `useMeals` | Planning de repas : meals + groupes "repas" (localStorage) |
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
- `MealGroupsList` : affiche les groupes "repas" + les meals sans groupe ("Sans nom").
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
