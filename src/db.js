import { openDB } from 'idb'

// Clés localStorage de l'ancienne version.
// Utilisées une seule fois pour migrer les données existantes vers IndexedDB.
const LEGACY_KEYS = {
  products:     'wte-products',
  shoppingList: 'wte-shopping',
  meals:        'wte-meals',
  repas:        'wte-repas',
  recipes:      'wte-recipes',
}

// Copie chaque clé localStorage dans le store IndexedDB correspondant,
// puis supprime la clé. Ne s'exécute que si la clé existe encore.
// Si une clé est corrompue, on la saute sans bloquer les autres.
async function migrateFromLocalStorage(db) {
  for (const [store, lsKey] of Object.entries(LEGACY_KEYS)) {
    const raw = localStorage.getItem(lsKey)
    if (!raw) continue
    try {
      const items = JSON.parse(raw)
      const tx = db.transaction(store, 'readwrite')
      for (const item of items) tx.store.put(item)
      await tx.done
      localStorage.removeItem(lsKey)
    } catch {
      // Données corrompues dans ce store : on laisse la clé localStorage intacte.
      // Le hook correspondant la lira comme avant jusqu'à la prochaine tentative.
    }
  }
}

async function openDatabase() {
  const db = await openDB('what-to-eat', 1, {
    upgrade(db) {
      // Chaque store utilise 'id' comme clé primaire — cohérent avec les objets existants.
      db.createObjectStore('products',     { keyPath: 'id' })
      db.createObjectStore('shoppingList', { keyPath: 'id' })
      db.createObjectStore('meals',        { keyPath: 'id' })
      db.createObjectStore('repas',        { keyPath: 'id' })
      db.createObjectStore('recipes',      { keyPath: 'id' })
    },
  })
  await migrateFromLocalStorage(db)
  return db
}

// Les hooks importent cette Promise et font `const db = await dbPromise`.
// IndexedDB étant local, la résolution est quasi-instantanée (~50 ms).
export const dbPromise = openDatabase()
