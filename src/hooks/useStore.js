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

function persist(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

export function useStore() {
  const [products,     setProducts]     = useState(() => load(KEYS.products,     initialProducts))
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

  const addToShoppingList = useCallback((product) => {
    setAndPersistShopping(prev =>
      prev.find(p => p.id === product.id)
        ? prev
        : [...prev, { ...product, checked: false }]
    )
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
  }
}
