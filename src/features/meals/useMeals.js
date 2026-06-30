import { useState, useEffect } from 'react'
import { dbPromise } from '../../db'

export function useMeals({ onProductsChanged }) {
  const [meals, setMeals] = useState([])
  const [repas, setRepas] = useState([])

  // Chargement initial depuis IndexedDB.
  useEffect(() => {
    async function load() {
      const db = await dbPromise
      const [storedMeals, storedRepas] = await Promise.all([
        db.getAll('meals'),
        db.getAll('repas'),
      ])
      setMeals(storedMeals)
      setRepas(storedRepas)
    }
    load()
  }, [])

  const addRepas = async (name, date) => {
    const newRepas = { id: Date.now(), name, date }
    setRepas(prev => [...prev, newRepas])
    const db = await dbPromise
    await db.put('repas', newRepas)
    return newRepas.id
  }

  const renameRepas = async (repasId, newName) => {
    const current = repas.find(r => r.id === repasId)
    if (!current) return
    const updated = { ...current, name: newName }
    setRepas(prev => prev.map(r => r.id === repasId ? updated : r))
    const db = await dbPromise
    await db.put('repas', updated)
  }

  // Crée un groupe nommé et y rattache tous les meals sans groupe du jour.
  const nameNoneMeals = async (name, date) => {
    const id = Date.now()
    const newRepas = { id, name, date }
    setRepas(prev => [...prev, newRepas])
    setMeals(prev => prev.map(m => m.date === date && !m.repasId ? { ...m, repasId: id } : m))
    const db = await dbPromise
    const tx = db.transaction(['meals', 'repas'], 'readwrite')
    tx.objectStore('repas').put(newRepas)
    const allMeals = await tx.objectStore('meals').getAll()
    for (const m of allMeals) {
      if (m.date === date && !m.repasId) tx.objectStore('meals').put({ ...m, repasId: id })
    }
    await tx.done
  }

  // Supprime un groupe et remet toutes ses quantités en stock.
  // Transaction atomique : meals + products + repas — tout ou rien.
  const deleteRepas = async (repasId) => {
    const toCancel = meals.filter(m => m.repasId === repasId)
    setMeals(prev => prev.filter(m => m.repasId !== repasId))
    setRepas(prev => prev.filter(r => r.id !== repasId))
    const db = await dbPromise
    const tx = db.transaction(['meals', 'products', 'repas'], 'readwrite')
    // On lit tous les produits en parallèle AVANT d'écrire quoi que ce soit.
    // Évite le risque d'auto-commit IndexedDB entre deux awaits dans la même transaction :
    // avec Promise.all, toutes les requêtes get() sont en vol simultanément,
    // la transaction reste ouverte, puis on écrit en une seule passe sans await.
    const products = await Promise.all(
      toCancel.map(meal => tx.objectStore('products').get(meal.productId))
    )
    for (const meal of toCancel) tx.objectStore('meals').delete(meal.id)
    products.forEach((p, i) => {
      if (p) tx.objectStore('products').put({ ...p, qty: (p.qty ?? 0) + toCancel[i].qty })
    })
    tx.objectStore('repas').delete(repasId)
    await tx.done
    if (toCancel.length > 0) onProductsChanged()
  }

  // Ajoute un produit au planning et diminue immédiatement son stock.
  // Transaction atomique : meals + products — garantit la cohérence même si l'app crashe.
  const addMeal = async (product, qty, date, repasId = null) => {
    const newMeal = {
      id: Date.now(),
      productId: product.id,
      productSnapshot: {
        name: product.name,
        emoji: product.emoji ?? null,
        image: product.image ?? null,
      },
      qty,
      date,
      repasId: repasId ?? null,
    }
    setMeals(prev => [...prev, newMeal])
    const db = await dbPromise
    const tx = db.transaction(['meals', 'products'], 'readwrite')
    tx.objectStore('meals').put(newMeal)
    const p = await tx.objectStore('products').get(product.id)
    if (p) tx.objectStore('products').put({ ...p, qty: Math.max(0, (p.qty ?? 1) - qty) })
    await tx.done
    onProductsChanged()
  }

  // Confirme un meal : "Mangé" (returnQty = 0) ou "Ranger" (returnQty > 0).
  // - Ranger : remet returnQty en stock.
  // - Mangé : supprime le produit si sa qty en stock est à 0.
  const confirmMeal = async (mealId, returnQty) => {
    const meal = meals.find(m => m.id === mealId)
    if (!meal) return
    setMeals(prev => prev.filter(m => m.id !== mealId))
    const db = await dbPromise
    const tx = db.transaction(['meals', 'products'], 'readwrite')
    tx.objectStore('meals').delete(mealId)
    const p = await tx.objectStore('products').get(meal.productId)
    if (p) {
      if (returnQty > 0) {
        tx.objectStore('products').put({ ...p, qty: (p.qty ?? 0) + returnQty })
      } else if ((p.qty ?? 0) === 0) {
        tx.objectStore('products').delete(meal.productId)
      }
    }
    await tx.done
    onProductsChanged()
  }

  // Annule un meal : remet toute la quantité en stock.
  const cancelMeal = async (mealId) => {
    const meal = meals.find(m => m.id === mealId)
    if (!meal) return
    setMeals(prev => prev.filter(m => m.id !== mealId))
    const db = await dbPromise
    const tx = db.transaction(['meals', 'products'], 'readwrite')
    tx.objectStore('meals').delete(mealId)
    const p = await tx.objectStore('products').get(meal.productId)
    if (p) tx.objectStore('products').put({ ...p, qty: (p.qty ?? 0) + meal.qty })
    await tx.done
    onProductsChanged()
  }

  return { meals, repas, addMeal, addRepas, renameRepas, nameNoneMeals, deleteRepas, confirmMeal, cancelMeal }
}
