import { useState, useCallback } from 'react'
import { initialProducts } from '../data/products'

export function useStore() {
  const [products, setProducts]         = useState(initialProducts)
  const [shoppingList, setShoppingList] = useState([])

  const addProduct = useCallback((product) => {
    setProducts(prev => [...prev, { ...product, id: Date.now() }])
  }, [])

  const deleteProduct = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }, [])

  const addToShoppingList = useCallback((product) => {
    setShoppingList(prev =>
      prev.find(p => p.id === product.id)
        ? prev
        : [...prev, { ...product, checked: false }]
    )
  }, [])

  const toggleShoppingItem = useCallback((id) => {
    setShoppingList(prev =>
      prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p)
    )
  }, [])

  const removeFromShoppingList = useCallback((id) => {
    setShoppingList(prev => prev.filter(p => p.id !== id))
  }, [])

  const clearCheckedItems = useCallback(() => {
    setShoppingList(prev => prev.filter(p => !p.checked))
  }, [])

  const reorderShoppingList = useCallback((newList) => {
    setShoppingList(newList)
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
  }
}
