import { useState, useCallback } from 'react'
import { initialProducts } from '../data/products'

const KEYS = {
  products:     'wte-products',
  shoppingList: 'wte-shopping',
}

function load(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

// One-time migration: daysLeft (number) → expiryDate (ISO string)
function migrateProducts(products) {
  return products.map(p => {
    if ('expiryDate' in p) return p
    if (!p.daysLeft) return { ...p, expiryDate: null }
    const d = new Date()
    d.setDate(d.getDate() + p.daysLeft)
    return { ...p, expiryDate: d.toISOString().split('T')[0] }
  })
}

function persist(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

export function useStore() {
  const [products,     setProducts]     = useState(() => migrateProducts(load(KEYS.products, initialProducts)))
  const [shoppingList, setShoppingList] = useState(() => load(KEYS.shoppingList, []))

  const setAndPersistProducts = (updater) => {
    setProducts(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(KEYS.products, next)
      return next
    })
  }

  const setAndPersistShopping = (updater) => {
    setShoppingList(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(KEYS.shoppingList, next)
      return next
    })
  }

  const addProduct = useCallback((product) => {
    setAndPersistProducts(prev => [...prev, { ...product, id: Date.now() }])
  }, [])

  const deleteProduct = useCallback((id) => {
    setAndPersistProducts(prev => prev.filter(p => p.id !== id))
  }, [])

  const decrementProduct = useCallback((id) => {
    setAndPersistProducts(prev => prev.reduce((acc, p) => {
      if (p.id !== id) return [...acc, p]
      const step = p.qty <= 0.5 ? p.qty : 1
      const next = Math.round((p.qty - step) * 10) / 10
      return next > 0 ? [...acc, { ...p, qty: next }] : acc
    }, []))
  }, [])

  const addToShoppingList = useCallback((product) => {
    setAndPersistShopping(prev => {
      const existing = prev.find(p => p.id === product.id)
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, qty: Math.round(((p.qty ?? 1) + 1) * 10) / 10 } : p)
      }
      return [...prev, { ...product, qty: product.qty ?? 1, checked: false }]
    })
  }, [])

  const toggleShoppingItem = useCallback((id) => {
    setAndPersistShopping(prev =>
      prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p)
    )
  }, [])

  const removeFromShoppingList = useCallback((id) => {
    setAndPersistShopping(prev => prev.filter(p => p.id !== id))
  }, [])

  const clearCheckedItems = useCallback(() => {
    setAndPersistShopping(prev => prev.filter(p => !p.checked))
  }, [])

  const reorderShoppingList = useCallback((newList) => {
    setAndPersistShopping(() => newList)
  }, [])

  const reorderProducts = useCallback((newList) => {
    setAndPersistProducts(() => newList)
  }, [])

  return {
    products,
    shoppingList,
    addProduct,
    deleteProduct,
    addToShoppingList,
    toggleShoppingItem,
    removeFromShoppingList,
    clearCheckedItems,
    reorderShoppingList,
    reorderProducts,
    decrementProduct,
  }
}
