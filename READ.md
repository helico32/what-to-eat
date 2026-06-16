# Spec produit — What to eat (anti-gaspi TDAH)

## Contexte & persona

**Profil utilisateur** : personne TDAH, pas de permanence des objets, déteste planifier les repas, peu à l'aise avec les finances, goûts simples, aime cuisiner des choses rapides.

**Ce qui fonctionne déjà** : elle achète via une app anti-gaspi (ex. Happy Hour) — les visuels l'aident à n'acheter que l'essentiel, et la date de péremption courte la force à manger rapidement et varié.

**Ce qui ne fonctionne pas** : elle oublie ce qui est dans son frigo, ne sait pas quoi cuisiner, et les produits longue durée (barres de céréales, éponges, sodas) disparaissent de sa mémoire.

---

## Principes de design

- **Simple et local** : pas de compte, pas de panneau d'admin, pas de profil. Tout fonctionne en local (localStorage).
- **Zéro friction cognitive** : chaque action demande le moins de décisions possible.
- **L'image est le centre de gravité** : c'est ce qui déclenche la reconnaissance, pas le nom.
- **L'urgence comme moteur** : les dates courtes sont un levier de motivation, pas un problème.
- **Suggestion, pas planification** : une recette ce soir, pas un menu de la semaine.
- **KISS** : pas de fonctionnalité sans usage concret. Trois lignes de code valent mieux qu'une abstraction prématurée.

---

## Stack technique

- **Framework** : React 18 + Vite
- **CSS** : Tailwind CSS v3
- **Stockage** : localStorage (recettes persistées, pas de backend, pas de compte)
- **Suggestion recette** : recettes ajoutées manuellement par l'utilisatrice (pas d'IA en v1)
- **Structure** : composants découplés, logique dans des hooks custom (`useStore`, `useRecipes`)

---

## Architecture de l'app

### Navigation principale

| Zone | Contenu |
|------|---------|
| **Tabs** (sticky haut) | 🔴 Urgent · 🧊 Frigo · ❄️ Congél · 📦 Placards · Tout |
| **Bottom nav** (fixe bas) | 🛒 Liste de courses · 🍳 Recettes |
| **Titre** | Cliquable → retour à l'onglet Urgent |

### Onglets

| Onglet | Contenu |
|--------|---------|
| 🔴 Urgent | Vue par défaut. Carte "Ce soir" + produits frigo triés par date croissante |
| 🧊 Frigo | Tous les produits frigo triés par urgence, avec compteur |
| ❄️ Congél | Produits du congélateur, avec compteur |
| 📦 Placards | Produits longue durée + rappel hebdomadaire passif, avec compteur |
| Tout | Liste complète tous emplacements confondus |

### Pages full-screen (bottom nav)

| Page | Contenu |
|------|---------|
| 🛒 Liste de courses | Items à acheter avec checkbox, effacement des cochés, badge compteur dans la nav |
| 🍳 Recettes | Gestion des recettes sauvegardées : consulter, ajouter, supprimer |

---

## Vue "Urgent" (écran d'accueil par défaut)

- **Carte "Ce soir"** en haut : une recette tirée de la liste personnelle, avec nom en gras, temps de préparation, chips ingrédients colorés par urgence.
- Deux boutons distincts : **"Voir la recette"** (CTA primaire sombre) et **⇄** (bouton amber = recette aléatoire parmi les recettes sauvegardées).
- **Liste prioritaire** en dessous : produits triés par date, avec badge coloré (rouge < 2 jours, amber < 5 jours, vert sinon).

---

## Actions sur les produits

Chaque ligne produit expose directement :
- **🛒** → demande confirmation inline ("Ajouter X à la liste ?") → ajoute à la liste de courses
- **✕** → demande confirmation inline ("Supprimer X ?") → supprime du stock
- Pas de modal intermédiaire : la confirmation apparaît dans la ligne elle-même.

---

## Parcours utilisateur — Ajout d'un produit

### Étape 1 — Source de l'image

Grille 2×2 :
- **Galerie** : photo déjà prise
- **Screenshot** : import direct d'un screenshot Happy Hour (l'IA extrait visuels + nom)
- **Code-barres** : pour les produits emballés standards
- **Saisie rapide** : champ texte + icône générique (→ placard par défaut)

### Étape 2 — Détails du produit

| Champ | Comportement |
|-------|-------------|
| **Nom** | Pré-rempli par l'IA depuis la photo |
| **Quantité** | Boutons +/−, défaut : 1. Unité : "pièce(s)" |
| **Date de péremption** | Pills : Demain / 3 jours / 1 semaine / 1 mois / Pas de date |

### Étape 3 — Emplacement

Trois boutons larges : **Frigo** (défaut pour les frais) · **Congélateur** · **Placard**
Suggestion contextuelle affichée sans imposer.

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

## Page Recettes

- Liste des recettes sauvegardées localement (localStorage).
- Par défaut, les deux recettes d'exemple sont pré-chargées au premier lancement.
- Chaque recette affiche : emoji · nom · temps · chips ingrédients.
- **Consulter** : tap sur la carte → bottom sheet avec ingrédients + étapes numérotées.
- **Ajouter** : formulaire modal avec emoji preset, nom, temps, ingrédients (tag input), étapes (liste ordonnée).
- **Supprimer** : bouton ✕ avec confirmation Oui / Non inline.
- Ce sont ces recettes qui alimentent la carte "Ce soir" (rotation aléatoire via ⇄).

---

## Liste de courses

- Page dédiée accessible depuis la bottom nav.
- Badge compteur affiche le nombre d'items non cochés.
- Items cochés apparaissent en bas, barrés et estompés.
- Bouton "Effacer cochés" pour nettoyer la liste.

---

## Ce qu'on ne fait PAS en v1

- Pas de liste de courses générée automatiquement
- Pas de score nutritionnel
- Pas de partage / multi-utilisateur
- Pas de synchronisation cloud
- Pas de planification de menus
- Pas de profil ou préférences alimentaires
- Pas d'IA pour la suggestion de recette (remplacée par les recettes manuelles)

**L'objectif unique de la v1 : elle ouvre l'app et sait quoi manger ce soir en moins de 10 secondes.**
