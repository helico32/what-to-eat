import { useState, useEffect } from 'react'
import { dbPromise } from '../../db'
import { auth, db as firestore } from '../../firebase'
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'

// Migration one-time : les anciens produits utilisaient daysLeft (nombre de jours)
// à la place de expiryDate (date ISO). On convertit au chargement si besoin.
function migrateProducts(products) {
  return products.map(p => {
    if ('expiryDate' in p) return p
    if (!p.daysLeft) return { ...p, expiryDate: null }
    const d = new Date()
    d.setDate(d.getDate() + p.daysLeft)
    return { ...p, expiryDate: d.toISOString().split('T')[0] }
  })
}

// Renvoie l'uid si l'utilisatrice est connectée avec Google, null sinon.
// Vérifié au moment de chaque mutation — pas de mémorisation nécessaire.
function googleUid() {
  const u = auth.currentUser
  return u && !u.isAnonymous ? u.uid : null
}

// Écrit un produit dans Firestore — sans l'image (trop lourde, reste dans IndexedDB).
// updatedAt permet de résoudre les conflits en cas d'usage sur deux appareils.
// Fire-and-forget : Firestore met l'écriture en file offline si pas de réseau.
function pushProduct(uid, product) {
  // eslint-disable-next-line no-unused-vars
  const { image, ...fields } = product
  setDoc(doc(firestore, 'users', uid, 'products', product.id), {
    ...fields,
    updatedAt: new Date().toISOString(),
  }).catch(() => {})
}

// Supprime un produit de Firestore. Fire-and-forget.
function removeProduct(uid, id) {
  deleteDoc(doc(firestore, 'users', uid, 'products', id)).catch(() => {})
}

// Dénormalise la prochaine date d'expiration sur le doc /users/{uid}.
// La Cloud Function filtre avec where('nextExpiry', '<=', dans2Jours)
// au lieu de scanner tous les users — lecture O(concernés) au lieu de O(tous).
// Fire-and-forget : pas bloquant, Firestore file l'écriture si hors-ligne.
function pushNextExpiry(uid, products) {
  const dates = products.map(p => p.expiryDate).filter(Boolean)
  const nextExpiry = dates.length > 0 ? dates.sort()[0] : null
  setDoc(doc(firestore, 'users', uid), { nextExpiry }, { merge: true }).catch(() => {})
}

export function useStore() {
  const [products,     setProducts]     = useState([])
  const [shoppingList, setShoppingList] = useState([])

  useEffect(() => {
    async function load() {
      const idb = await dbPromise
      await auth.authStateReady()

      const uid = googleUid()

      // Utilisatrice Google : si Firestore a des produits, on restaure depuis Firestore.
      // Couvre le cas reinstall PWA + reconnexion Google, et multi-appareils.
      if (uid) {
        const snap = await getDocs(collection(firestore, 'users', uid, 'products'))
        if (!snap.empty) {
          const firestoreProducts = snap.docs.map(d => d.data())
          const tx = idb.transaction('products', 'readwrite')
          await tx.store.clear()
          for (const p of firestoreProducts) tx.store.put(p)
          await tx.done
          setProducts([...firestoreProducts].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)))
          const shopping = await idb.getAll('shoppingList')
          setShoppingList([...shopping].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)))
          return
        }
      }

      // Chargement normal depuis IndexedDB
      // (utilisatrice anonyme, ou Google dont Firestore est encore vide)
      const stored = await idb.getAll('products')
      let finalProducts
      if (stored.length === 0) {
        finalProducts = []
      } else {
        const migrated = migrateProducts(stored)
        const needsWrite = migrated.some((p, i) => p !== stored[i])
        if (needsWrite) {
          const tx = idb.transaction('products', 'readwrite')
          for (const p of migrated) tx.store.put(p)
          await tx.done
        }
        finalProducts = [...migrated].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity))
      }
      setProducts(finalProducts)

      // Google avec Firestore vide → sync initiale (premier sign-in depuis cet appareil)
      if (uid) {
        for (const p of finalProducts) pushProduct(uid, p)
      }

      const shopping = await idb.getAll('shoppingList')
      setShoppingList([...shopping].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)))
    }
    load()
  }, [])

  // Appelée depuis App.jsx quand l'utilisatrice vient de signer avec Google.
  // Si Firestore a des données (compte existant) → restore dans IndexedDB.
  // Si Firestore est vide (premier sign-in) → pousse les produits locaux.
  const syncAfterGoogleSignIn = async () => {
    const uid = googleUid()
    if (!uid) return

    const snap = await getDocs(collection(firestore, 'users', uid, 'products'))

    if (!snap.empty) {
      const firestoreProducts = snap.docs.map(d => d.data())
      const idb = await dbPromise
      const tx = idb.transaction('products', 'readwrite')
      await tx.store.clear()
      for (const p of firestoreProducts) tx.store.put(p)
      await tx.done
      setProducts([...firestoreProducts].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)))
      pushNextExpiry(uid, firestoreProducts)
    } else {
      // Premier sign-in : les produits locaux deviennent la source Firestore
      const idb = await dbPromise
      const localProducts = await idb.getAll('products')
      for (const p of localProducts) pushProduct(uid, p)
      pushNextExpiry(uid, localProducts)
    }
  }

  // Relit les produits depuis IndexedDB.
  // Appelé par useMeals après une transaction qui modifie le store 'products' directement.
  const refreshProducts = async () => {
    const db = await dbPromise
    const stored = await db.getAll('products')
    setProducts([...stored].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)))
  }

  // --- Produits ---

  const addProduct = async (product) => {
    // crypto.randomUUID() évite les collisions d'id quand addProduct est appelé
    // plusieurs fois dans la même milliseconde (ex: ajout groupé depuis la liste de courses).
    const newProduct = { ...product, id: crypto.randomUUID(), position: products.length }
    const newProducts = [...products, newProduct]
    setProducts(newProducts)
    const db = await dbPromise
    await db.put('products', newProduct)
    const uid = googleUid()
    if (uid) { pushProduct(uid, newProduct); pushNextExpiry(uid, newProducts) }
  }

  const deleteProduct = async (id) => {
    const newProducts = products.filter(p => p.id !== id)
    setProducts(newProducts)
    const db = await dbPromise
    await db.delete('products', id)
    const uid = googleUid()
    if (uid) { removeProduct(uid, id); pushNextExpiry(uid, newProducts) }
  }

  const decrementProduct = async (id) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    const nextQty = (product.qty ?? 1) - 1
    const db = await dbPromise
    const uid = googleUid()
    if (nextQty > 0) {
      const updated = { ...product, qty: nextQty }
      setProducts(prev => prev.map(p => p.id === id ? updated : p))
      await db.put('products', updated)
      if (uid) pushProduct(uid, updated)
    } else {
      const newProducts = products.filter(p => p.id !== id)
      setProducts(newProducts)
      await db.delete('products', id)
      if (uid) { removeProduct(uid, id); pushNextExpiry(uid, newProducts) }
    }
  }

  const incrementProduct = async (id) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    const updated = { ...product, qty: (product.qty ?? 1) + 1 }
    setProducts(prev => prev.map(p => p.id === id ? updated : p))
    const db = await dbPromise
    await db.put('products', updated)
    const uid = googleUid()
    if (uid) pushProduct(uid, updated)
  }

  const updateExpiryDate = async (id, date) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    const updated = { ...product, expiryDate: date || null }
    const newProducts = products.map(p => p.id === id ? updated : p)
    setProducts(newProducts)
    const db = await dbPromise
    await db.put('products', updated)
    const uid = googleUid()
    if (uid) { pushProduct(uid, updated); pushNextExpiry(uid, newProducts) }
  }

  const reorderProducts = async (newList) => {
    // On assigne une position à chaque produit selon son nouvel index.
    const withPositions = newList.map((p, i) => ({ ...p, position: i }))
    setProducts(withPositions)
    const db = await dbPromise
    const tx = db.transaction('products', 'readwrite')
    for (const p of withPositions) tx.store.put(p)
    await tx.done
    const uid = googleUid()
    if (uid) {
      for (const p of withPositions) pushProduct(uid, p)
    }
  }

  // --- Liste de courses ---

  const addToShoppingList = async (product) => {
    if (shoppingList.some(p => p.id === product.id)) return
    const newItem = {
      id: product.id,
      name: product.name,
      emoji: product.emoji ?? null,
      image: product.image ?? null,
      qty: 1,
      checked: false,
      position: shoppingList.length,
      location: product.location ?? 'frigo',
    }
    setShoppingList(prev => [...prev, newItem])
    const db = await dbPromise
    await db.put('shoppingList', newItem)
  }

  const toggleShoppingItem = async (id) => {
    const item = shoppingList.find(p => p.id === id)
    if (!item) return
    const updated = { ...item, checked: !item.checked }
    setShoppingList(prev => prev.map(p => p.id === id ? updated : p))
    const db = await dbPromise
    await db.put('shoppingList', updated)
  }

  const removeFromShoppingList = async (id) => {
    setShoppingList(prev => prev.filter(p => p.id !== id))
    const db = await dbPromise
    await db.delete('shoppingList', id)
  }

  const decrementShoppingItem = async (id) => {
    const item = shoppingList.find(p => p.id === id)
    if (!item) return
    const nextQty = (item.qty ?? 1) - 1
    const db = await dbPromise
    if (nextQty > 0) {
      const updated = { ...item, qty: nextQty }
      setShoppingList(prev => prev.map(p => p.id === id ? updated : p))
      await db.put('shoppingList', updated)
    } else {
      setShoppingList(prev => prev.filter(p => p.id !== id))
      await db.delete('shoppingList', id)
    }
  }

  const incrementShoppingItem = async (id) => {
    const item = shoppingList.find(p => p.id === id)
    if (!item) return
    const updated = { ...item, qty: (item.qty ?? 1) + 1 }
    setShoppingList(prev => prev.map(p => p.id === id ? updated : p))
    const db = await dbPromise
    await db.put('shoppingList', updated)
  }

  const clearCheckedItems = async () => {
    const checkedIds = shoppingList.filter(p => p.checked).map(p => p.id)
    setShoppingList(prev => prev.filter(p => !p.checked))
    const db = await dbPromise
    const tx = db.transaction('shoppingList', 'readwrite')
    for (const id of checkedIds) tx.store.delete(id)
    await tx.done
  }

  const reorderShoppingList = async (newList) => {
    const withPositions = newList.map((p, i) => ({ ...p, position: i }))
    setShoppingList(withPositions)
    const db = await dbPromise
    const tx = db.transaction('shoppingList', 'readwrite')
    for (const p of withPositions) tx.store.put(p)
    await tx.done
  }

  return {
    products,
    shoppingList,
    addProduct,
    deleteProduct,
    addToShoppingList,
    toggleShoppingItem,
    removeFromShoppingList,
    decrementShoppingItem,
    incrementShoppingItem,
    clearCheckedItems,
    reorderShoppingList,
    reorderProducts,
    decrementProduct,
    incrementProduct,
    updateExpiryDate,
    refreshProducts,
    syncAfterGoogleSignIn,
  }
}
