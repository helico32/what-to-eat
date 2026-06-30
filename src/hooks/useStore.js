import { useState, useEffect } from 'react'
import { dbPromise } from '../db'
import { initialProducts } from '../data/products'

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

export function useStore() {
  const [products,     setProducts]     = useState([])
  const [shoppingList, setShoppingList] = useState([])

  useEffect(() => {
    async function load() {
      const db = await dbPromise

      // --- Produits ---
      const stored = await db.getAll('products')
      if (stored.length === 0) {
        // Premier lancement : on seed avec les produits par défaut.
        const seeded = initialProducts.map((p, i) => ({ ...p, position: i }))
        const tx = db.transaction('products', 'readwrite')
        for (const p of seeded) tx.store.put(p)
        await tx.done
        setProducts(seeded)
      } else {
        // Migration daysLeft → expiryDate si des produits sont encore à l'ancien format.
        // Si rien n'a changé, needsWrite est false et on évite une écriture inutile.
        const migrated = migrateProducts(stored)
        const needsWrite = migrated.some((p, i) => p !== stored[i])
        if (needsWrite) {
          const tx = db.transaction('products', 'readwrite')
          for (const p of migrated) tx.store.put(p)
          await tx.done
        }
        setProducts([...migrated].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)))
      }

      // --- Liste de courses ---
      const shopping = await db.getAll('shoppingList')
      setShoppingList([...shopping].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)))
    }
    load()
  }, [])

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
    setProducts(prev => [...prev, newProduct])
    const db = await dbPromise
    await db.put('products', newProduct)
  }

  const deleteProduct = async (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
    const db = await dbPromise
    await db.delete('products', id)
  }

  const decrementProduct = async (id) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    const nextQty = (product.qty ?? 1) - 1
    const db = await dbPromise
    if (nextQty > 0) {
      const updated = { ...product, qty: nextQty }
      setProducts(prev => prev.map(p => p.id === id ? updated : p))
      await db.put('products', updated)
    } else {
      setProducts(prev => prev.filter(p => p.id !== id))
      await db.delete('products', id)
    }
  }

  const incrementProduct = async (id) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    const updated = { ...product, qty: (product.qty ?? 1) + 1 }
    setProducts(prev => prev.map(p => p.id === id ? updated : p))
    const db = await dbPromise
    await db.put('products', updated)
  }

  const reorderProducts = async (newList) => {
    // On assigne une position à chaque produit selon son nouvel index.
    const withPositions = newList.map((p, i) => ({ ...p, position: i }))
    setProducts(withPositions)
    const db = await dbPromise
    const tx = db.transaction('products', 'readwrite')
    for (const p of withPositions) tx.store.put(p)
    await tx.done
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
    refreshProducts,
  }
}
