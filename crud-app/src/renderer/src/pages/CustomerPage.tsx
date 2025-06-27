import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {Item} from 'src/types/item'
import Cart from "@renderer/components/Cart"
import CategorySidebar from "@renderer/components/CategorySidebar"
import ItemMenu from "@renderer/components/ItemMenu"
import SearchBar from "@renderer/components/SearchBar"
import LoadingBlur from '@renderer/components/LoadingBlur'
import CustomerSidebar from '@renderer/components/CustomerSidebar'
import Favorites from '@renderer/components/Favorites'
import OrderSummary from '@renderer/components/OrderSummary'
import PaymentSection from '@renderer/components/PaymentSection'
import CustomerHistory from '@renderer/components/CustomerHistory'


const useCartOperations = () => {
  const [cartMap, setCartMap] = useState<Map<string, {item: Item, amount: number}>>(new Map())

  const addToCart = useCallback((newItem: Item) => {
    console.log('Adding ', newItem);
    setCartMap(prevCart => {
      const newCart = new Map(prevCart)
      const existingEntry = newCart.get(newItem.id!)
      
      if (existingEntry) {
        newCart.set(newItem.id!, { item: existingEntry.item, amount: existingEntry.amount + 1 })
      } else {
        newCart.set(newItem.id!, { item: newItem, amount: 1 })
      }
      return newCart
    })
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setCartMap(prevCart => {
      const newCart = new Map(prevCart)
      newCart.delete(id)
      return newCart
    })
  }, [])

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCartMap(prevCart => {
      const newCart = new Map(prevCart)
      const entry = newCart.get(id)
      
      if (!entry) return prevCart
      
      const newAmount = entry.amount + delta
      if (newAmount <= 0) {
        newCart.delete(id)
      } else {
        newCart.set(id, { ...entry, amount: newAmount })
      }
      return newCart
    })
  }, [])

  const clearCart = useCallback(() =>{
    setCartMap(new Map())
  }, [])

  const increaseQuantity = useCallback((id: string) => updateQuantity(id, 1), [updateQuantity])
  const decreaseQuantity = useCallback((id: string) => updateQuantity(id, -1), [updateQuantity])

  return {
    cartMap,
    clearCart,
    setCartMap,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity
  }
}

const useFavorites = () => {
  const [favoriteItems, setFavoriteItems] = useState<Item[]>([])
  const [favoriteItemIds, setFavoriteItemIds] = useState<Set<string>>(new Set())

  const addToFavorites = useCallback(async (item: Item) => {
    try {
      const result = await window.electron.ipcRenderer.invoke('add-to-favorites', item.id)
      if (result.success) {
        setFavoriteItems(prev => [...prev, item])
        setFavoriteItemIds(prev => new Set([...prev, item.id!]))
      } else {
        console.warn('Failed to add to favorites:', result.message)
      }
    } catch (error) {
      console.error('Error adding to favorites:', error)
    }
  }, [])

  const removeFromFavorites = useCallback(async (itemId: string) => {
    try {
      const result = await window.electron.ipcRenderer.invoke('remove-from-favorites', itemId)
      if (result.success) {
        setFavoriteItems(prev => prev.filter(item => item.id !== itemId))
        setFavoriteItemIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(itemId)
          return newSet
        })
      } else {
        console.warn('Failed to remove from favorites:', result.message)
      }
    } catch (error) {
      console.error('Error removing from favorites:', error)
    }
  }, [])

  const loadFavorites = useCallback(async () => {
    try {
      const favorites = await window.electron.ipcRenderer.invoke('get-customer-favorites')
      setFavoriteItems(favorites)
      setFavoriteItemIds(new Set(favorites.map((item: Item) => item.id!)))
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }, [])

  const isItemFavorited = useCallback((itemId: string) => {
    return favoriteItemIds.has(itemId)
  }, [favoriteItemIds])

  return {
    favoriteItems,
    favoriteItemIds,
    addToFavorites,
    removeFromFavorites,
    loadFavorites,
    isItemFavorited
  }
}

const useItems = () => {
  // the actual item that is gonna get displayed later
  const [items, setItems] = useState<Item[]>([])

  // category title on sidebar
  const [categories, setCategories] = useState<string[]>([])

  // special deal items
  const [specialDeals, setSpecialDeals] = useState<Item[]>([]);

  // the item title before the menu
  const [itemMenuTitle, setItemMenuTitle] = useState<string>('All Items')

  // cache
  const categoryAndItem = useRef<Map<string, Item[]>>(new Map())

  const handleGetItems = useCallback(async (category: string, search: string) => {
    // Handle search
    if (search !== '') {
      const regex = new RegExp(search, 'i')
      const itemsMatched: Item[] = []
      
      categoryAndItem.current.forEach((items: Item[]) => {
        items.forEach((item) => {
          if (regex.test(item.name)) {
            itemsMatched.push(item)
          }
        })
      })
      
      setItemMenuTitle(`Showing '${search}'`)
      setItems(itemsMatched)
      return
    }

    // Handle "all items" case, this is also executed on load
    if (category === '') {
      if (categoryAndItem.current.size === 0) {
        const allItems = await window.electron.ipcRenderer.invoke('get-available-item')
        
        // Cache items by category
        allItems.forEach((item) => {
          const categoryItems = categoryAndItem.current.get(item.category) || []
          categoryItems.push(item)
          categoryAndItem.current.set(item.category, categoryItems)
        })
        
        setItems(allItems)
      } else {
        const allItems = Array.from(categoryAndItem.current.values()).flat()
        setItems(allItems)
      }

      if(specialDeals.length === 0){
        const specialDealItems : Item[] = await window.electron.ipcRenderer.invoke('get-special-deals');
        setSpecialDeals(specialDealItems);
        console.log('special deals set', specialDeals);
      }

      setItemMenuTitle('All Items')
      return
    }

    // Special deal category is a special case
    if (category === 'Special deals'){
      console.log('calleddd')
      console.log('special deals: ', specialDeals);
      setItems(specialDeals);
      setItemMenuTitle('Special Deals');
      return;
    }


    // Handle specific category
    if (categoryAndItem.current.has(category)) {
      setItems(categoryAndItem.current.get(category) ?? [])
      setItemMenuTitle(category)
      return
    }

    // Fetch new category that was not on the cache
    // const fetchedItems = await window.electron.ipcRenderer.invoke('get-item', category, search)
    // categoryAndItem.current.set(category, fetchedItems)
    // setItems(fetchedItems)
    // setItemMenuTitle(category)
  }, [specialDeals])

  const isLoading = useMemo(() => categoryAndItem.current.size <= 0, [categoryAndItem.current.size])

  return {
    items,
    categories,
    setCategories,
    itemMenuTitle,
    handleGetItems,
    isLoading
  }
}

type CustomerSection = 'Ordering' | 'Summary' | 'Payment' | 'Favorite' | 'History'

export default function CustomerPage({ onChangePage }: { onChangePage: (p: PageName) => void }): React.JSX.Element {
  const [currentSection, setCurrentSection] = useState<CustomerSection>('Ordering')
  
  const cartOperations = useCartOperations()
  const favoriteOperations = useFavorites()
  const itemOperations = useItems()

  const handleChangeSection = useCallback((customerSection: CustomerSection) => {
    setCurrentSection(customerSection)
  }, [])

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load items and categories
        await itemOperations.handleGetItems('', '')
        const categoriesData = await window.electron.ipcRenderer.invoke('get-unique-category')
        itemOperations.setCategories(categoriesData)

        // Load cart data
        const cartData = await window.electron.ipcRenderer.invoke('get-customer-cart')
        cartOperations.setCartMap(prevCart => {
          const newCart = new Map(prevCart)
          cartData.forEach((itemAndAmount: any) => {
            newCart.set(itemAndAmount.item.id, {
              item: itemAndAmount.item,
              amount: itemAndAmount.amount
            })
          })
          return newCart
        })

        // Load favorites
        await favoriteOperations.loadFavorites()
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    }

    loadData()
  }, [])

  const renderSectionContent = () => {
    switch (currentSection) {
      case 'Ordering':
        return (
          <>
            {itemOperations.isLoading && <LoadingBlur loadingMessage='Loading menu...'/>}
            <div className="grid grid-cols-[10rem_1fr_25rem] gap-0 h-full">
              <div className="bg-gray-900">
                <CategorySidebar 
                  onGetItem={itemOperations.handleGetItems}
                  categories={itemOperations.categories}
                  isAdmin={false}
                />
              </div>
              <div className="p-6 overflow-y-auto bg-gray-960">
                <SearchBar onGetItems={itemOperations.handleGetItems} />
                <ItemMenu
                  onAddToCart={cartOperations.addToCart}
                  items={itemOperations.items}
                  itemMenuTitle={itemOperations.itemMenuTitle}
                  onAddToFavorites={favoriteOperations.addToFavorites}
                  onRemoveFromFavorites={favoriteOperations.removeFromFavorites}
                  isItemFavorited={favoriteOperations.isItemFavorited}
                />
              </div>
              <div className="bg-gray-900">
                <Cart
                  cartMap={cartOperations.cartMap}
                  onIncrease={cartOperations.increaseQuantity}
                  onDecrease={cartOperations.decreaseQuantity}
                  onRemove={cartOperations.removeFromCart}
                  onChangeSection={handleChangeSection}
                />
              </div>
            </div>
          </>
        )

      case 'Summary':
        return <OrderSummary
          cartMap={cartOperations.cartMap}
          onIncrease={cartOperations.increaseQuantity}
          onDecrease={cartOperations.decreaseQuantity}
          onRemove={cartOperations.removeFromCart}
          onChangeSection={handleChangeSection}
        />

      case 'Payment':
        return <PaymentSection 
          cartMap={cartOperations.cartMap}
          clearCart={cartOperations.clearCart}
        />

      case 'Favorite':
        return (
          <Favorites
            favoriteItems={favoriteOperations.favoriteItems}
            onAddToCart={cartOperations.addToCart}
            onAddToFavorites={favoriteOperations.addToFavorites}
            onRemoveFromFavorites={favoriteOperations.removeFromFavorites}
            isItemFavorited={favoriteOperations.isItemFavorited}
          />
        )

      case 'History':
        return <CustomerHistory onAddToCart={cartOperations.addToCart} />

      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-[4rem_1fr] h-screen bg-background">
      <div className="bg-gray-800">
        <CustomerSidebar
          onChangeSection={handleChangeSection}
          onChangePage={onChangePage}
        />
      </div>
      <div className="h-full w-full">
        {renderSectionContent()}
      </div>
    </div>
  )
}